import {
  HIDE_POLICY,
  OVERFLOW_POLICY,
  bindOverflowCapture,
  cropVisible,
  filename,
  fitFileSize,
  fitLimits,
  installHideSession,
  limitScale,
  mimeFor,
  runTiledCapture,
  stitch,
  usesQuality,
} from "./core/index.js";
import { getSettings, saveExport } from "./export.js";
import { longshotPushHistory } from "./history.js";

function isBrowserUiPage(url) {
  return /^(chrome|brave|edge|about|view-source):/i.test(url || "");
}

function canInjectIntoTab(url) {
  if (!url || isBrowserUiPage(url)) return false;
  if (/^(chrome-extension|moz-extension|data|blob):/i.test(url)) return false;
  return true;
}

function isOwnExtensionPage(url) {
  try {
    return Boolean(url && url.startsWith(chrome.runtime.getURL("")));
  } catch {
    return false;
  }
}

function sendToTab(tabId, msg, ownPage) {
  if (!ownPage) return chrome.tabs.sendMessage(tabId, msg);
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ ...msg, longshotTargetTabId: tabId }, (res) => {
      const err = chrome.runtime.lastError;
      if (err) reject(new Error(err.message));
      else resolve(res);
    });
  });
}

function stackVertical(top, bottom, scale = 1) {
  const tw = Math.max(1, Math.round(top.width * scale));
  const th = Math.max(1, Math.round(top.height * scale));
  const canvas = createCanvas(Math.max(tw, bottom.width), th + bottom.height);
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(top, 0, 0, tw, th);
  ctx.drawImage(bottom, 0, th);
  return canvas;
}

function createCanvas(width, height) {
  return new OffscreenCanvas(width, height);
}

async function decode(dataUrl) {
  const blob = await (await fetch(dataUrl)).blob();
  return createImageBitmap(blob);
}

async function encode(canvas, { type, quality }) {
  const blob = await canvas.convertToBlob({ type, quality });
  return { size: blob.size, blob };
}

let captureInFlight = false;
let lastCaptureAt = 0;

async function applyActionPopup() {
  const settings = await getSettings();
  await chrome.action.setPopup({ popup: settings.oneClickCapture ? "" : "popup.html" });
}

function startCapture(mode, sendResponse) {
  if (captureInFlight) {
    sendResponse?.({ ok: false, error: "Capture already in progress" });
    return Promise.resolve();
  }
  captureInFlight = true;
  return captureActive(mode || "full", { popup: Boolean(sendResponse) })
    .then((result) => {
      try {
        sendResponse?.({ ok: true, ...result });
      } catch {
        /* popup closed */
      }
    })
    .catch((error) => {
      const message = friendlyError(error);
      try {
        sendResponse?.({ ok: false, error: message });
      } catch {
        /* popup closed */
      }
      void chrome.action.setBadgeText({ text: "!" });
      void chrome.action.setTitle({ title: message });
    })
    .finally(() => {
      captureInFlight = false;
    });
}

void applyActionPopup();
chrome.runtime.onInstalled.addListener(() => void applyActionPopup());
chrome.runtime.onStartup.addListener(() => void applyActionPopup());
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync" && (changes.oneClickCapture || changes.oneClickMode)) {
    void applyActionPopup();
  }
});
chrome.action.onClicked.addListener(async () => {
  const settings = await getSettings();
  if (!settings.oneClickCapture) return;
  void chrome.action.setBadgeText({ text: "" });
  void chrome.action.setTitle({ title: "Capture this page" });
  await startCapture(settings.oneClickMode || "full");
});
chrome.commands.onCommand.addListener((command) => {
  if (command === "capture-full-page") {
    void chrome.action.setBadgeText({ text: "" });
    void chrome.action.setTitle({ title: "Capture this page" });
    void startCapture("full");
  }
});

// Offscreen documents never have focus, so navigator.clipboard.write fails there
// ("Document is not focused"). Write from the captured tab instead, which has focus
// after a keyboard shortcut or one-click capture.
async function copyPngViaTab(tabId, dataUrl) {
  try {
    const [injection] = await chrome.scripting.executeScript({
      target: { tabId },
      args: [dataUrl],
      func: async (url) => {
        try {
          const blob = await (await fetch(url)).blob();
          await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
          return true;
        } catch {
          return false;
        }
      },
    });
    return injection?.result === true;
  } catch {
    return false;
  }
}

function flashBadge(text) {
  void chrome.action.setBadgeBackgroundColor({ color: "#d2d6d0" });
  void chrome.action.setBadgeText({ text });
  setTimeout(() => chrome.action.setBadgeText({ text: "" }), 1800);
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.longshotTargetTabId != null) return;
  if (msg.type === "LONGSHOT_CAPTURE") {
    void chrome.action.setBadgeText({ text: "" });
    startCapture(msg.mode || "full", sendResponse);
    return true;
  }
});

async function ensureContent(tabId) {
  try {
    await chrome.tabs.sendMessage(tabId, { type: "LONGSHOT_PING" });
  } catch {
    await chrome.scripting.executeScript({ target: { tabId }, files: ["content.js"] });
  }
  await chrome.scripting.executeScript({
    target: { tabId },
    func: installHideSession,
    args: [HIDE_POLICY],
  });
  await chrome.scripting.executeScript({
    target: { tabId },
    func: bindOverflowCapture,
    args: [OVERFLOW_POLICY],
  });
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isQuotaError(error) {
  return /MAX_CAPTURE_VISIBLE_TAB_CALLS_PER_SECOND/i.test(String(error?.message || error));
}

function friendlyError(error) {
  const message = String(error?.message || error || "Capture failed");
  if (isQuotaError(error)) {
    return "Chrome limited screenshot speed. Wait a second and try again.";
  }
  return message;
}

function report(text, meta = {}) {
  chrome.runtime.sendMessage({ type: "LONGSHOT_STATUS", text, ...meta }, () => {
    void chrome.runtime.lastError;
  });
}

function captureGapMs() {
  const perSecond = chrome.tabs.MAX_CAPTURE_VISIBLE_TAB_CALLS_PER_SECOND || 2;
  return Math.ceil(1000 / perSecond) + 80;
}

async function captureVisibleTabPaced(windowId) {
  const gap = captureGapMs();
  const wait = lastCaptureAt + gap - Date.now();
  if (wait > 0) await delay(wait);

  let lastError;
  for (let attempt = 0; attempt < 8; attempt++) {
    lastCaptureAt = Date.now();
    try {
      const dataUrl = await chrome.tabs.captureVisibleTab(windowId, { format: "png" });
      if (!dataUrl) throw new Error("Empty capture");
      return dataUrl;
    } catch (error) {
      lastError = error;
      if (!isQuotaError(error)) throw error;
      await delay(1000 + attempt * 250);
    }
  }
  throw lastError;
}

async function finishCapture(canvas, dim, settings, { tab, popup }) {
  const io = { decode, createCanvas, encode };
  canvas = fitLimits(canvas, settings, io);
  canvas = await fitFileSize(canvas, settings, io);
  const mime = mimeFor(settings.format);
  let blob;
  try {
    blob = await canvas.convertToBlob({
      type: mime,
      quality: usesQuality(settings.format) ? settings.quality : 1,
    });
  } catch {
    blob = null;
  }
  // convertToBlob falls back to PNG for types it cannot encode instead of throwing.
  if (!blob || blob.type !== mime) {
    throw new Error(`This browser cannot encode ${String(settings.format).toUpperCase()}`);
  }
  const dataUrl = await blobToDataUrl(blob);
  const record = {
    id: crypto.randomUUID(),
    title: dim.title,
    url: dim.url,
    dataUrl,
    width: canvas.width,
    height: canvas.height,
    format: settings.format,
    createdAt: Date.now(),
    byteSize: blob.size,
  };
  await longshotPushHistory(record);
  await chrome.storage.local.set({ longshotCurrent: record });
  if (settings.autoDownload || (settings.skipEditor && settings.skipEditorAction === "download")) {
    await saveExport(blob, filename(record, settings), settings);
  }
  if (settings.skipEditor) {
    if (settings.skipEditorAction === "download") {
      flashBadge("ok");
      return {};
    }
    const png = mime === "image/png" ? blob : await canvas.convertToBlob({ type: "image/png" });
    if (tab && canInjectIntoTab(tab.url) && (await copyPngViaTab(tab.id, await blobToDataUrl(png)))) {
      flashBadge("ok");
      return {};
    }
    // The popup has focus while it waits, so it can copy from history instead.
    if (popup) return { copyId: record.id };
  }
  await chrome.tabs.create({ url: chrome.runtime.getURL("editor.html") });
  return {};
}

async function captureRegion(tab, settings) {
  await ensureContent(tab.id);
  report("Select an area", { index: 0, total: 1, phase: "select" });
  const rect = await chrome.tabs.sendMessage(tab.id, { type: "LONGSHOT_SELECT_REGION" });
  if (!rect?.w || !rect?.h) throw new Error("Selection cancelled");
  report("Capturing", { index: 1, total: 1, phase: "capture" });
  await delay(60);
  const dataUrl = await captureVisibleTabPaced(tab.windowId);
  const canvas = await cropVisible(dataUrl, rect, rect.devicePixelRatio || 1, { decode, createCanvas });
  return finishCapture(canvas, rect, settings, { tab, popup: false });
}

async function captureVisibleOnly(tab, settings, popup) {
  report("Capturing", { index: 1, total: 1, phase: "capture" });
  const dataUrl = await captureVisibleTabPaced(tab.windowId);
  const bmp = await decode(dataUrl);
  const canvas = createCanvas(bmp.width, bmp.height);
  canvas.getContext("2d").drawImage(bmp, 0, 0);
  return finishCapture(canvas, { title: tab.title || "Page", url: tab.url || "" }, settings, { tab, popup });
}

async function captureActive(mode, { popup = false } = {}) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) throw new Error("No active tab");
  if (isBrowserUiPage(tab.url)) {
    throw new Error("This page cannot be captured");
  }
  const settings = await getSettings();
  const ownPage = isOwnExtensionPage(tab.url);
  if (!ownPage && !canInjectIntoTab(tab.url)) {
    if (mode === "region") {
      throw new Error("Area select is not available on this page. Use visible or full page.");
    }
    return captureVisibleOnly(tab, settings, popup);
  }
  if (mode === "region") {
    if (ownPage) throw new Error("Area select is not available on this page.");
    return captureRegion(tab, settings);
  }
  if (ownPage && mode === "visible") {
    return captureVisibleOnly(tab, settings, popup);
  }
  if (ownPage) {
    try {
      await sendToTab(tab.id, { type: "LONGSHOT_PING" }, true);
    } catch {
      return captureVisibleOnly(tab, settings, popup);
    }
  } else {
    await ensureContent(tab.id);
  }
  // Measuring injects capture CSS and may resize iframes. runTiledCapture undoes that
  // in its finally; if anything fails before it starts, undo it here.
  let resetSent = false;
  let dim;
  let result;
  let shellCanvas = null;
  let dpr = 1;
  try {
    dim = await sendToTab(
      tab.id,
      {
        type: "LONGSHOT_MEASURE",
        expandFrames: Boolean(!ownPage && settings.captureIframes),
        findOverflow: Boolean(settings.captureOverflow && mode === "full"),
      },
      ownPage,
    );
    const overflow = mode === "full" && dim?.overflow;
    const captureDim = overflow
      ? {
          ...dim,
          scrollX: dim.overflow.scrollLeft,
          scrollY: dim.overflow.scrollTop,
          scrollWidth: dim.overflow.scrollWidth,
          scrollHeight: dim.overflow.scrollHeight,
          viewportWidth: dim.overflow.clientWidth,
          viewportHeight: dim.overflow.clientHeight,
        }
      : dim;
    let lastCrop = overflow?.crop || null;
    dpr = dim.devicePixelRatio || 1;
    const shellH = overflow?.crop?.y || 0;
    if (mode === "full" && shellH > 8) {
      const shellShot = await captureVisibleTabPaced(tab.windowId);
      shellCanvas = await cropVisible(
        shellShot,
        { x: 0, y: 0, w: dim.viewportWidth, h: shellH },
        dpr,
        { decode, createCanvas },
      );
    }
    result = await runTiledCapture({
      mode,
      dim: captureDim,
      scroll: async (x, y) => {
        const pos = await sendToTab(tab.id, { type: "LONGSHOT_SCROLL", x, y }, ownPage);
        if (pos?.crop) lastCrop = pos.crop;
        return pos;
      },
      hideChrome: () => sendToTab(tab.id, { type: "LONGSHOT_HIDE_CHROME" }, ownPage),
      reset: (orig) => {
        resetSent = true;
        return sendToTab(tab.id, { type: "LONGSHOT_RESET", x: orig.x, y: orig.y }, ownPage);
      },
      captureTile: async () => {
        const dataUrl = await captureVisibleTabPaced(tab.windowId);
        if (!lastCrop?.w || !lastCrop?.h) return dataUrl;
        const canvas = await cropVisible(dataUrl, lastCrop, dpr, { decode, createCanvas });
        return blobToDataUrl(await canvas.convertToBlob({ type: "image/png" }));
      },
      delay,
      onProgress: ({ index, total, text, phase }) => report(text, { index, total, phase }),
    });
  } finally {
    if (!resetSent) {
      await sendToTab(tab.id, { type: "LONGSHOT_RESET", x: dim?.scrollX, y: dim?.scrollY }, ownPage).catch(() => {});
    }
  }

  report("Stitching", { index: result.shots.length, total: result.shots.length, phase: "stitch" });

  // Scale while stitching so a tall page never needs a full-size canvas.
  const shellPx = shellCanvas ? shellCanvas.height : 0;
  const scale = limitScale(result.fullW * dpr, result.fullH * dpr + shellPx, settings);
  let canvas = await stitch(
    result.shots,
    { fullW: result.fullW, fullH: result.fullH, dpr, scale },
    { decode, createCanvas },
  );
  if (shellCanvas) canvas = stackVertical(shellCanvas, canvas, scale);
  canvas = compositeChrome(canvas, dim, settings);
  return finishCapture(canvas, dim, settings, { tab, popup });
}

function chromeHeight(settings) {
  if (settings.includeBrowserBar) return 86;
  if (settings.includeUrlBar) return 36;
  return 0;
}

function compositeChrome(source, dim, settings) {
  const extra = chromeHeight(settings);
  if (!extra) return source;
  const canvas = new OffscreenCanvas(source.width, source.height + extra);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#e8e6e1";
  ctx.fillRect(0, 0, canvas.width, extra);
  ctx.fillStyle = "#3a3834";
  ctx.font = "500 16px sans-serif";
  ctx.fillText((dim.url || "").slice(0, 80), 20, extra === 86 ? 68 : 24);
  if (settings.includeBrowserBar) {
    ctx.fillStyle = "#d4d1cb";
    ctx.fillRect(0, 0, canvas.width, 40);
    ["#e15a4a", "#e0b84e", "#5e9a7a"].forEach((c, i) => {
      ctx.beginPath();
      ctx.fillStyle = c;
      ctx.arc(22 + i * 18, 20, 6, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.fillStyle = "#3a3834";
    ctx.fillText((dim.title || "Page").slice(0, 40), 92, 26);
  }
  ctx.drawImage(source, 0, extra);
  return canvas;
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

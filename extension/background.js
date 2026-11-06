import {
  HIDE_POLICY,
  OVERFLOW_POLICY,
  bindOverflowCapture,
  cropVisible,
  compositeModal,
  filename,
  fitFileSize,
  fitLimits,
  installHideSession,
  limitScale,
  mimeFor,
  runTiledCapture,
  stitch,
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

// CaptureVisibleTab selects by window, so a tab change invalidates the entire capture.
function createCaptureGuard(tab) {
  let error;
  let rejectCancelled;
  const cancelled = new Promise((_, reject) => { rejectCancelled = reject; });
  cancelled.catch(() => {});
  const cancel = () => {
    if (!error) {
      error = new Error("Capture cancelled because the page or active tab changed. Try again on the intended page.");
      rejectCancelled(error);
    }
  };
  const activated = (info) => { if (info.windowId === tab.windowId && info.tabId !== tab.id) cancel(); };
  const readDocument = async () => {
    const [frame] = await chrome.scripting.executeScript({
      target: { tabId: tab.id, frameIds: [0] }, injectImmediately: true, func: () => null,
    });
    if (!frame?.documentId) throw new Error("Main document is unavailable");
    return frame.documentId;
  };
  const initialDocument = canInjectIntoTab(tab.url) ? readDocument() : null;
  initialDocument?.catch(cancel);
  const checkDocument = async () => {
    if (initialDocument && await readDocument() !== await initialDocument) cancel();
  };
  const updated = (id, change) => {
    if (id !== tab.id) return;
    if (change.url && change.url !== tab.url) cancel();
    // Tab loading also fires for subframes. Compare the main document identity
    // instead, including same-URL reloads, without requesting new permissions.
    else if (change.status && initialDocument) void checkDocument().catch(cancel);
    else if (change.status === "loading") cancel();
  };
  const removed = (id) => { if (id === tab.id) cancel(); };
  chrome.tabs.onActivated.addListener(activated);
  chrome.tabs.onUpdated.addListener(updated);
  chrome.tabs.onRemoved.addListener(removed);
  return {
    wait(promise) { return Promise.race([promise, cancelled]); },
    async check() {
      if (error) throw error;
      const [current] = await Promise.race([chrome.tabs.query({ active: true, windowId: tab.windowId }), cancelled]);
      if (!current || current.id !== tab.id || current.url !== tab.url || current.pendingUrl) cancel();
      await Promise.race([checkDocument().catch(cancel), cancelled]);
      if (error) throw error;
    },
    close() {
      chrome.tabs.onActivated.removeListener(activated);
      chrome.tabs.onUpdated.removeListener(updated);
      chrome.tabs.onRemoved.removeListener(removed);
    },
  };
}

async function captureVisibleTabPaced(tab, guard) {
  const gap = captureGapMs();
  const wait = lastCaptureAt + gap - Date.now();
  if (wait > 0) await guard.wait(delay(wait));

  let lastError;
  for (let attempt = 0; attempt < 8; attempt++) {
    lastCaptureAt = Date.now();
    try {
      await guard.check();
      const dataUrl = await guard.wait(chrome.tabs.captureVisibleTab(tab.windowId, { format: "png" }));
      await guard.check();
      if (!dataUrl) throw new Error("Empty capture");
      return dataUrl;
    } catch (error) {
      lastError = error;
      if (!isQuotaError(error)) throw error;
      await guard.wait(delay(1000 + attempt * 250));
    }
  }
  throw lastError;
}

async function finishCapture(canvas, dim, settings, { tab, popup, guard, alreadyScaled = false }) {
  const io = { decode, createCanvas, encode };
  canvas = fitLimits(canvas, alreadyScaled ? { ...settings, scalePercent: 100 } : settings, io);
  const mime = mimeFor(settings.format);
  const fitted = await fitFileSize(canvas, settings, io);
  canvas = fitted.canvas;
  const blob = fitted.encoded.blob;
  if (!blob || blob.type !== mime) {
    throw new Error(`This browser cannot encode ${String(settings.format).toUpperCase()}`);
  }
  if (!fitted.fits) throw new Error("The capture cannot fit the maximum file size. Increase the limit or choose another format.");
  await guard.check();
  guard.close();
  const dataUrl = await blobToDataUrl(blob);
  let record = {
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
  record = await longshotPushHistory(record);
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

async function captureRegion(tab, settings, guard) {
  await guard.wait(ensureContent(tab.id));
  report("Select an area", { index: 0, total: 1, phase: "select" });
  try {
    const rect = await guard.wait(chrome.tabs.sendMessage(tab.id, { type: "LONGSHOT_SELECT_REGION" }));
    if (!rect?.w || !rect?.h) throw new Error("Selection cancelled");
    report("Capturing", { index: 1, total: 1, phase: "capture" });
    await delay(60);
    const dataUrl = await captureVisibleTabPaced(tab, guard);
    const canvas = await cropVisible(dataUrl, rect, rect.devicePixelRatio || 1, { decode, createCanvas });
    return finishCapture(canvas, rect, settings, { tab, popup: false, guard });
  } finally {
    await chrome.tabs.sendMessage(tab.id, { type: "LONGSHOT_CANCEL_REGION" }).catch(() => {});
  }
}

async function captureVisibleOnly(tab, settings, popup, guard) {
  report("Capturing", { index: 1, total: 1, phase: "capture" });
  const dataUrl = await captureVisibleTabPaced(tab, guard);
  const bmp = await decode(dataUrl);
  const canvas = createCanvas(bmp.width, bmp.height);
  canvas.getContext("2d").drawImage(bmp, 0, 0);
  return finishCapture(canvas, { title: tab.title || "Page", url: tab.url || "" }, settings, { tab, popup, guard });
}

async function captureActive(mode, { popup = false } = {}) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) throw new Error("No active tab");
  if (isBrowserUiPage(tab.url)) {
    throw new Error("This page cannot be captured");
  }
  const guard = createCaptureGuard(tab);
  try {
    await guard.check();
    return await captureTab(mode, tab, popup, guard);
  } finally {
    guard.close();
  }
}

async function captureTab(mode, tab, popup, guard) {
  const settings = await getSettings();
  const ownPage = isOwnExtensionPage(tab.url);
  if (!ownPage && !canInjectIntoTab(tab.url)) {
    if (mode === "region") {
      throw new Error("Area select is not available on this page. Use visible or full page.");
    }
    return captureVisibleOnly(tab, settings, popup, guard);
  }
  if (mode === "region") {
    if (ownPage) throw new Error("Area select is not available on this page.");
    return captureRegion(tab, settings, guard);
  }
  if (ownPage && mode === "visible") {
    return captureVisibleOnly(tab, settings, popup, guard);
  }
  if (ownPage) {
    try {
      await sendToTab(tab.id, { type: "LONGSHOT_PING" }, true);
    } catch {
      return captureVisibleOnly(tab, settings, popup, guard);
    }
  } else {
    await guard.wait(ensureContent(tab.id));
  }
  // Measuring injects capture CSS and may resize iframes. runTiledCapture undoes that
  // in its finally; if anything fails before it starts, undo it here.
  let resetSent = false;
  let dim;
  let result;
  let shellCanvas = null;
  let baseCanvas = null;
  let modal = null;
  let dpr = 1;
  try {
    dim = await guard.wait(sendToTab(
      tab.id,
      {
        type: "LONGSHOT_MEASURE",
        expandFrames: Boolean(!ownPage && settings.captureIframes),
        findOverflow: Boolean(settings.captureOverflow && mode === "full"),
      },
      ownPage,
    ));
    const overflow = mode === "full" && dim?.overflow;
    modal = overflow?.kind === "modal" ? overflow : null;
    if (modal?.fits) return await captureVisibleOnly(tab, settings, popup, guard);
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
    const shellH = modal ? 0 : overflow?.crop?.y || 0;
    if (modal) {
      const bmp = await decode(await captureVisibleTabPaced(tab, guard));
      baseCanvas = createCanvas(bmp.width, bmp.height);
      baseCanvas.getContext("2d").drawImage(bmp, 0, 0);
      bmp.close?.();
    }
    if (mode === "full" && shellH > 8) {
      const shellShot = await captureVisibleTabPaced(tab, guard);
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
        const pos = await guard.wait(sendToTab(tab.id, { type: "LONGSHOT_SCROLL", x, y }, ownPage));
        if (pos?.crop) lastCrop = pos.crop;
        return pos;
      },
      hideChrome: async (opts) => {
        const reply = await guard.wait(sendToTab(tab.id, {
          type: "LONGSHOT_HIDE_CHROME", ...opts, barsOnly: Boolean(modal), anchor: lastCrop,
        }, ownPage));
        return { bottomRects: (reply?.bottomRects || []).map((r) => ({ ...r, x: r.x - (lastCrop?.x || 0), y: r.y - (lastCrop?.y || 0) })) };
      },
      reset: (orig) => {
        resetSent = true;
        return sendToTab(tab.id, { type: "LONGSHOT_RESET", x: orig.x, y: orig.y }, ownPage);
      },
      captureTile: async () => {
        const dataUrl = await captureVisibleTabPaced(tab, guard);
        if (!lastCrop?.w || !lastCrop?.h) return dataUrl;
        const canvas = await cropVisible(dataUrl, lastCrop, dpr, { decode, createCanvas });
        return blobToDataUrl(await canvas.convertToBlob({ type: "image/png" }));
      },
      delay: (ms) => guard.wait(delay(ms)),
      onProgress: ({ index, total, text, phase }) => report(text, { index, total, phase }),
    });
  } finally {
    if (!resetSent) {
      await sendToTab(tab.id, { type: "LONGSHOT_RESET", x: dim?.scrollX, y: dim?.scrollY }, ownPage).catch(() => {});
    }
  }

  report("Stitching", { index: result.shots.length, total: result.shots.length, phase: "stitch" });

  // Apply percentage scaling once, including shells/modal backdrops in the size budget.
  const shellPx = shellCanvas ? shellCanvas.height : 0;
  const width = baseCanvas
    ? baseCanvas.width + Math.max(0, result.fullW * dpr - Math.round(modal.crop.w * dpr))
    : Math.max(result.fullW * dpr, shellCanvas?.width || 0);
  const height = baseCanvas
    ? baseCanvas.height + Math.max(0, result.fullH * dpr - Math.round(modal.crop.h * dpr))
    : result.fullH * dpr + shellPx;
  const scale = limitScale(width, height + chromeHeight(settings), settings);
  let canvas = await stitch(result.shots, { fullW: result.fullW, fullH: result.fullH, dpr, scale }, { decode, createCanvas });
  if (shellCanvas) canvas = stackVertical(shellCanvas, canvas, scale);
  if (baseCanvas) canvas = compositeModal(baseCanvas, canvas, modal.crop, dpr, createCanvas, scale);
  canvas = compositeChrome(canvas, dim, settings, scale);
  return finishCapture(canvas, dim, settings, { tab, popup, guard, alreadyScaled: true });
}

function chromeHeight(settings) {
  if (settings.includeBrowserBar) return 86;
  if (settings.includeUrlBar) return 36;
  return 0;
}

function compositeChrome(source, dim, settings, scale = 1) {
  const extra = Math.round(chromeHeight(settings) * scale);
  if (!extra) return source;
  const canvas = new OffscreenCanvas(source.width, source.height + extra);
  const ctx = canvas.getContext("2d");
  ctx.save();
  ctx.scale(scale, scale);
  ctx.fillStyle = "#e8e6e1";
  ctx.fillRect(0, 0, canvas.width / scale, extra / scale);
  ctx.fillStyle = "#3a3834";
  ctx.font = "500 16px sans-serif";
  ctx.fillText((dim.url || "").slice(0, 80), 20, settings.includeBrowserBar ? 68 : 24);
  if (settings.includeBrowserBar) {
    ctx.fillStyle = "#d4d1cb";
    ctx.fillRect(0, 0, canvas.width / scale, 40);
    ["#e15a4a", "#e0b84e", "#5e9a7a"].forEach((c, i) => {
      ctx.beginPath();
      ctx.fillStyle = c;
      ctx.arc(22 + i * 18, 20, 6, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.fillStyle = "#3a3834";
    ctx.fillText((dim.title || "Page").slice(0, 40), 92, 26);
  }
  ctx.restore();
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

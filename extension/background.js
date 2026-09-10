importScripts("folder.js", "history.js");

const coreReady = import("./core/index.js");

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

async function getCore() {
  return coreReady;
}

void getCore();

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
  return captureActive(mode || "full")
    .then(() => {
      try {
        sendResponse?.({ ok: true });
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

async function copyPngToClipboard(dataUrl) {
  if (await chrome.offscreen.hasDocument()) {
    await chrome.offscreen.closeDocument();
  }
  await chrome.offscreen.createDocument({
    url: "offscreen.html",
    reasons: ["CLIPBOARD"],
    justification: "Copy the capture to the clipboard",
  });
  try {
    const result = await chrome.runtime.sendMessage({ type: "LONGSHOT_OFFSCREEN_COPY", dataUrl });
    if (!result?.ok) throw new Error(result?.error || "Copy failed");
  } finally {
    if (await chrome.offscreen.hasDocument()) {
      await chrome.offscreen.closeDocument();
    }
  }
}

function flashBadge(text) {
  void chrome.action.setBadgeBackgroundColor({ color: "#d2d6d0" });
  void chrome.action.setBadgeText({ text });
  setTimeout(() => chrome.action.setBadgeText({ text: "" }), 1800);
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "LONGSHOT_OFFSCREEN_COPY") return;
  if (msg.type === "LONGSHOT_CAPTURE") {
    void chrome.action.setBadgeText({ text: "" });
    startCapture(msg.mode || "full", sendResponse);
    return true;
  }
  if (msg.type === "LONGSHOT_EXPORT") {
    exportBlob(msg)
      .then(() => sendResponse({ ok: true }))
      .catch((error) => sendResponse({ ok: false, error: error.message }));
    return true;
  }
});

async function getSettings() {
  const core = await getCore();
  const stored = await chrome.storage.sync.get(core.DEFAULTS);
  return { ...core.DEFAULTS, ...stored };
}

async function ensureContent(tabId) {
  const core = await getCore();
  try {
    await chrome.tabs.sendMessage(tabId, { type: "LONGSHOT_PING" });
  } catch {
    await chrome.scripting.executeScript({ target: { tabId }, files: ["content.js"] });
  }
  await chrome.scripting.executeScript({
    target: { tabId },
    func: core.installHideSession,
    args: [core.HIDE_POLICY],
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

async function finishCapture(canvas, dim, settings) {
  const core = await getCore();
  const io = { decode, createCanvas, encode };
  canvas = core.fitLimits(canvas, settings, io);
  canvas = await core.fitFileSize(canvas, settings, io);
  const mime = core.mimeFor(settings.format);
  let blob;
  try {
    blob = await canvas.convertToBlob({
      type: mime,
      quality: core.usesQuality(settings.format) ? settings.quality : 1,
    });
  } catch {
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
    await saveExport(blob, core.filename(record, settings), settings);
  }
  if (settings.skipEditor) {
    if (settings.skipEditorAction !== "download") {
      const png = mime === "image/png" ? blob : await canvas.convertToBlob({ type: "image/png" });
      await copyPngToClipboard(await blobToDataUrl(png));
      flashBadge("ok");
    } else {
      flashBadge("ok");
    }
    return;
  }
  await chrome.tabs.create({ url: chrome.runtime.getURL("editor.html") });
}

async function captureRegion(tab, settings) {
  const core = await getCore();
  await ensureContent(tab.id);
  report("Select an area", { index: 0, total: 1, phase: "select" });
  const rect = await chrome.tabs.sendMessage(tab.id, { type: "LONGSHOT_SELECT_REGION" });
  if (!rect?.w || !rect?.h) throw new Error("Selection cancelled");
  report("Capturing", { index: 1, total: 1, phase: "capture" });
  await delay(60);
  const dataUrl = await captureVisibleTabPaced(tab.windowId);
  const canvas = await core.cropVisible(dataUrl, rect, rect.devicePixelRatio || 1, { decode, createCanvas });
  await finishCapture(canvas, rect, settings);
}

async function captureActive(mode) {
  const core = await getCore();
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) throw new Error("No active tab");
  if (tab.url?.startsWith("chrome://") || tab.url?.startsWith("brave://") || tab.url?.startsWith("edge://")) {
    throw new Error("This page cannot be captured");
  }
  const settings = await getSettings();
  if (mode === "region") {
    await captureRegion(tab, settings);
    return;
  }
  await ensureContent(tab.id);
  const dim = await chrome.tabs.sendMessage(tab.id, {
    type: "LONGSHOT_MEASURE",
    expandFrames: settings.captureIframes,
  });
  const result = await core.runTiledCapture({
    mode,
    dim,
    scroll: (x, y) => chrome.tabs.sendMessage(tab.id, { type: "LONGSHOT_SCROLL", x, y }),
    hideChrome: () => chrome.tabs.sendMessage(tab.id, { type: "LONGSHOT_HIDE_CHROME" }),
    reset: (orig) => chrome.tabs.sendMessage(tab.id, { type: "LONGSHOT_RESET", x: orig.x, y: orig.y }),
    captureTile: () => captureVisibleTabPaced(tab.windowId),
    delay,
    onProgress: ({ index, total, text, phase }) => report(text, { index, total, phase }),
  });

  report("Stitching", { index: result.shots.length, total: result.shots.length, phase: "stitch" });

  const dpr = dim.devicePixelRatio || 1;
  let canvas = await core.stitch(
    result.shots,
    { fullW: result.fullW, fullH: result.fullH, dpr },
    { decode, createCanvas },
  );
  canvas = compositeChrome(canvas, dim, settings);
  await finishCapture(canvas, dim, settings);
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

async function downloadDataUrl(dataUrl, path, saveAs) {
  await chrome.downloads.download({
    url: dataUrl,
    filename: path,
    saveAs: Boolean(saveAs),
    conflictAction: "uniquify",
  });
}

async function saveExport(blob, path, settings) {
  const handle = await longshotGetDirHandle();
  if (handle) {
    try {
      await longshotWriteToDir(handle, path, blob);
      return;
    } catch {
      /* permission expired — fall back to Downloads */
    }
  }
  const dataUrl = await blobToDataUrl(blob);
  await downloadDataUrl(dataUrl, path, settings.saveAsDialog);
}

async function exportBlob(msg) {
  const core = await getCore();
  const settings = await getSettings();
  const stored = (await chrome.storage.local.get("longshotCurrent")).longshotCurrent;
  const record = {
    ...(stored || {}),
    title: msg.title || stored?.title,
    url: msg.url || stored?.url,
    format: msg.format || stored?.format,
    createdAt: msg.createdAt || stored?.createdAt,
    width: msg.width || stored?.width,
    height: msg.height || stored?.height,
  };
  if (!msg.dataUrl && !stored) throw new Error("Nothing to export");
  const blob = await (await fetch(msg.dataUrl || stored.dataUrl)).blob();
  if (msg.kind === "pdf") {
    await saveExport(blob, core.filename(record, settings).replace(/\.[^.]+$/, ".pdf"), settings);
    return;
  }
  const path = core.filename({ ...record, format: msg.format || record.format }, settings);
  await saveExport(blob, path, settings);
}

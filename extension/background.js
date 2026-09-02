importScripts("folder.js", "history.js");

function mimeFor(format) {
  if (format === "jpeg") return "image/jpeg";
  if (format === "webp") return "image/webp";
  if (format === "avif") return "image/avif";
  return "image/png";
}

function usesQuality(format) {
  return format === "jpeg" || format === "webp" || format === "avif";
}

const DEFAULTS = {
  format: "png",
  quality: 0.92,
  captureIframes: true,
  includeBrowserBar: false,
  includeUrlBar: false,
  autoDownload: false,
  saveAsDialog: true,
  downloadDirectory: "Longshot",
  downloadFolderLabel: "",
  filenameTemplate: "{title}-{date}",
  maxWidth: 8192,
  maxHeight: 32768,
  scalePercent: 100,
  maxFileMB: 0,
};

let captureInFlight = false;
let lastCaptureAt = 0;

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "LONGSHOT_CAPTURE") {
    if (captureInFlight) {
      sendResponse({ ok: false, error: "Capture already in progress" });
      return;
    }
    captureInFlight = true;
    captureActive(msg.mode || "full")
      .then(() => {
        try {
          sendResponse({ ok: true });
        } catch {
          /* popup closed */
        }
      })
      .catch((error) => {
        try {
          sendResponse({ ok: false, error: friendlyError(error) });
        } catch {
          /* popup closed */
        }
      })
      .finally(() => {
        captureInFlight = false;
      });
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
  const stored = await chrome.storage.sync.get(DEFAULTS);
  return { ...DEFAULTS, ...stored };
}

async function ensureContent(tabId) {
  try {
    await chrome.tabs.sendMessage(tabId, { type: "LONGSHOT_PING" });
  } catch {
    await chrome.scripting.executeScript({ target: { tabId }, files: ["content.js"] });
  }
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

function positions(full, view) {
  if (full <= view) return [0];
  const list = [];
  for (let v = 0; v < full; v += view) list.push(v);
  const last = Math.max(0, full - view);
  if (list[list.length - 1] !== last) list[list.length - 1] = last;
  return list;
}

async function captureActive(mode) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) throw new Error("No active tab");
  if (tab.url?.startsWith("chrome://") || tab.url?.startsWith("brave://") || tab.url?.startsWith("edge://")) {
    throw new Error("This page cannot be captured");
  }
  const settings = await getSettings();
  await ensureContent(tab.id);
  const dim = await chrome.tabs.sendMessage(tab.id, {
    type: "LONGSHOT_MEASURE",
    expandFrames: settings.captureIframes,
  });
  const orig = { x: dim.scrollX, y: dim.scrollY };
  const fullW = mode === "visible" ? dim.viewportWidth : dim.scrollWidth;
  const fullH = mode === "visible" ? dim.viewportHeight : dim.scrollHeight;
  const xs = mode === "visible" ? [dim.scrollX] : positions(fullW, dim.viewportWidth);
  const ys = mode === "visible" ? [dim.scrollY] : positions(fullH, dim.viewportHeight);
  const shots = [];
  try {
    await delay(120);
    const total = xs.length * ys.length;
    let index = 0;
    for (const y of ys) {
      for (const x of xs) {
        index += 1;
        report(total > 1 ? `Capturing ${index} of ${total}` : "Capturing", {
          index,
          total,
          phase: "capture",
        });
        if (mode === "full") {
          const pos = await chrome.tabs.sendMessage(tab.id, { type: "LONGSHOT_SCROLL", x, y });
          await delay(180);
          if (index > 1) {
            await chrome.tabs.sendMessage(tab.id, { type: "LONGSHOT_HIDE_CHROME" });
            await delay(80);
          }
          const ax = Math.round(pos?.x ?? x);
          const ay = Math.round(pos?.y ?? y);
          if (shots.some((shot) => shot.x === ax && shot.y === ay)) continue;
          const dataUrl = await captureVisibleTabPaced(tab.windowId);
          shots.push({ x: ax, y: ay, dataUrl });
        } else {
          const dataUrl = await captureVisibleTabPaced(tab.windowId);
          shots.push({ x: 0, y: 0, dataUrl });
        }
      }
    }
  } finally {
    try {
      await chrome.tabs.sendMessage(tab.id, { type: "LONGSHOT_RESET", x: orig.x, y: orig.y });
    } catch {
      /* tab closed */
    }
  }

  if (!shots.length) throw new Error("Capture produced no frames");

  report("Stitching", { index: shots.length, total: shots.length, phase: "stitch" });

  const dpr = dim.devicePixelRatio || 1;
  let canvas = await stitch(shots, fullW, fullH, dim.viewportWidth, dim.viewportHeight, dpr);
  canvas = compositeChrome(canvas, dim, settings);
  canvas = fitLimits(canvas, settings);
  canvas = await fitFileSize(canvas, settings);

  const mime = mimeFor(settings.format);
  let blob;
  try {
    blob = await canvas.convertToBlob({
      type: mime,
      quality: usesQuality(settings.format) ? settings.quality : 1,
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
  if (settings.autoDownload) {
    await saveExport(blob, filename(record, settings), settings);
  }
  await chrome.tabs.create({ url: chrome.runtime.getURL("editor.html") });
}

async function stitch(shots, fullW, fullH, vw, vh, dpr) {
  const canvas = new OffscreenCanvas(Math.max(1, Math.round(fullW * dpr)), Math.max(1, Math.round(fullH * dpr)));
  const ctx = canvas.getContext("2d");
  for (const shot of shots) {
    const blob = await (await fetch(shot.dataUrl)).blob();
    const bmp = await createImageBitmap(blob);
    ctx.drawImage(bmp, Math.round(shot.x * dpr), Math.round(shot.y * dpr));
  }
  return canvas;
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

function fitLimits(source, settings) {
  let w = source.width * (settings.scalePercent / 100);
  let h = source.height * (settings.scalePercent / 100);
  const scale = Math.min(1, (settings.maxWidth || w) / w, (settings.maxHeight || h) / h);
  w = Math.max(1, Math.round(w * scale));
  h = Math.max(1, Math.round(h * scale));
  if (w === source.width && h === source.height) return source;
  const canvas = new OffscreenCanvas(w, h);
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(source, 0, 0, w, h);
  return canvas;
}

async function fitFileSize(source, settings) {
  const max = (Number(settings.maxFileMB) || 0) * 1024 * 1024;
  if (!max) return source;
  const mime = mimeFor(settings.format);
  let canvas = source;
  let quality = settings.quality || 0.92;
  let blob = await canvas.convertToBlob({ type: mime, quality });
  if (blob.size <= max) return canvas;
  if (usesQuality(settings.format)) {
    for (const q of [0.82, 0.7, 0.58, 0.45, 0.32]) {
      quality = Math.min(quality, q);
      blob = await canvas.convertToBlob({ type: mime, quality });
      if (blob.size <= max) return canvas;
    }
  }
  for (let i = 0; i < 8; i++) {
    const factor = Math.sqrt(max / blob.size) * 0.9;
    if (!Number.isFinite(factor) || factor >= 0.99) break;
    const w = Math.max(256, Math.round(canvas.width * factor));
    const h = Math.max(256, Math.round(canvas.height * factor));
    if (w === canvas.width && h === canvas.height) break;
    const next = new OffscreenCanvas(w, h);
    const ctx = next.getContext("2d");
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(canvas, 0, 0, w, h);
    canvas = next;
    blob = await canvas.convertToBlob({ type: mime, quality: usesQuality(settings.format) ? quality : 1 });
    if (blob.size <= max) return canvas;
    if (w <= 256 || h <= 256) break;
  }
  return canvas;
}

function slugify(value) {
  return (value || "capture")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

function filename(record, settings) {
  const d = new Date(record.createdAt);
  const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  let name = settings.filenameTemplate || "{title}-{date}";
  name = name
    .replaceAll("{title}", slugify(record.title))
    .replaceAll("{date}", date)
    .replaceAll("{datetime}", `${date}-${String(d.getHours()).padStart(2, "0")}${String(d.getMinutes()).padStart(2, "0")}`)
    .replaceAll("{url}", slugify(record.url.replace(/^https?:\/\//, "")))
    .replaceAll("{width}", String(record.width))
    .replaceAll("{height}", String(record.height));
  name = slugify(name);
  const ext = record.format === "jpeg" ? "jpg" : record.format || "png";
  const folder = String(settings.downloadDirectory || "Longshot")
    .replace(/\\/g, "/")
    .replace(/^[a-zA-Z]:/, "")
    .replace(/^\/+|\/+$/g, "")
    .replace(/\.\./g, "")
    .replace(/\/+/g, "/");
  return folder ? `${folder}/${name}.${ext}` : `${name}.${ext}`;
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
    await saveExport(blob, filename(record, settings).replace(/\.[^.]+$/, ".pdf"), settings);
    return;
  }
  const path = filename({ ...record, format: msg.format || record.format }, settings);
  await saveExport(blob, path, settings);
}

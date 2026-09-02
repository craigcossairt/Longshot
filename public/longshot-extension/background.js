const DEFAULTS = {
  format: "png",
  quality: 0.92,
  captureIframes: true,
  includeBrowserBar: false,
  includeUrlBar: false,
  autoDownload: false,
  saveAsDialog: true,
  downloadDirectory: "Longshot",
  filenameTemplate: "{title}-{date}",
  maxWidth: 8192,
  maxHeight: 32768,
  scalePercent: 100,
  maxFileMB: 0,
};

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "LONGSHOT_CAPTURE") {
    captureActive(msg.mode || "full")
      .then(() => sendResponse({ ok: true }))
      .catch((error) => sendResponse({ ok: false, error: error.message }));
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
  await delay(120);
  const orig = { x: dim.scrollX, y: dim.scrollY };
  const fullW = mode === "visible" ? dim.viewportWidth : dim.scrollWidth;
  const fullH = mode === "visible" ? dim.viewportHeight : dim.scrollHeight;
  const xs = mode === "visible" ? [dim.scrollX] : positions(fullW, dim.viewportWidth);
  const ys = mode === "visible" ? [dim.scrollY] : positions(fullH, dim.viewportHeight);
  const shots = [];
  for (const y of ys) {
    for (const x of xs) {
      if (mode === "full") {
        await chrome.tabs.sendMessage(tab.id, { type: "LONGSHOT_SCROLL", x, y });
        await delay(220);
      }
      const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, { format: "png" });
      shots.push({ x: mode === "visible" ? 0 : x, y: mode === "visible" ? 0 : y, dataUrl });
    }
  }
  await chrome.tabs.sendMessage(tab.id, { type: "LONGSHOT_RESET", x: orig.x, y: orig.y });

  const dpr = dim.devicePixelRatio || 1;
  let canvas = await stitch(shots, fullW, fullH, dim.viewportWidth, dim.viewportHeight, dpr);
  canvas = compositeChrome(canvas, dim, settings);
  canvas = fitLimits(canvas, settings);
  canvas = await fitFileSize(canvas, settings);

  const mime = settings.format === "jpeg" ? "image/jpeg" : settings.format === "webp" ? "image/webp" : "image/png";
  const blob = await canvas.convertToBlob({ type: mime, quality: settings.quality });
  const dataUrl = await blobToDataUrl(blob);
  const record = {
    title: dim.title,
    url: dim.url,
    dataUrl,
    width: canvas.width,
    height: canvas.height,
    format: settings.format,
    createdAt: Date.now(),
  };
  await chrome.storage.local.set({ longshotCurrent: record });
  if (settings.autoDownload) {
    await downloadDataUrl(dataUrl, filename(record, settings), settings.saveAsDialog);
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
  const mime = settings.format === "jpeg" ? "image/jpeg" : settings.format === "webp" ? "image/webp" : "image/png";
  let canvas = source;
  let quality = settings.quality || 0.92;
  let blob = await canvas.convertToBlob({ type: mime, quality });
  if (blob.size <= max) return canvas;
  if (settings.format !== "png") {
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
    blob = await canvas.convertToBlob({ type: mime, quality: settings.format === "png" ? 1 : quality });
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
  const ext = record.format === "jpeg" ? "jpg" : record.format;
  const folder = (settings.downloadDirectory || "Longshot").replace(/^\/+|\/+$/g, "");
  return `${folder}/${name}.${ext}`;
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

async function exportBlob(msg) {
  const settings = await getSettings();
  const record = (await chrome.storage.local.get("longshotCurrent")).longshotCurrent;
  if (!record) throw new Error("Nothing to export");
  if (msg.kind === "pdf") {
    await chrome.downloads.download({
      url: msg.dataUrl,
      filename: filename(record, settings).replace(/\.[^.]+$/, ".pdf"),
      saveAs: Boolean(settings.saveAsDialog),
    });
    return;
  }
  const path = filename({ ...record, format: msg.format || record.format }, settings);
  await downloadDataUrl(msg.dataUrl, path, settings.saveAsDialog);
}

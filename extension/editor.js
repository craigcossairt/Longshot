import { jpegToPdfBlob } from "./core/pdf.js";
import { exportCapture } from "./export.js";
import { sendLongshotFeedback } from "./feedback.js";
import { installHostCapture } from "./host-capture.js";
import { longshotHistoryGet, longshotHistoryUpdate } from "./history.js";
import { drawAnnotation, documentBlob, blobDataUrl } from "./editor-document.js";
import {
  ZOOM_MAX,
  ZOOM_MIN,
  ZOOM_STEP,
  clampZoom,
  fitWidthZoom,
  scrollAfterZoom,
  stepZoom,
  zoomPercent,
} from "./view-zoom.js";

installHostCapture();

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const stage = document.getElementById("stage");
const canvasWrap = document.getElementById("canvasWrap");
const workspace = document.querySelector(".workspace");
const menu = document.getElementById("menu");
const fileInput = document.getElementById("file");
const undoBtn = document.getElementById("undo");
const redoBtn = document.getElementById("redo");
const clearBtn = document.getElementById("clearAnns");
const deleteBtn = document.getElementById("deleteAnn");
const textEdit = document.getElementById("textEdit");
const emojiPicker = document.getElementById("emojiPicker");
const emojiGrid = document.getElementById("emojiGrid");
const zoomOutBtn = document.getElementById("zoomOut");
const zoomInBtn = document.getElementById("zoomIn");
const zoomFitBtn = document.getElementById("zoomFit");
const zoomLabelBtn = document.getElementById("zoomLabel");
const COLORS = ["#e15a4a", "#e08a3c", "#f0c14a", "#3d9a6a", "#4a7ec4", "#f7f7f2", "#111111"];
const EMOJI = [
  "😀", "😁", "😂", "🤣", "😊", "😍", "🤩", "😎",
  "🤔", "😴", "😭", "😡", "🤯", "👋", "👍", "👎",
  "👏", "🙏", "💪", "🔥", "⭐", "✨", "✅", "❌",
  "❗", "❓", "➡️", "⬅️", "⬆️", "⬇️", "⭕", "📌",
  "📍", "👀", "💡", "💬", "📝", "🎯", "❤️", "💔",
  "🎉", "🚀", "⚠️", "🕒", "📎", "🔗", "📷", "🖥️",
];

let image = new Image();
let record = null;
let tool = "select";
let color = COLORS[0];
let stamp = EMOJI[0];
let anns = [];
let crop = null;
let drawing = null;
let selectedId = null;
let editingTextId = null;
let drag = null;
let undoStack = [];
let redoStack = [];
let pendingImageSrc = null;
let zoom = 1;
let zoomMode = "fit";
const imgCache = new Map();
const saveStatus = document.getElementById("saveStatus");
const retrySave = document.getElementById("retrySave");
let ready = false;
let documentVersion = 0;
let savedVersion = 0;
let observedVersion = 0;
let saveTimer;
let saving = null;
let loadGeneration = 0;
let imageTransition = Promise.resolve();
let loadingImage = false;

function currentDocument() {
  return { version: 1, baseDataUrl: image.src, width: canvas.width, height: canvas.height, annotations: cloneAnns(anns) };
}

function documentChanged() {
  documentVersion += 1;
  scheduleSave();
}

function updateAnnotations(next) {
  anns = next;
  documentChanged();
}

function status(text, error = false, canRetry) {
  saveStatus.textContent = text;
  saveStatus.classList.toggle("save-error", error);
  if (canRetry !== undefined) retrySave.hidden = !canRetry;
}

function scheduleSave() {
  if (!ready) return;
  if (documentVersion === observedVersion) return;
  observedVersion = documentVersion;
  clearTimeout(saveTimer);
  status("Saving...", false, false);
  saveTimer = setTimeout(() => { void flushSave().catch(() => {}); }, 180);
}

async function flushSave() {
  clearTimeout(saveTimer);
  await imageTransition;
  if (saving) return saving;
  saving = (async () => {
    while (ready && savedVersion !== documentVersion) {
      await imageTransition;
      const doc = currentDocument();
      const version = documentVersion;
      status("Saving...", false, false);
      const blob = await documentBlob(doc, mimeFor(record.format), 0.92, { baseImage: image });
      const format = blob.type === "image/jpeg" ? "jpeg" : blob.type === "image/webp" ? "webp" : blob.type === "image/avif" ? "avif" : "png";
      const dataUrl = await blobDataUrl(blob);
      record = await longshotHistoryUpdate({ ...record, document: doc, dataUrl, format,
        width: doc.width, height: doc.height, edited: true });
      savedVersion = version;
    }
    status("Saved on this device", false, false);
  })().catch((error) => {
    status(`Not saved: ${error?.message || error}`, true, true);
    throw error;
  }).finally(() => { saving = null; });
  return saving;
}

retrySave.addEventListener("click", () => {
  closeTextEditor(true);
  void flushSave().catch(() => {});
});

async function navigateTo(url) {
  closeTextEditor(true);
  try {
    await flushSave();
    location.href = url;
  } catch { /* Keep the unsaved document visible, with an actionable status. */ }
}

window.addEventListener("beforeunload", (event) => {
  if (ready && savedVersion !== documentVersion) {
    event.preventDefault();
    event.returnValue = "";
  }
});

function uid() {
  return crypto.randomUUID();
}

function cloneAnns(list) {
  return JSON.parse(JSON.stringify(list));
}

function frame() {
  return {
    anns: cloneAnns(anns),
    src: image.src,
    w: canvas.width,
    h: canvas.height,
  };
}

function snapshot() {
  undoStack.push(frame());
  if (undoStack.length > 80) undoStack.shift();
  redoStack = [];
  syncEditButtons();
}

function replaceBaseImage(src, apply) {
  const generation = ++loadGeneration;
  loadingImage = true;
  syncEditButtons();
  imageTransition = new Promise((resolve, reject) => {
    const next = new Image();
    next.onload = () => {
      if (generation !== loadGeneration) { resolve(); return; }
      image = next;
      canvas.width = next.naturalWidth;
      canvas.height = next.naturalHeight;
      loadingImage = false;
      apply();
      documentChanged();
      render();
      applyZoomStyles();
      resolve();
    };
    next.onerror = () => {
      if (generation !== loadGeneration) { resolve(); return; }
      loadingImage = false;
      syncEditButtons();
      status("Could not load the edited image. Undo and try again.", true);
      reject(new Error("Could not load the edited image."));
      // Existing waiters still reject; a recovered document can save/export again.
      imageTransition = Promise.resolve();
    };
    next.src = src;
  });
  void imageTransition.catch(() => {});
}

function restoreFrame(next) {
  closeTextEditor(false);
  selectedId = null;
  crop = null;
  document.getElementById("applyCrop").hidden = true;
  if (next.src && (image.src !== next.src || canvas.width !== next.w || canvas.height !== next.h)) {
    replaceBaseImage(next.src, () => { anns = cloneAnns(next.anns); });
    return;
  }
  updateAnnotations(cloneAnns(next.anns));
  render();
  syncEditButtons();
}

function undo() {
  if (loadingImage || !undoStack.length) return;
  redoStack.push(frame());
  restoreFrame(undoStack.pop());
  syncEditButtons();
}

function redo() {
  if (loadingImage || !redoStack.length) return;
  undoStack.push(frame());
  restoreFrame(redoStack.pop());
  syncEditButtons();
}

function syncEditButtons() {
  undoBtn.disabled = loadingImage || undoStack.length === 0;
  redoBtn.disabled = loadingImage || redoStack.length === 0;
  clearBtn.disabled = anns.length === 0;
  deleteBtn.hidden = !selectedId;
}

function bounds(a) {
  if (a.type === "pen") {
    const xs = a.pts.map((p) => p.x);
    const ys = a.pts.map((p) => p.y);
    const pad = Math.max(8, a.w || 3);
    return {
      x: Math.min(...xs) - pad,
      y: Math.min(...ys) - pad,
      w: Math.max(...xs) - Math.min(...xs) + pad * 2,
      h: Math.max(...ys) - Math.min(...ys) + pad * 2,
    };
  }
  if (a.type === "text") {
    const fontSize = a.fontSize || 28;
    ctx.font = `${fontSize}px sans-serif`;
    const lines = String(a.text || " ").split("\n");
    const w = Math.max(40, ...lines.map((line) => ctx.measureText(line).width));
    return { x: a.x, y: a.y - fontSize, w, h: fontSize * 1.3 * lines.length };
  }
  if (a.type === "emoji") {
    const s = a.size || 48;
    return { x: a.x, y: a.y, w: s, h: s };
  }
  const x = a.bw < 0 ? a.x + a.bw : a.x;
  const y = a.bh < 0 ? a.y + a.bh : a.y;
  return { x, y, w: Math.abs(a.bw || 0), h: Math.abs(a.bh || 0) };
}

function hitAnn(a, p) {
  const b = bounds(a);
  const pad = 8 / zoom;
  if (a.type === "pen") {
    const tol = Math.max(10 / zoom, a.w || 3);
    return a.pts.some((pt, i) => {
      if (i === 0) return false;
      const q = a.pts[i - 1];
      const dx = pt.x - q.x;
      const dy = pt.y - q.y;
      const len = dx * dx + dy * dy || 1;
      const t = Math.max(0, Math.min(1, ((p.x - q.x) * dx + (p.y - q.y) * dy) / len));
      return Math.hypot(p.x - (q.x + t * dx), p.y - (q.y + t * dy)) < tol;
    });
  }
  if (a.type === "arrow") {
    const q = { x: a.x, y: a.y };
    const r = { x: a.x + a.bw, y: a.y + a.bh };
    const dx = r.x - q.x;
    const dy = r.y - q.y;
    const len = dx * dx + dy * dy || 1;
    const t = Math.max(0, Math.min(1, ((p.x - q.x) * dx + (p.y - q.y) * dy) / len));
    return Math.hypot(p.x - (q.x + t * dx), p.y - (q.y + t * dy)) < 16 / zoom;
  }
  return p.x >= b.x - pad && p.x <= b.x + b.w + pad && p.y >= b.y - pad && p.y <= b.y + b.h + pad;
}

function handleSize() {
  return Math.max(10, Math.min(18, canvas.width / 70)) / zoom;
}

function normCrop(c) {
  if (!c) return null;
  const x = c.w < 0 ? c.x + c.w : c.x;
  const y = c.h < 0 ? c.y + c.h : c.y;
  return { x, y, w: Math.abs(c.w), h: Math.abs(c.h) };
}

function cropHandleMap(b) {
  return {
    nw: { x: b.x, y: b.y },
    n: { x: b.x + b.w / 2, y: b.y },
    ne: { x: b.x + b.w, y: b.y },
    e: { x: b.x + b.w, y: b.y + b.h / 2 },
    se: { x: b.x + b.w, y: b.y + b.h },
    s: { x: b.x + b.w / 2, y: b.y + b.h },
    sw: { x: b.x, y: b.y + b.h },
    w: { x: b.x, y: b.y + b.h / 2 },
  };
}

function hitCropHandle(p) {
  const b = normCrop(crop);
  if (!b || b.w < 8 || b.h < 8) return null;
  const hs = handleSize();
  const map = cropHandleMap(b);
  return Object.keys(map).find((key) => Math.hypot(p.x - map[key].x, p.y - map[key].y) <= hs) || null;
}

function resizeCrop(c, handle, dx, dy) {
  const next = { ...c };
  if (handle.includes("e")) next.w += dx;
  if (handle.includes("s")) next.h += dy;
  if (handle.includes("w")) {
    next.x += dx;
    next.w -= dx;
  }
  if (handle.includes("n")) {
    next.y += dy;
    next.h -= dy;
  }
  return next;
}

function closeTextEditor(save) {
  if (!editingTextId) {
    textEdit.hidden = true;
    return;
  }
  const id = editingTextId;
  const value = textEdit.value;
  editingTextId = null;
  textEdit.hidden = true;
  if (save) {
    if (!value.trim()) {
      updateAnnotations(anns.filter((a) => a.id !== id));
    } else if (anns.find((a) => a.id === id)?.text !== value) {
      updateAnnotations(anns.map((a) => (a.id === id ? { ...a, text: value } : a)));
    }
  }
  render();
}

function layoutTextEditor() {
  if (!editingTextId) return;
  const a = anns.find((item) => item.id === editingTextId);
  if (!a) return;
  const fontSize = a.fontSize || 28;
  textEdit.style.left = `${a.x * zoom}px`;
  textEdit.style.top = `${(a.y - fontSize) * zoom}px`;
  textEdit.style.width = `${Math.max(120, a.w || 280) * zoom}px`;
  textEdit.style.height = `${fontSize * Math.max(3.2, String(a.text || "").split("\n").length * 1.3) * zoom}px`;
  textEdit.style.fontSize = `${fontSize * zoom}px`;
}

function openTextEditor(a, keepSelection) {
  editingTextId = a.id;
  if (!keepSelection) selectedId = null;
  textEdit.hidden = false;
  textEdit.value = a.text || "";
  textEdit.style.color = a.color || "#f1f0ec";
  layoutTextEditor();
  textEdit.focus();
  render();
}

function applyZoomStyles() {
  if (!canvas.width || !canvas.height) {
    canvas.style.width = "";
    canvas.style.height = "";
  } else {
    canvas.style.width = `${canvas.width * zoom}px`;
    canvas.style.height = `${canvas.height * zoom}px`;
  }
  const percent = zoomPercent(zoom);
  zoomLabelBtn.textContent = `${percent}%`;
  const atActual = Math.abs(zoom - 1) < 0.005;
  zoomLabelBtn.title = atActual ? "Fit to width" : "Reset to 100% (Ctrl+0)";
  zoomLabelBtn.setAttribute("aria-label", atActual ? "Fit to width" : `Reset zoom to 100%, currently ${percent} percent`);
  zoomOutBtn.disabled = zoom <= ZOOM_MIN + 1e-6;
  zoomInBtn.disabled = zoom >= ZOOM_MAX - 1e-6;
  layoutTextEditor();
  if (image.naturalWidth) render();
}

function stageCenter() {
  const rect = stage.getBoundingClientRect();
  return { x: rect.left + stage.clientWidth / 2, y: rect.top + stage.clientHeight / 2 };
}

function setZoom(next, origin, mode = "manual") {
  const prev = zoom;
  zoom = clampZoom(next);
  zoomMode = mode;
  const point = origin || stageCenter();
  const stageRect = stage.getBoundingClientRect();
  const canvasRect = canvas.getBoundingClientRect();
  const imgX = prev && canvasRect.width ? (point.x - canvasRect.left) / prev : 0;
  const imgY = prev && canvasRect.height ? (point.y - canvasRect.top) / prev : 0;
  applyZoomStyles();
  if (!canvas.width) return;
  const nextScroll = scrollAfterZoom({
    imgX,
    imgY,
    nextZoom: zoom,
    wrapOffsetLeft: canvasWrap.offsetLeft,
    wrapOffsetTop: canvasWrap.offsetTop,
    originXInStage: point.x - stageRect.left,
    originYInStage: point.y - stageRect.top,
  });
  stage.scrollLeft = nextScroll.scrollLeft;
  stage.scrollTop = nextScroll.scrollTop;
}

function zoomToFit() {
  zoom = fitWidthZoom(canvas.width, stage.clientWidth);
  zoomMode = "fit";
  applyZoomStyles();
  stage.scrollLeft = 0;
  stage.scrollTop = 0;
}

function zoomToActual() {
  setZoom(1, stageCenter(), "manual");
}

function handlesFor(a) {
  if (a.type === "pen") return {};
  const b = bounds(a);
  return {
    nw: { x: b.x, y: b.y },
    n: { x: b.x + b.w / 2, y: b.y },
    ne: { x: b.x + b.w, y: b.y },
    e: { x: b.x + b.w, y: b.y + b.h / 2 },
    se: { x: b.x + b.w, y: b.y + b.h },
    s: { x: b.x + b.w / 2, y: b.y + b.h },
    sw: { x: b.x, y: b.y + b.h },
    w: { x: b.x, y: b.y + b.h / 2 },
  };
}

function hitHandle(a, p) {
  const hs = handleSize();
  const map = handlesFor(a);
  return Object.keys(map).find((key) => Math.hypot(p.x - map[key].x, p.y - map[key].y) <= hs);
}

function moveAnn(a, dx, dy) {
  if (a.type === "pen") return { ...a, pts: a.pts.map((pt) => ({ x: pt.x + dx, y: pt.y + dy })) };
  return { ...a, x: a.x + dx, y: a.y + dy };
}

function resizeAnn(a, handle, dx, dy) {
  if (a.type === "pen") return moveAnn(a, dx, dy);
  if (a.type === "emoji") {
    const delta = handle.includes("e") || handle.includes("s") ? dx + dy : -(dx + dy);
    const size = Math.max(16, (a.size || 48) + delta);
    const next = { ...a, size };
    if (handle.includes("w")) next.x = a.x + ((a.size || 48) - size);
    if (handle.includes("n")) next.y = a.y + ((a.size || 48) - size);
    return next;
  }
  if (a.type === "text") {
    const fontSize = Math.max(
      12,
      (a.fontSize || 28) + (handle.includes("s") || handle.includes("e") ? dy * 0.4 + dx * 0.15 : -(dy * 0.4 + dx * 0.15)),
    );
    const next = { ...a, fontSize };
    if (handle.includes("n")) next.y = a.y + ((a.fontSize || 28) - fontSize);
    return next;
  }
  const next = { ...a };
  if (handle.includes("e")) next.bw = a.bw + dx;
  if (handle.includes("s")) next.bh = a.bh + dy;
  if (handle.includes("w")) {
    next.x = a.x + dx;
    next.bw = a.bw - dx;
  }
  if (handle.includes("n")) {
    next.y = a.y + dy;
    next.bh = a.bh - dy;
  }
  return next;
}

function imageEl(a) {
  const src = a.src;
  if (!src) return a.el || null;
  let img = imgCache.get(src);
  if (!img) {
    img = new Image();
    img.onload = render;
    img.src = src;
    imgCache.set(src, img);
  }
  return img.complete ? img : null;
}

function drawAnn(a) {
  drawAnnotation(ctx, a, { image: a.type === "image" ? imageEl(a) : null, editingTextId });
}

function drawSelection(a) {
  const b = bounds(a);
  ctx.save();
  ctx.strokeStyle = "#d2d6d0";
  ctx.setLineDash([5, 4]);
  ctx.lineWidth = 1.5;
  ctx.strokeRect(b.x, b.y, b.w, b.h);
  ctx.setLineDash([]);
  const hs = handleSize();
  Object.values(handlesFor(a)).forEach((pt) => {
    ctx.fillStyle = "#f1f0ec";
    ctx.strokeStyle = "#0e0e10";
    ctx.lineWidth = 1;
    ctx.fillRect(pt.x - hs / 2, pt.y - hs / 2, hs, hs);
    ctx.strokeRect(pt.x - hs / 2, pt.y - hs / 2, hs, hs);
  });
  ctx.restore();
}

function render() {
  if (!image.naturalWidth) return;
  document.getElementById("meta").textContent = `${canvas.width} \u00d7 ${canvas.height} \u00b7 ${String(record?.format || "png").toUpperCase()}`;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0);
  for (const a of anns) drawAnn(a);
  if (drawing) drawAnn(drawing);
  const selected = anns.find((a) => a.id === selectedId);
  if (selected) drawSelection(selected);
  if (crop) {
    const b = normCrop(crop);
    ctx.fillStyle = "rgba(14,14,16,0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.clearRect(b.x, b.y, b.w, b.h);
    ctx.drawImage(image, b.x, b.y, b.w, b.h, b.x, b.y, b.w, b.h);
    for (const a of anns) drawAnn(a);
    ctx.strokeStyle = "#d2d6d0";
    ctx.setLineDash([6, 4]);
    ctx.lineWidth = 2;
    ctx.strokeRect(b.x, b.y, b.w, b.h);
    ctx.setLineDash([]);
    if (b.w >= 8 && b.h >= 8) {
      const hs = handleSize();
      Object.values(cropHandleMap(b)).forEach((pt) => {
        ctx.fillStyle = "#f1f0ec";
        ctx.strokeStyle = "#0e0e10";
        ctx.lineWidth = 1;
        ctx.fillRect(pt.x - hs / 2, pt.y - hs / 2, hs, hs);
        ctx.strokeRect(pt.x - hs / 2, pt.y - hs / 2, hs, hs);
      });
    }
  }
  syncEditButtons();
}

function pos(e) {
  const r = canvas.getBoundingClientRect();
  return {
    x: ((e.clientX - r.left) / r.width) * canvas.width,
    y: ((e.clientY - r.top) / r.height) * canvas.height,
  };
}

canvas.addEventListener("pointerdown", (e) => {
  if (!ready || loadingImage || e.button !== 0) return;
  canvas.setPointerCapture(e.pointerId);
  const p = pos(e);
  if (tool !== "emoji") emojiPicker.hidden = true;
  if (editingTextId) closeTextEditor(true);
  if (tool === "crop") {
    const handle = hitCropHandle(p);
    if (handle) {
      crop = normCrop(crop);
      drag = { mode: "crop-resize", handle, last: p };
      return;
    }
    const b = normCrop(crop);
    if (b && b.w >= 8 && b.h >= 8 && p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h) {
      crop = b;
      drag = { mode: "crop-move", last: p };
      return;
    }
    crop = { x: p.x, y: p.y, w: 0, h: 0 };
    document.getElementById("applyCrop").hidden = false;
    selectedId = null;
    return;
  }
  if (tool === "select") {
    const selected = anns.find((a) => a.id === selectedId);
    const handle = selected ? hitHandle(selected, p) : null;
    if (handle) {
      drag = { mode: "resize", id: selected.id, handle, last: p, snapped: false };
      return;
    }
    const hit = [...anns].reverse().find((a) => hitAnn(a, p));
    selectedId = hit ? hit.id : null;
    if (hit?.type === "text") { snapshot(); openTextEditor(hit, true); }
    if (hit) {
      drag = { mode: "move", id: hit.id, last: p, snapped: false };
    }
    render();
    return;
  }
  if (tool === "text") {
    drag = { mode: "text-place", last: p };
    return;
  }
  if (tool === "emoji") {
    snapshot();
    const id = uid();
    updateAnnotations([...anns, { id, type: "emoji", x: p.x, y: p.y, emoji: stamp, size: 48, color }]);
    selectedId = null;
    render();
    return;
  }
  if (tool === "image" || pendingImageSrc) {
    if (!pendingImageSrc) {
      fileInput.click();
      return;
    }
    snapshot();
    const id = uid();
    updateAnnotations([...anns, { id, type: "image", x: p.x, y: p.y, bw: 240, bh: 160, src: pendingImageSrc, color }]);
    selectedId = null;
    pendingImageSrc = null;
    render();
    return;
  }
  if (tool === "pen") drawing = { id: uid(), type: "pen", pts: [p], color, w: 3 };
  else drawing = { id: uid(), type: tool, x: p.x, y: p.y, bw: 0, bh: 0, color, w: 3 };
});

canvas.addEventListener("pointermove", (e) => {
  const p = pos(e);
  if (drag?.mode === "crop-resize" && e.buttons === 1) {
    const dx = p.x - drag.last.x;
    const dy = p.y - drag.last.y;
    crop = resizeCrop(normCrop(crop), drag.handle, dx, dy);
    drag.last = p;
    render();
    return;
  }
  if (drag?.mode === "crop-move" && e.buttons === 1) {
    const dx = p.x - drag.last.x;
    const dy = p.y - drag.last.y;
    crop = { ...crop, x: crop.x + dx, y: crop.y + dy };
    drag.last = p;
    render();
    return;
  }
  if (crop && tool === "crop" && e.buttons === 1 && !drag) {
    crop.w = p.x - crop.x;
    crop.h = p.y - crop.y;
    render();
    return;
  }
  if (drag?.id && e.buttons === 1) {
    if (!drag.snapped) {
      snapshot();
      drag.snapped = true;
    }
    const dx = p.x - drag.last.x;
    const dy = p.y - drag.last.y;
    updateAnnotations(anns.map((a) => {
      if (a.id !== drag.id) return a;
      return drag.mode === "resize" ? resizeAnn(a, drag.handle, dx, dy) : moveAnn(a, dx, dy);
    }));
    drag.last = p;
    render();
    return;
  }
  if (!drawing || e.buttons !== 1) return;
  if (drawing.type === "pen") drawing.pts.push(p);
  else {
    drawing.bw = p.x - drawing.x;
    drawing.bh = p.y - drawing.y;
  }
  render();
});

canvas.addEventListener("pointerup", () => {
  if (drag?.mode === "text-place") {
    snapshot();
    const next = { id: uid(), type: "text", x: drag.last.x, y: drag.last.y, text: "", color, fontSize: 28 };
    updateAnnotations([...anns, next]);
    drag = null;
    openTextEditor(next);
    return;
  }
  if (drag?.mode === "crop-resize" || drag?.mode === "crop-move" || (tool === "crop" && crop)) {
    crop = normCrop(crop);
  }
  drag = null;
  if (drawing) {
    snapshot();
    updateAnnotations([...anns, drawing]);
    selectedId = null;
    drawing = null;
    render();
  }
});

document.querySelectorAll("[data-tool]").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    tool = btn.dataset.tool;
    document.querySelectorAll("[data-tool]").forEach((b) => b.classList.toggle("on", b === btn));
    emojiPicker.hidden = tool !== "emoji";
    if (tool !== "crop" && crop) {
      crop = null;
      document.getElementById("applyCrop").hidden = true;
      render();
    }
    if (tool === "crop") {
      closeTextEditor(true);
      selectedId = null;
      render();
    }
    if (tool === "image") fileInput.click();
    canvas.style.cursor = tool === "select" ? "default" : "crosshair";
  });
});

COLORS.forEach((c) => {
  const i = document.createElement("i");
  i.style.background = c;
  if (c === color) i.classList.add("on");
  i.addEventListener("click", () => {
    color = c;
    document.querySelectorAll(".swatches i").forEach((el) => el.classList.toggle("on", el === i));
    if (selectedId) {
      snapshot();
      updateAnnotations(anns.map((a) => (a.id === selectedId ? { ...a, color: c } : a)));
      render();
    }
  });
  document.getElementById("swatches").appendChild(i);
});

EMOJI.forEach((item) => {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = item;
  if (item === stamp) btn.classList.add("on");
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    stamp = item;
    emojiGrid.querySelectorAll("button").forEach((el) => el.classList.toggle("on", el === btn));
    tool = "emoji";
    document.querySelectorAll("[data-tool]").forEach((b) => b.classList.toggle("on", b.dataset.tool === "emoji"));
  });
  emojiGrid.appendChild(btn);
});

fileInput.addEventListener("change", () => {
  const f = fileInput.files[0];
  fileInput.value = "";
  if (!f) return;
  const reader = new FileReader();
  reader.onload = () => {
    pendingImageSrc = String(reader.result);
    tool = "image";
  };
  reader.readAsDataURL(f);
});

document.getElementById("applyCrop").addEventListener("click", function applyCrop() {
  const requested = normCrop(crop);
  if (!requested) return;
  const x = Math.max(0, requested.x), y = Math.max(0, requested.y);
  const b = { x, y, w: Math.min(canvas.width, requested.x + requested.w) - x,
    h: Math.min(canvas.height, requested.y + requested.h) - y };
  if (b.w < 8 || b.h < 8) return;
  if (loadingImage) return;
  snapshot();
  const next = document.createElement("canvas");
  next.width = Math.max(1, Math.round(b.w));
  next.height = Math.max(1, Math.round(b.h));
  next.getContext("2d").drawImage(image, b.x, b.y, b.w, b.h, 0, 0, next.width, next.height);
  const dataUrl = next.toDataURL();
  replaceBaseImage(dataUrl, () => {
    anns = anns.map((a) => moveAnn(a, -b.x, -b.y));
    crop = null;
    selectedId = null;
    document.getElementById("applyCrop").hidden = true;
  });

});

canvas.addEventListener("contextmenu", (e) => {
  e.preventDefault();
  menu.hidden = false;
  menu.style.left = `${e.clientX}px`;
  menu.style.top = `${e.clientY}px`;
});
document.body.addEventListener("click", () => {
  menu.hidden = true;
});

undoBtn.addEventListener("click", undo);
redoBtn.addEventListener("click", redo);
clearBtn.addEventListener("click", () => {
  if (!anns.length) return;
  closeTextEditor(false);
  snapshot();
  updateAnnotations([]);
  selectedId = null;
  render();
});
textEdit.addEventListener("pointerdown", (e) => e.stopPropagation());
textEdit.addEventListener("input", () => {
  if (!editingTextId) return;
  updateAnnotations(anns.map((a) => (a.id === editingTextId ? { ...a, text: textEdit.value } : a)));
  layoutTextEditor();
});
textEdit.addEventListener("blur", () => closeTextEditor(true));
textEdit.addEventListener("keydown", (e) => {
  e.stopPropagation();
  if (e.key === "Escape") {
    e.preventDefault();
    closeTextEditor(true);
  }
});
deleteBtn.addEventListener("click", () => {
  if (!selectedId) return;
  snapshot();
  updateAnnotations(anns.filter((a) => a.id !== selectedId));
  selectedId = null;
  render();
});

window.addEventListener("keydown", (e) => {
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
  const meta = e.metaKey || e.ctrlKey;
  if (meta && e.key.toLowerCase() === "z") {
    e.preventDefault();
    if (e.shiftKey) redo();
    else undo();
  } else if (meta && e.key.toLowerCase() === "y") {
    e.preventDefault();
    redo();
  } else if (meta && (e.key === "=" || e.key === "+" || e.code === "Equal" || e.code === "NumpadAdd")) {
    e.preventDefault();
    setZoom(stepZoom(zoom, ZOOM_STEP));
  } else if (meta && (e.key === "-" || e.code === "Minus" || e.code === "NumpadSubtract")) {
    e.preventDefault();
    setZoom(stepZoom(zoom, -ZOOM_STEP));
  } else if (meta && (e.key === "0" || e.code === "Digit0" || e.code === "Numpad0")) {
    e.preventDefault();
    zoomToActual();
  } else if (e.key === "Enter" && crop) {
    e.preventDefault();
    document.getElementById("applyCrop").click();
  } else if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
    e.preventDefault();
    deleteBtn.click();
  } else if (e.key === "Escape") {
    closeTextEditor(true);
    selectedId = null;
    crop = null;
    tool = "select";
    document.querySelectorAll("[data-tool]").forEach((b) => b.classList.toggle("on", b.dataset.tool === "select"));
    emojiPicker.hidden = true;
    document.getElementById("applyCrop").hidden = true;
    render();
  }
});

async function toBlob(type, quality) {
  await imageTransition;
  closeTextEditor(true);
  return documentBlob(currentDocument(), type, quality, { baseImage: image });
}

function mimeFor(format) {
  if (format === "jpeg") return "image/jpeg";
  if (format === "webp") return "image/webp";
  if (format === "avif") return "image/avif";
  return "image/png";
}

addExportAction("copy", async () => {
  const blob = await toBlob("image/png");
  await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
});
addExportAction("download", async () => {
  let format = record?.format || "png";
  const blob = await toBlob(mimeFor(format), 0.92);
  // toBlob falls back to PNG for types it cannot encode; name the file to match.
  if (blob.type !== mimeFor(format)) format = "png";
  await runExport(blob, format, "image");
});
addExportAction("pdf", async () => {
  const blob = await toBlob("image/jpeg", 0.92);
  const buf = await blob.arrayBuffer();
  const pdf = jpegToPdfBlob(new Uint8Array(buf), canvas.width, canvas.height, record?.title || "Capture");
  await runExport(pdf, "jpeg", "pdf");
});

function addExportAction(id, action) {
  document.getElementById(id).addEventListener("click", () => {
    void action().catch((error) => status("Could not export: " + (error?.message || error), true));
  });
}

async function runExport(blob, format, kind) {
  await exportCapture(blob,
    { ...(record || {}), format, width: canvas.width, height: canvas.height, createdAt: record?.createdAt || Date.now() }, kind);
}
document.getElementById("settings").addEventListener("click", () => {
  void navigateTo(chrome.runtime.getURL("options.html"));
});

const feedbackPanel = document.getElementById("feedbackPanel");
const feedbackBody = document.getElementById("feedbackBody");
const feedbackStatus = document.getElementById("feedbackStatus");

function hidePanels() {
  feedbackPanel.hidden = true;
}

function loadRecord(next) {
  ready = false;
  record = next;
  document.getElementById("title").textContent = record.title;
  document.getElementById("meta").textContent = `${record.width} × ${record.height} · ${String(record.format).toUpperCase()}`;
  image = new Image();
  image.onload = () => {
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    anns = cloneAnns(record.document?.annotations || []);
    crop = null;
    drawing = null;
    selectedId = null;
    undoStack = [];
    redoStack = [];
    document.getElementById("applyCrop").hidden = true;
    documentVersion = savedVersion = observedVersion = 0;
    ready = true;
    status("Saved on this device", false, false);
    render();
    zoomToFit();
  };
  image.onerror = () => status("Could not load this capture.", true);
  image.src = record.document?.baseDataUrl || record.dataUrl;
  history.replaceState(null, "", "editor.html?id=" + encodeURIComponent(record.id));
}

document.getElementById("feedback").addEventListener("click", (e) => {
  e.stopPropagation();
  emojiPicker.hidden = true;
  feedbackPanel.hidden = !feedbackPanel.hidden;
  if (!feedbackPanel.hidden) feedbackBody.focus();
});
document.getElementById("feedbackCancel").addEventListener("click", () => {
  feedbackBody.value = "";
  feedbackStatus.textContent = "";
  hidePanels();
});
document.getElementById("feedbackSubmit").addEventListener("click", async () => {
  const text = feedbackBody.value.trim();
  if (!text) return;
  feedbackStatus.textContent = "Sending…";
  try {
    const result = await sendLongshotFeedback(text);
    feedbackStatus.textContent = result.delivered ? "Sent. Thank you." : "Could not send feedback. Your message is still here; try again.";
    if (result.delivered) {
      feedbackBody.value = "";
      setTimeout(hidePanels, 1200);
    }
  } catch {
    feedbackStatus.textContent = "Could not send feedback. Try again in a moment.";
  }
});
feedbackPanel.addEventListener("click", (e) => e.stopPropagation());
emojiPicker.addEventListener("click", (e) => e.stopPropagation());
document.body.addEventListener("click", () => {
  hidePanels();
  if (tool !== "emoji") emojiPicker.hidden = true;
});
menu.addEventListener("click", (e) => {
  const act = e.target.dataset.act;
  if (act === "copy") document.getElementById("copy").click();
  if (act === "download") document.getElementById("download").click();
  if (act === "pdf") document.getElementById("pdf").click();
});

zoomOutBtn.addEventListener("click", () => setZoom(stepZoom(zoom, -ZOOM_STEP)));
zoomInBtn.addEventListener("click", () => setZoom(stepZoom(zoom, ZOOM_STEP)));
zoomFitBtn.addEventListener("click", () => zoomToFit());
zoomLabelBtn.addEventListener("click", () => {
  if (Math.abs(zoom - 1) < 0.005) zoomToFit();
  else zoomToActual();
});
workspace.addEventListener(
  "wheel",
  (e) => {
    if (!(e.ctrlKey || e.metaKey)) return;
    e.preventDefault();
    const delta = e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP;
    setZoom(stepZoom(zoom, delta), { x: e.clientX, y: e.clientY });
  },
  { passive: false },
);
window.addEventListener("resize", () => {
  if (zoomMode === "fit") zoomToFit();
});
applyZoomStyles();
syncEditButtons();

document.querySelector('a[href="files.html"]').addEventListener("click", (event) => {
  event.preventDefault();
  void navigateTo("files.html");
});

(async () => {
  const id = new URLSearchParams(location.search).get("id");
  const current = id ? null : (await chrome.storage.local.get("longshotCurrent")).longshotCurrent;
  const found = await longshotHistoryGet(id || current?.id || "");
  if (found) loadRecord(found);
  else {
    document.getElementById("title").textContent = "No capture";
    status(id ? "This capture is no longer in Files." : "Capture a page to start editing.");
    document.querySelectorAll("header button, nav button").forEach((button) => { button.disabled = true; });
    document.getElementById("settings").disabled = false;
  }
})().catch((error) => status(error.message || "Could not load captures.", true));

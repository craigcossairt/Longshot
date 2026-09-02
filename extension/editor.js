const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const menu = document.getElementById("menu");
const fileInput = document.getElementById("file");
const undoBtn = document.getElementById("undo");
const redoBtn = document.getElementById("redo");
const clearBtn = document.getElementById("clearAnns");
const deleteBtn = document.getElementById("deleteAnn");
const textEdit = document.getElementById("textEdit");
const emojiPicker = document.getElementById("emojiPicker");
const emojiGrid = document.getElementById("emojiGrid");
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
const imgCache = new Map();

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
    record: record ? { ...record } : null,
  };
}

function snapshot() {
  undoStack.push(frame());
  if (undoStack.length > 80) undoStack.shift();
  redoStack = [];
  syncEditButtons();
}

function restoreFrame(next) {
  closeTextEditor(false);
  anns = cloneAnns(next.anns);
  selectedId = null;
  crop = null;
  document.getElementById("applyCrop").hidden = true;
  if (next.record) record = { ...next.record };
  if (next.src && (image.src !== next.src || canvas.width !== next.w || canvas.height !== next.h)) {
    const img = new Image();
    img.onload = () => {
      image = img;
      canvas.width = next.w;
      canvas.height = next.h;
      if (record) {
        record.dataUrl = next.src;
        record.width = next.w;
        record.height = next.h;
        chrome.storage.local.set({ longshotCurrent: record });
      }
      render();
    };
    img.src = next.src;
    return;
  }
  render();
  syncEditButtons();
}

function undo() {
  if (!undoStack.length) return;
  redoStack.push(frame());
  restoreFrame(undoStack.pop());
  syncEditButtons();
}

function redo() {
  if (!redoStack.length) return;
  undoStack.push(frame());
  restoreFrame(redoStack.pop());
  syncEditButtons();
}

function syncEditButtons() {
  undoBtn.disabled = undoStack.length === 0;
  redoBtn.disabled = redoStack.length === 0;
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
    const w = Math.max(40, ctx.measureText(a.text || " ").width);
    return { x: a.x, y: a.y - fontSize, w, h: fontSize * 1.3 };
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
  const pad = 8;
  if (a.type === "pen") {
    const tol = Math.max(10, a.w || 3);
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
    return Math.hypot(p.x - (q.x + t * dx), p.y - (q.y + t * dy)) < 16;
  }
  return p.x >= b.x - pad && p.x <= b.x + b.w + pad && p.y >= b.y - pad && p.y <= b.y + b.h + pad;
}

function handleSize() {
  return Math.max(10, Math.min(18, canvas.width / 70));
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
      anns = anns.filter((a) => a.id !== id);
    } else {
      anns = anns.map((a) => (a.id === id ? { ...a, text: value } : a));
    }
  }
  render();
}

function openTextEditor(a, keepSelection) {
  editingTextId = a.id;
  if (!keepSelection) selectedId = null;
  const fontSize = a.fontSize || 28;
  textEdit.hidden = false;
  textEdit.value = a.text || "";
  textEdit.style.left = `${a.x}px`;
  textEdit.style.top = `${a.y - fontSize}px`;
  textEdit.style.width = `${Math.max(120, (a.w || 280))}px`;
  textEdit.style.height = `${fontSize * 3.2}px`;
  textEdit.style.fontSize = `${fontSize}px`;
  textEdit.style.color = a.color || "#f1f0ec";
  textEdit.focus();
  render();
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

function arrowPts(x1, y1, x2, y2, width) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.hypot(dx, dy);
  const shaft = Math.max(1.5, width || 3);
  if (length < 0.5) {
    const s = Math.max(6, shaft);
    return [
      [x2, y2 - s * 1.2],
      [x2 + s, y2 + s * 0.7],
      [x2 - s, y2 + s * 0.7],
    ];
  }
  const ux = dx / length;
  const uy = dy / length;
  const px = -uy;
  const py = ux;
  const headLen = Math.min(length * 0.5, Math.max(shaft * 4.2, 24));
  const headHalf = Math.max(shaft * 1.5 + 3, headLen * 0.48);
  const half = shaft / 2;
  const neck = Math.max(0, length - headLen);
  const nx = x1 + ux * neck;
  const ny = y1 + uy * neck;
  return [
    [x1 + px * half, y1 + py * half],
    [nx + px * half, ny + py * half],
    [nx + px * headHalf, ny + py * headHalf],
    [x2, y2],
    [nx - px * headHalf, ny - py * headHalf],
    [nx - px * half, ny - py * half],
    [x1 - px * half, y1 - py * half],
  ];
}

function drawAnn(a) {
  ctx.save();
  ctx.strokeStyle = a.color;
  ctx.fillStyle = a.color;
  ctx.lineWidth = a.w || 3;
  ctx.lineCap = "round";
  if (a.type === "pen") {
    ctx.beginPath();
    a.pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
    ctx.stroke();
  } else if (a.type === "rect") {
    ctx.globalAlpha = 0.2;
    ctx.fillRect(a.x, a.y, a.bw, a.bh);
    ctx.globalAlpha = 1;
    ctx.strokeRect(a.x, a.y, a.bw, a.bh);
  } else if (a.type === "ellipse") {
    ctx.beginPath();
    ctx.ellipse(a.x + a.bw / 2, a.y + a.bh / 2, Math.abs(a.bw / 2), Math.abs(a.bh / 2), 0, 0, Math.PI * 2);
    ctx.globalAlpha = 0.2;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.stroke();
  } else if (a.type === "arrow") {
    const pts = arrowPts(a.x, a.y, a.x + a.bw, a.y + a.bh, a.w || 3);
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath();
    ctx.lineJoin = "miter";
    ctx.miterLimit = 3;
    ctx.fill();
  } else if (a.type === "text") {
    if (editingTextId === a.id) {
      ctx.restore();
      return;
    }
    ctx.font = `${a.fontSize || 28}px sans-serif`;
    ctx.fillText(a.text, a.x, a.y);
  } else if (a.type === "emoji") {
    ctx.font = `${a.size || 48}px sans-serif`;
    ctx.fillText(a.emoji, a.x, a.y + (a.size || 48) * 0.82);
  } else if (a.type === "image") {
    const img = imageEl(a);
    if (img) ctx.drawImage(img, a.x, a.y, a.bw, a.bh);
  }
  ctx.restore();
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
  if (e.button !== 0) return;
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
    if (hit?.type === "text") openTextEditor(hit, true);
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
    anns.push({ id, type: "emoji", x: p.x, y: p.y, emoji: stamp, size: 48, color });
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
    anns.push({ id, type: "image", x: p.x, y: p.y, bw: 240, bh: 160, src: pendingImageSrc, color });
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
  if (drag && e.buttons === 1) {
    if (!drag.snapped) {
      snapshot();
      drag.snapped = true;
    }
    const dx = p.x - drag.last.x;
    const dy = p.y - drag.last.y;
    anns = anns.map((a) => {
      if (a.id !== drag.id) return a;
      return drag.mode === "resize" ? resizeAnn(a, drag.handle, dx, dy) : moveAnn(a, dx, dy);
    });
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
    anns.push(next);
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
    anns.push(drawing);
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
      anns = anns.map((a) => (a.id === selectedId ? { ...a, color: c } : a));
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
  const b = normCrop(crop);
  if (!b || b.w < 8 || b.h < 8) return;
  snapshot();
  const next = document.createElement("canvas");
  next.width = Math.max(1, Math.round(b.w));
  next.height = Math.max(1, Math.round(b.h));
  next.getContext("2d").drawImage(image, b.x, b.y, b.w, b.h, 0, 0, next.width, next.height);
  const dataUrl = next.toDataURL();
  const cropped = new Image();
  cropped.onload = function onCropLoaded() {
    image = cropped;
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    anns = anns.map((a) => moveAnn(a, -b.x, -b.y));
    crop = null;
    selectedId = null;
    document.getElementById("applyCrop").hidden = true;
    render();
  };
  cropped.src = dataUrl;
  if (record) {
    record.dataUrl = dataUrl;
    record.width = next.width;
    record.height = next.height;
    record.edited = true;
    record.byteSize = typeof longshotByteSize === "function" ? longshotByteSize(dataUrl) : record.byteSize;
    chrome.storage.local.set({ longshotCurrent: record });
    if (typeof longshotPushHistory === "function") longshotPushHistory(record);
  }
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
  anns = [];
  selectedId = null;
  render();
});
textEdit.addEventListener("pointerdown", (e) => e.stopPropagation());
textEdit.addEventListener("input", () => {
  if (!editingTextId) return;
  anns = anns.map((a) => (a.id === editingTextId ? { ...a, text: textEdit.value } : a));
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
  anns = anns.filter((a) => a.id !== selectedId);
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

function baked() {
  const c = document.createElement("canvas");
  c.width = canvas.width;
  c.height = canvas.height;
  c.getContext("2d").drawImage(canvas, 0, 0);
  return c;
}

async function toBlob(type, quality) {
  return await new Promise((resolve) => baked().toBlob(resolve, type, quality));
}

function mimeFor(format) {
  if (format === "jpeg") return "image/jpeg";
  if (format === "webp") return "image/webp";
  if (format === "avif") return "image/avif";
  return "image/png";
}

document.getElementById("copy").addEventListener("click", async () => {
  const blob = await toBlob("image/png");
  await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
});
document.getElementById("download").addEventListener("click", async () => {
  const format = record?.format || "png";
  const mime = mimeFor(format);
  const blob = await toBlob(mime, 0.92);
  const dataUrl = await blobToUrl(blob);
  chrome.runtime.sendMessage({ type: "LONGSHOT_EXPORT", kind: "image", dataUrl, format });
});
document.getElementById("pdf").addEventListener("click", async () => {
  const blob = await toBlob("image/jpeg", 0.92);
  const buf = await blob.arrayBuffer();
  const pdf = jpegToPdfBlob(new Uint8Array(buf), canvas.width, canvas.height, record?.title || "Capture");
  const dataUrl = await blobToUrl(pdf);
  chrome.runtime.sendMessage({ type: "LONGSHOT_EXPORT", kind: "pdf", dataUrl });
});
document.getElementById("settings").addEventListener("click", () => {
  location.href = chrome.runtime.getURL("options.html");
});

const feedbackPanel = document.getElementById("feedbackPanel");
const feedbackBody = document.getElementById("feedbackBody");
const feedbackStatus = document.getElementById("feedbackStatus");

function hidePanels() {
  feedbackPanel.hidden = true;
}

function loadRecord(next) {
  record = next;
  document.getElementById("title").textContent = record.title;
  document.getElementById("meta").textContent = `${record.width} × ${record.height} · ${String(record.format).toUpperCase()}`;
  image = new Image();
  image.onload = () => {
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    anns = [];
    crop = null;
    drawing = null;
    selectedId = null;
    undoStack = [];
    redoStack = [];
    document.getElementById("applyCrop").hidden = true;
    render();
  };
  image.src = record.dataUrl;
  chrome.storage.local.set({ longshotCurrent: record });
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
    feedbackBody.value = "";
    feedbackStatus.textContent = result.delivered ? "Sent. Thank you." : "Could not send feedback. Try again in a moment.";
    setTimeout(hidePanels, 1200);
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

function blobToUrl(blob) {
  return new Promise((resolve) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.readAsDataURL(blob);
  });
}

syncEditButtons();

(async () => {
  const id = new URLSearchParams(location.search).get("id");
  if (id) {
    const found = await longshotHistoryGet(id);
    if (found) {
      loadRecord(found);
      return;
    }
  }
  chrome.storage.local.get("longshotCurrent", ({ longshotCurrent }) => {
    if (!longshotCurrent) {
      document.getElementById("title").textContent = "No capture";
      return;
    }
    loadRecord(longshotCurrent);
  });
})();

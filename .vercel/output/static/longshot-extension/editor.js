const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const stage = document.getElementById("stage");
const menu = document.getElementById("menu");
const fileInput = document.getElementById("file");
const COLORS = ["#e15a4a", "#e08a3c", "#d2d6d0", "#3d9a6a", "#4a7ec4", "#f7f7f2", "#111111"];
const EMOJI = ["⭐", "✅", "❌", "❗", "➡️", "⬅️", "📌", "💡", "👍", "🎯"];

let image = new Image();
let record = null;
let tool = "select";
let color = COLORS[0];
let anns = [];
let crop = null;
let drawing = null;
let stampImg = null;

function render() {
  if (!image.naturalWidth) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0);
  for (const a of anns) drawAnn(a);
  if (drawing) drawAnn(drawing);
  if (crop) {
    ctx.fillStyle = "rgba(14,14,16,0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.clearRect(crop.x, crop.y, crop.w, crop.h);
    ctx.drawImage(image, crop.x, crop.y, crop.w, crop.h, crop.x, crop.y, crop.w, crop.h);
    for (const a of anns) drawAnn(a);
    ctx.strokeStyle = "#d2d6d0";
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(crop.x, crop.y, crop.w, crop.h);
    ctx.setLineDash([]);
  }
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
    ctx.font = "28px sans-serif";
    ctx.fillText(a.text, a.x, a.y);
  } else if (a.type === "emoji") {
    ctx.font = "42px sans-serif";
    ctx.fillText(a.emoji, a.x, a.y);
  } else if (a.type === "image" && a.el) {
    ctx.drawImage(a.el, a.x, a.y, a.bw, a.bh);
  }
  ctx.restore();
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
  const p = pos(e);
  if (tool === "crop") {
    crop = { x: p.x, y: p.y, w: 0, h: 0 };
    document.getElementById("applyCrop").hidden = false;
    return;
  }
  if (tool === "text") {
    const text = prompt("Text", "Note");
    if (text) anns.push({ type: "text", x: p.x, y: p.y, text, color });
    render();
    return;
  }
  if (tool === "emoji") {
    const emoji = prompt(`Stamp (${EMOJI.join(" ")})`, EMOJI[0]);
    if (emoji) anns.push({ type: "emoji", x: p.x, y: p.y, emoji, color });
    render();
    return;
  }
  if (tool === "image") {
    if (!stampImg) {
      fileInput.click();
      return;
    }
    anns.push({ type: "image", x: p.x, y: p.y, bw: 240, bh: 160, el: stampImg, color });
    stampImg = null;
    render();
    return;
  }
  if (tool === "pen") drawing = { type: "pen", pts: [p], color, w: 3 };
  else if (tool !== "select") drawing = { type: tool, x: p.x, y: p.y, bw: 0, bh: 0, color, w: 3 };
});

canvas.addEventListener("pointermove", (e) => {
  if (e.buttons !== 1) return;
  const p = pos(e);
  if (crop && tool === "crop") {
    crop.w = p.x - crop.x;
    crop.h = p.y - crop.y;
    render();
    return;
  }
  if (!drawing) return;
  if (drawing.type === "pen") drawing.pts.push(p);
  else {
    drawing.bw = p.x - drawing.x;
    drawing.bh = p.y - drawing.y;
  }
  render();
});

canvas.addEventListener("pointerup", () => {
  if (drawing) {
    anns.push(drawing);
    drawing = null;
    render();
  }
});

document.querySelectorAll("[data-tool]").forEach((btn) => {
  btn.addEventListener("click", () => {
    tool = btn.dataset.tool;
    document.querySelectorAll("[data-tool]").forEach((b) => b.classList.toggle("on", b === btn));
    if (tool === "image") fileInput.click();
  });
});

COLORS.forEach((c) => {
  const i = document.createElement("i");
  i.style.background = c;
  i.addEventListener("click", () => {
    color = c;
  });
  document.getElementById("swatches").appendChild(i);
});

fileInput.addEventListener("change", () => {
  const f = fileInput.files[0];
  fileInput.value = "";
  if (!f) return;
  const img = new Image();
  img.onload = () => {
    stampImg = img;
    tool = "image";
  };
  img.src = URL.createObjectURL(f);
});

document.getElementById("applyCrop").addEventListener("click", () => {
  if (!crop) return;
  const x = crop.w < 0 ? crop.x + crop.w : crop.x;
  const y = crop.h < 0 ? crop.y + crop.h : crop.y;
  const w = Math.abs(crop.w);
  const h = Math.abs(crop.h);
  const next = document.createElement("canvas");
  next.width = Math.max(1, Math.round(w));
  next.height = Math.max(1, Math.round(h));
  next.getContext("2d").drawImage(canvas, x, y, w, h, 0, 0, next.width, next.height);
  image = new Image();
  image.onload = () => {
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    anns = [];
    crop = null;
    document.getElementById("applyCrop").hidden = true;
    render();
  };
  image.src = next.toDataURL();
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

document.getElementById("copy").addEventListener("click", async () => {
  const blob = await toBlob("image/png");
  await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
});
document.getElementById("download").addEventListener("click", async () => {
  const format = record?.format || "png";
  const mime = format === "jpeg" ? "image/jpeg" : format === "webp" ? "image/webp" : "image/png";
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

chrome.storage.local.get("longshotCurrent", ({ longshotCurrent }) => {
  if (!longshotCurrent) {
    document.getElementById("title").textContent = "No capture";
    return;
  }
  record = longshotCurrent;
  document.getElementById("title").textContent = record.title;
  document.getElementById("meta").textContent = `${record.width} × ${record.height} · ${String(record.format).toUpperCase()}`;
  image.onload = () => {
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    render();
  };
  image.src = record.dataUrl;
});

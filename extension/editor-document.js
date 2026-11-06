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

export function drawAnnotation(ctx, a, { image = null, editingTextId = null } = {}) {
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
    String(a.text || "").split("\n").forEach((line, i) => ctx.fillText(line, a.x, a.y + i * (a.fontSize || 28) * 1.3));
  } else if (a.type === "emoji") {
    ctx.font = `${a.size || 48}px sans-serif`;
    ctx.fillText(a.emoji, a.x, a.y + (a.size || 48) * 0.82);
  } else if (a.type === "image") {
    const img = image;
    if (img) ctx.drawImage(img, a.x, a.y, a.bw, a.bh);
  }
  ctx.restore();
}


export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not read an image in this capture."));
    image.src = src;
  });
}

export async function renderDocument(doc) {
  const [base, overlays] = await Promise.all([
    loadImage(doc.baseDataUrl),
    Promise.all(doc.annotations.map((a) => a.type === "image" ? loadImage(a.src) : null)),
  ]);
  const canvas = document.createElement("canvas");
  canvas.width = doc.width;
  canvas.height = doc.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(base, 0, 0);
  doc.annotations.forEach((a, i) => drawAnnotation(ctx, a, { image: overlays[i] }));
  return canvas;
}

export async function documentBlob(doc, type = "image/png", quality = 0.92) {
  const canvas = await renderDocument(doc);
  return new Promise((resolve, reject) => canvas.toBlob((blob) => {
    if (blob) resolve(blob);
    else reject(new Error("This capture is too large to export. Crop it and try again."));
  }, type, quality));
}

export function blobDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

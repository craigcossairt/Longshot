import { mimeFor, usesQuality } from "./formats.js";

export function fitLimits(source, settings, { createCanvas }) {
  let w = source.width * (settings.scalePercent / 100);
  let h = source.height * (settings.scalePercent / 100);
  const scale = Math.min(1, (settings.maxWidth || w) / w, (settings.maxHeight || h) / h);
  w = Math.max(1, Math.round(w * scale));
  h = Math.max(1, Math.round(h * scale));
  if (w === source.width && h === source.height) return source;
  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(source, 0, 0, w, h);
  return canvas;
}

export async function fitFileSize(source, settings, { encode, createCanvas }) {
  const max = (Number(settings.maxFileMB) || 0) * 1024 * 1024;
  if (!max) return source;
  const mime = mimeFor(settings.format);
  let canvas = source;
  let quality = settings.quality || 0.92;
  let encoded = await encode(canvas, { type: mime, quality });
  if (encoded.size <= max) return canvas;
  if (usesQuality(settings.format)) {
    for (const q of [0.82, 0.7, 0.58, 0.45, 0.32]) {
      quality = Math.min(quality, q);
      encoded = await encode(canvas, { type: mime, quality });
      if (encoded.size <= max) return canvas;
    }
  }
  for (let i = 0; i < 8; i++) {
    const factor = Math.sqrt(max / encoded.size) * 0.9;
    if (!Number.isFinite(factor) || factor >= 0.99) break;
    const w = Math.max(256, Math.round(canvas.width * factor));
    const h = Math.max(256, Math.round(canvas.height * factor));
    if (w === canvas.width && h === canvas.height) break;
    const next = createCanvas(w, h);
    const ctx = next.getContext("2d");
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(canvas, 0, 0, w, h);
    canvas = next;
    encoded = await encode(canvas, {
      type: mime,
      quality: usesQuality(settings.format) ? quality : 1,
    });
    if (encoded.size <= max) return canvas;
    if (w <= 256 || h <= 256) break;
  }
  return canvas;
}

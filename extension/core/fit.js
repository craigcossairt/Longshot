import { mimeFor, usesQuality } from "./formats.js";

// Chrome cannot allocate canvases past these; an oversized one draws as blank.
export const CANVAS_MAX_SIDE = 32768;
export const CANVAS_MAX_AREA = 16384 * 16384;

// Overall scale for a width x height image: scalePercent, then the max width/height
// settings and canvas limits, never enlarging past scalePercent.
export function limitScale(width, height, settings) {
  const pct = (settings.scalePercent || 100) / 100;
  const w = Math.max(1, width * pct);
  const h = Math.max(1, height * pct);
  const fit = Math.min(
    1,
    (settings.maxWidth || w) / w,
    (settings.maxHeight || h) / h,
    CANVAS_MAX_SIDE / w,
    CANVAS_MAX_SIDE / h,
    Math.sqrt(CANVAS_MAX_AREA / (w * h)),
  );
  return pct * fit;
}

export function fitLimits(source, settings, { createCanvas }) {
  const scale = limitScale(source.width, source.height, settings);
  const w = Math.max(1, Math.round(source.width * scale));
  const h = Math.max(1, Math.round(source.height * scale));
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
    let factor = Math.sqrt(max / encoded.size) * 0.9;
    if (!Number.isFinite(factor)) break;
    // One factor for both sides keeps the aspect ratio; the shorter side stops at 256px.
    factor = Math.max(factor, 256 / Math.min(canvas.width, canvas.height));
    if (factor >= 0.99) break;
    const w = Math.max(1, Math.round(canvas.width * factor));
    const h = Math.max(1, Math.round(canvas.height * factor));
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
    if (Math.min(w, h) <= 256) break;
  }
  return canvas;
}

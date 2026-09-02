import type { Annotation, CropRect } from "@/lib/types";
import { fillArrow } from "@/lib/annotate";
import { loadImage } from "@/lib/image-io";

export async function rasterize(
  dataUrl: string,
  annotations: Annotation[],
  crop: CropRect | null,
) {
  const img = await loadImage(dataUrl);
  const sx = crop?.x ?? 0;
  const sy = crop?.y ?? 0;
  const sw = crop?.w ?? img.naturalWidth;
  const sh = crop?.h ?? img.naturalHeight;
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(sw));
  canvas.height = Math.max(1, Math.round(sh));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unsupported");
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(-sx, -sy);
  for (const ann of annotations) await drawAnnotation(ctx, ann, img);
  ctx.restore();
  return canvas;
}

async function drawAnnotation(ctx: CanvasRenderingContext2D, ann: Annotation, img: HTMLImageElement) {
  ctx.save();
  ctx.strokeStyle = ann.color;
  ctx.fillStyle = ann.color;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = ann.strokeWidth;

  if (ann.type === "pen" || ann.type === "highlight") {
    if (ann.points.length >= 2) {
      ctx.globalAlpha = ann.type === "highlight" ? 0.35 : 1;
      ctx.lineWidth = ann.type === "highlight" ? Math.max(12, ann.strokeWidth * 3) : ann.strokeWidth;
      ctx.beginPath();
      ctx.moveTo(ann.points[0].x, ann.points[0].y);
      for (let i = 1; i < ann.points.length; i++) ctx.lineTo(ann.points[i].x, ann.points[i].y);
      ctx.stroke();
    }
  } else if (ann.type === "rect") {
    const { x, y, w, h } = norm(ann);
    if (ann.filled) {
      ctx.globalAlpha = 0.2;
      ctx.fillRect(x, y, w, h);
      ctx.globalAlpha = 1;
    }
    ctx.strokeRect(x, y, w, h);
  } else if (ann.type === "ellipse") {
    const { x, y, w, h } = norm(ann);
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h / 2, Math.abs(w / 2), Math.abs(h / 2), 0, 0, Math.PI * 2);
    if (ann.filled) {
      ctx.globalAlpha = 0.2;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    ctx.stroke();
  } else if (ann.type === "line") {
    ctx.beginPath();
    ctx.moveTo(ann.x, ann.y);
    ctx.lineTo(ann.x + ann.w, ann.y + ann.h);
    ctx.stroke();
  } else if (ann.type === "arrow") {
    fillArrow(ctx, ann.x, ann.y, ann.x + ann.w, ann.y + ann.h, ann.strokeWidth);
  } else if (ann.type === "blur") {
    const { x, y, w, h } = norm(ann);
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.filter = "blur(12px)";
    ctx.drawImage(img, 0, 0);
    ctx.restore();
    ctx.strokeStyle = "rgba(0,0,0,0.25)";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);
  } else if (ann.type === "text") {
    ctx.font = `${ann.fontSize}px Outfit, system-ui, sans-serif`;
    ctx.textBaseline = "top";
    wrapText(ctx, ann.text, ann.x, ann.y, ann.w, ann.fontSize * 1.3);
  } else if (ann.type === "emoji") {
    ctx.font = `${ann.size}px "Apple Color Emoji", "Segoe UI Emoji", sans-serif`;
    ctx.textBaseline = "top";
    ctx.fillText(ann.emoji, ann.x, ann.y);
  } else if (ann.type === "image") {
    try {
      const overlay = await loadImage(ann.src);
      ctx.drawImage(overlay, ann.x, ann.y, ann.w, ann.h);
    } catch {
      // skip broken overlay
    }
  }
  ctx.restore();
}

function norm(ann: { x: number; y: number; w: number; h: number }) {
  const x = ann.w < 0 ? ann.x + ann.w : ann.x;
  const y = ann.h < 0 ? ann.y + ann.h : ann.y;
  return { x, y, w: Math.abs(ann.w), h: Math.abs(ann.h) };
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(/\s+/);
  let line = "";
  let yy = y;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, yy);
      line = word;
      yy += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, yy);
}

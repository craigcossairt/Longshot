import { jsPDF } from "jspdf";
import type { AppSettings, CaptureRecord, ImageFormat } from "@/lib/types";
import { buildFilename, leafName } from "@/lib/filename";

export function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load image"));
    img.src = src;
  });
}

export function canvasToBlob(canvas: HTMLCanvasElement, format: ImageFormat, quality: number) {
  if (canvas.width < 1 || canvas.height < 1) {
    return Promise.reject(new Error("Capture produced an empty image. Try again."));
  }
  const mime = format === "jpeg" ? "image/jpeg" : format === "webp" ? "image/webp" : "image/png";
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error("Could not encode image"));
        else resolve(blob);
      },
      mime,
      quality,
    );
  });
}

export async function blobToDataUrl(blob: Blob) {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(blob);
  });
}

export async function dataUrlToCanvas(dataUrl: string) {
  const img = await loadImage(dataUrl);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unsupported");
  ctx.drawImage(img, 0, 0);
  return canvas;
}

export function fitWithinLimits(
  width: number,
  height: number,
  settings: Pick<AppSettings, "maxWidth" | "maxHeight" | "scalePercent">,
) {
  let w = width * (settings.scalePercent / 100);
  let h = height * (settings.scalePercent / 100);
  const maxW = settings.maxWidth > 0 ? settings.maxWidth : Infinity;
  const maxH = settings.maxHeight > 0 ? settings.maxHeight : Infinity;
  const scale = Math.min(1, maxW / w, maxH / h);
  w = Math.max(1, Math.round(w * scale));
  h = Math.max(1, Math.round(h * scale));
  return { width: w, height: h };
}

export function scaleCanvas(source: HTMLCanvasElement, width: number, height: number) {
  const sw = source.width;
  const sh = source.height;
  if (sw < 1 || sh < 1) {
    throw new Error("Capture produced an empty image. Try again.");
  }
  const w = Math.max(1, Math.round(width));
  const h = Math.max(1, Math.round(height));
  if (sw === w && sh === h) return source;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return source;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, 0, 0, w, h);
  return canvas;
}

export async function constrainCanvas(source: HTMLCanvasElement, settings: AppSettings) {
  const fitted = fitWithinLimits(source.width, source.height, settings);
  let canvas = scaleCanvas(source, fitted.width, fitted.height);
  const maxBytes = settings.maxFileMB > 0 ? settings.maxFileMB * 1024 * 1024 : 0;
  let quality = settings.quality;
  let blob = await canvasToBlob(canvas, settings.format, quality);
  if (!maxBytes || blob.size <= maxBytes) return { canvas, blob };

  if (settings.format !== "png") {
    for (const q of [0.82, 0.7, 0.58, 0.45, 0.32]) {
      quality = Math.min(quality, q);
      blob = await canvasToBlob(canvas, settings.format, quality);
      if (blob.size <= maxBytes) return { canvas, blob };
    }
  }

  for (let i = 0; i < 8; i++) {
    const factor = Math.sqrt(maxBytes / blob.size) * 0.9;
    if (!Number.isFinite(factor) || factor >= 0.99) break;
    const w = Math.max(256, Math.round(canvas.width * factor));
    const h = Math.max(256, Math.round(canvas.height * factor));
    if (w === canvas.width && h === canvas.height) break;
    canvas = scaleCanvas(canvas, w, h);
    blob = await canvasToBlob(canvas, settings.format, settings.format === "png" ? 1 : quality);
    if (blob.size <= maxBytes) return { canvas, blob };
    if (w <= 256 || h <= 256) break;
  }
  return { canvas, blob };
}

type SavePickerWindow = Window & {
  showSaveFilePicker?: (options: {
    suggestedName?: string;
    types?: Array<{ description: string; accept: Record<string, string[]> }>;
  }) => Promise<{ createWritable: () => Promise<{ write: (data: Blob) => Promise<void>; close: () => Promise<void> }> }>;
};

export async function saveBlob(blob: Blob, filename: string, saveAsDialog: boolean) {
  const picker = (window as SavePickerWindow).showSaveFilePicker;
  if (saveAsDialog && picker) {
    try {
      const handle = await picker({
        suggestedName: leafName(filename),
        types: [
          {
            description: blob.type || "File",
            accept: { [blob.type || "application/octet-stream"]: [`.${leafName(filename).split(".").pop()}`] },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = leafName(filename);
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function copyPng(canvas: HTMLCanvasElement) {
  const blob = await canvasToBlob(canvas, "png", 1);
  await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
}

export async function canvasToPdfBlob(canvas: HTMLCanvasElement, title: string) {
  const jpeg = await canvasToBlob(canvas, "jpeg", 0.92);
  const dataUrl = await blobToDataUrl(jpeg);
  const pxWidth = canvas.width;
  const pxHeight = canvas.height;
  const orientation = pxWidth >= pxHeight ? "landscape" : "portrait";
  const pdf = new jsPDF({
    orientation,
    unit: "px",
    format: [pxWidth, pxHeight],
    compress: true,
  });
  pdf.setProperties({ title });
  pdf.addImage(dataUrl, "JPEG", 0, 0, pxWidth, pxHeight, undefined, "FAST");
  return pdf.output("blob");
}

export async function exportCaptureFile(
  canvas: HTMLCanvasElement,
  capture: CaptureRecord,
  settings: AppSettings,
  kind: "image" | "pdf",
) {
  if (kind === "pdf") {
    const limited = await constrainCanvas(canvas, { ...settings, format: "jpeg", quality: 0.92 });
    const blob = await canvasToPdfBlob(limited.canvas, capture.title);
    const name = buildFilename({ ...capture, format: "png" }, settings).replace(/\.[^.]+$/, ".pdf");
    await saveBlob(blob, name, settings.saveAsDialog);
    return;
  }
  const limited = await constrainCanvas(canvas, settings);
  await saveBlob(limited.blob, buildFilename({ ...capture, width: limited.canvas.width, height: limited.canvas.height }, settings), settings.saveAsDialog);
}

import type { ImageFormat } from "@/lib/types";

export const FORMAT_OPTIONS: { value: ImageFormat; label: string }[] = [
  { value: "png", label: "PNG: lossless, best for UI and text" },
  { value: "jpeg", label: "JPEG: smaller photos, can soften text" },
  { value: "webp", label: "WebP: smaller than JPEG, fewer artifacts" },
  { value: "avif", label: "AVIF: smallest files, recent browsers" },
];

export function mimeFor(format: ImageFormat) {
  if (format === "jpeg") return "image/jpeg";
  if (format === "webp") return "image/webp";
  if (format === "avif") return "image/avif";
  return "image/png";
}

export function usesQuality(format: ImageFormat) {
  return format === "jpeg" || format === "webp" || format === "avif";
}

export type SettingHint = { text: string; warn: boolean };

export function qualityHint(percent: number): SettingHint {
  if (percent < 70) {
    return { text: "Below 70% you will likely see blocky artifacts, especially on text.", warn: true };
  }
  if (percent < 80) {
    return { text: "Fine for photos. Text and UI may look soft.", warn: true };
  }
  if (percent <= 92) {
    return { text: "Recommended range for screenshots is 80 to 92%.", warn: false };
  }
  return { text: "Above 92% files grow quickly with little extra sharpness.", warn: true };
}

export function scaleHint(percent: number): SettingHint {
  if (percent < 50) {
    return { text: "Below 50% text and UI become hard to read.", warn: true };
  }
  if (percent < 100) {
    return { text: "Shrinks the capture. 100% keeps native pixels.", warn: false };
  }
  if (percent === 100) {
    return { text: "Native capture size, unless max width, height, or file size forces a shrink.", warn: false };
  }
  return { text: "Above 100% enlarges pixels. It does not add detail.", warn: true };
}

export function maxWidthHint(width: number): SettingHint {
  if (width > 0 && width < 1280) {
    return { text: "Narrower than a typical laptop capture. UI may look cramped.", warn: true };
  }
  if (width > 16384) {
    return { text: "Very large widths can fail to encode or freeze the tab.", warn: true };
  }
  return { text: "Caps width in pixels. Leave high unless you need a smaller export.", warn: false };
}

export function maxHeightHint(height: number): SettingHint {
  if (height > 0 && height < 2000) {
    return { text: "A short max height will scale long pages down aggressively.", warn: true };
  }
  if (height > 32768) {
    return { text: "Very large heights can fail to encode or freeze the tab.", warn: true };
  }
  return { text: "Caps height in pixels. Long pages scale uniformly to fit.", warn: false };
}

export function maxFileHint(mb: number): SettingHint {
  if (mb > 0 && mb <= 1) {
    return { text: "A 1 MB cap or less will scale captures down aggressively.", warn: true };
  }
  if (mb > 0 && mb < 5) {
    return { text: "Tight cap. Fine for email; text may soften.", warn: true };
  }
  if (!mb) {
    return { text: "No file size cap. Pixel limits still apply.", warn: false };
  }
  return { text: "If the capture would exceed this size, it is scaled down until it fits.", warn: false };
}



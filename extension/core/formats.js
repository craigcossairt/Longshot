export function mimeFor(format) {
  if (format === "jpeg") return "image/jpeg";
  if (format === "webp") return "image/webp";
  if (format === "avif") return "image/avif";
  return "image/png";
}

export function usesQuality(format) {
  return format === "jpeg" || format === "webp" || format === "avif";
}

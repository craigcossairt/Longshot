export async function cropVisible(dataUrl, rect, dpr, { decode, createCanvas }) {
  const bmp = await decode(dataUrl);
  const x = Math.max(0, Math.min(bmp.width - 1, Math.round(rect.x * dpr)));
  const y = Math.max(0, Math.min(bmp.height - 1, Math.round(rect.y * dpr)));
  const w = Math.max(1, Math.min(bmp.width - x, Math.round(rect.w * dpr)));
  const h = Math.max(1, Math.min(bmp.height - y, Math.round(rect.h * dpr)));
  const canvas = createCanvas(w, h);
  canvas.getContext("2d").drawImage(bmp, x, y, w, h, 0, 0, w, h);
  return canvas;
}

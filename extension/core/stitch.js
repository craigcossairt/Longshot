// scale < 1 draws tiles straight into a smaller canvas so the full-size one is
// never allocated (it can exceed Chrome's canvas limits on tall pages).
export async function stitch(shots, { fullW, fullH, dpr, scale = 1 }, { decode, createCanvas }) {
  const k = dpr * scale;
  const canvas = createCanvas(Math.max(1, Math.round(fullW * k)), Math.max(1, Math.round(fullH * k)));
  const ctx = canvas.getContext("2d");
  if (scale !== 1) {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
  }
  for (const shot of shots) {
    const bmp = await decode(shot.dataUrl);
    if (scale === 1) {
      ctx.drawImage(bmp, Math.round(shot.x * dpr), Math.round(shot.y * dpr));
      continue;
    }
    const x0 = Math.round(shot.x * k);
    const y0 = Math.round(shot.y * k);
    const x1 = Math.round((shot.x * dpr + bmp.width) * scale);
    const y1 = Math.round((shot.y * dpr + bmp.height) * scale);
    ctx.drawImage(bmp, x0, y0, Math.max(1, x1 - x0), Math.max(1, y1 - y0));
  }
  return canvas;
}

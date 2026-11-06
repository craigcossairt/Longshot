// Scale while painting so tall captures never allocate an oversized source canvas.
export async function stitch(shots, { fullW, fullH, dpr, scale = 1 }, { decode, createCanvas }) {
  const k = dpr * scale;
  const canvas = createCanvas(Math.max(1, Math.round(fullW * k)), Math.max(1, Math.round(fullH * k)));
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  // First tiles own overlapping page content, including the original header.
  for (let i = shots.length - 1; i >= 0; i--) {
    const shot = shots[i];
    const bmp = await decode(shot.dataUrl);
    const x0 = Math.round(shot.x * k);
    const y0 = Math.round(shot.y * k);
    const x1 = Math.round((shot.x * dpr + bmp.width) * scale);
    const y1 = Math.round((shot.y * dpr + bmp.height) * scale);
    if (scale === 1) ctx.drawImage(bmp, x0, y0);
    else ctx.drawImage(bmp, x0, y0, Math.max(1, x1 - x0), Math.max(1, y1 - y0));
    bmp.close?.();
  }
  // The final tile owns its footer, even when the page exceeds one viewport by 1px.
  for (const shot of shots) {
    if (!shot.bottomRects?.length) continue;
    const bmp = await decode(shot.dataUrl);
    for (const rect of shot.bottomRects) {
      const sx = Math.max(0, Math.round(rect.x * dpr));
      const sy = Math.max(0, Math.round(rect.y * dpr));
      const right = Math.min(bmp.width, Math.round((rect.x + rect.w) * dpr));
      const bottom = Math.min(bmp.height, Math.round((rect.y + rect.h) * dpr));
      if (right <= sx || bottom <= sy) continue;
      const dx = Math.round((shot.x * dpr + sx) * scale);
      const dy = Math.round((shot.y * dpr + sy) * scale);
      const dw = Math.round((shot.x * dpr + right) * scale) - dx;
      const dh = Math.round((shot.y * dpr + bottom) * scale) - dy;
      if (dw > 0 && dh > 0) ctx.drawImage(bmp, sx, sy, right - sx, bottom - sy, dx, dy, dw, dh);
    }
    bmp.close?.();
  }
  return canvas;
}

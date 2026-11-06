export async function stitch(shots, { fullW, fullH, dpr }, { decode, createCanvas }) {
  const canvas = createCanvas(Math.max(1, Math.round(fullW * dpr)), Math.max(1, Math.round(fullH * dpr)));
  const ctx = canvas.getContext("2d");
  // Earlier tiles still show fixed chrome. Later tiles overlap them, so paint
  // those first and let the earlier tile win the overlap.
  for (let i = shots.length - 1; i >= 0; i--) {
    const shot = shots[i];
    const bmp = await decode(shot.dataUrl);
    ctx.drawImage(bmp, Math.round(shot.x * dpr), Math.round(shot.y * dpr));
  }
  return canvas;
}

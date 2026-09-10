export async function stitch(shots, { fullW, fullH, dpr }, { decode, createCanvas }) {
  const canvas = createCanvas(Math.max(1, Math.round(fullW * dpr)), Math.max(1, Math.round(fullH * dpr)));
  const ctx = canvas.getContext("2d");
  for (const shot of shots) {
    const bmp = await decode(shot.dataUrl);
    ctx.drawImage(bmp, Math.round(shot.x * dpr), Math.round(shot.y * dpr));
  }
  return canvas;
}

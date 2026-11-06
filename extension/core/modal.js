/**
 * Paint a stitched dialog column back onto the viewport shot.
 * The column keeps its on-screen x, and extra scrolled height pushes the
 * page below the dialog down instead of leaving a transparent gap.
 */
export function compositeModal(base, column, crop, dpr, createCanvas) {
  const scale = dpr || 1;
  const extra = Math.max(0, column.height - Math.round(crop.h * scale));
  const canvas = createCanvas(base.width, base.height + extra);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(base, 0, 0);
  if (extra > 0) {
    const cut = Math.min(base.height, Math.max(0, Math.round((crop.y + crop.h) * scale)));
    const sample = backdropSample(ctx, base, crop, scale);
    ctx.fillStyle = `rgba(${sample[0]}, ${sample[1]}, ${sample[2]}, ${sample[3] / 255})`;
    ctx.fillRect(0, cut, canvas.width, extra);
    const below = base.height - cut;
    if (below > 0) {
      ctx.drawImage(base, 0, cut, base.width, below, 0, cut + extra, base.width, below);
    }
  }
  ctx.drawImage(column, Math.round(crop.x * scale), Math.round(crop.y * scale));
  return canvas;
}

function backdropSample(ctx, base, crop, scale) {
  const y = Math.max(0, Math.min(base.height - 1, Math.round(crop.y * scale) + 2));
  const left = Math.round(crop.x * scale) - 2;
  const right = Math.round((crop.x + crop.w) * scale) + 2;
  let x = 0;
  if (left >= 0) x = left;
  else if (right < base.width) x = right;
  const pixel = ctx.getImageData(x, y, 1, 1).data;
  return [pixel[0], pixel[1], pixel[2], pixel[3]];
}

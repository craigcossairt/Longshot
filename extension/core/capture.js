import { positions } from "./measure.js";

export const CAPTURE_DELAYS = {
  pre: 120,
  afterScroll: 180,
  afterHide: 80,
};

export async function runTiledCapture({
  mode,
  dim,
  scroll,
  hideChrome,
  reset,
  captureTile,
  delay,
  delays = CAPTURE_DELAYS,
  onProgress,
}) {
  const orig = { x: dim.scrollX, y: dim.scrollY };
  const fullW = mode === "visible" ? dim.viewportWidth : dim.scrollWidth;
  const fullH = mode === "visible" ? dim.viewportHeight : dim.scrollHeight;
  const xs = mode === "visible" ? [dim.scrollX] : positions(fullW, dim.viewportWidth);
  const ys = mode === "visible" ? [dim.scrollY] : positions(fullH, dim.viewportHeight);
  const shots = [];
  try {
    await delay(delays.pre);
    const total = xs.length * ys.length;
    let index = 0;
    for (const y of ys) {
      for (const x of xs) {
        index += 1;
        onProgress?.({
          index,
          total,
          phase: "capture",
          text: total > 1 ? `Capturing ${index} of ${total}` : "Capturing",
        });
        if (mode === "full") {
          const pos = await scroll(x, y);
          await delay(delays.afterScroll);
          const lastTile = x === xs[xs.length - 1] && y === ys[ys.length - 1];
          // A sticky footer is in the first viewport too. Leaving it there stamps
          // it over the content it covered, and the last tile still has the real one.
          let preserved;
          if (!(index === 1 && lastTile)) {
            preserved = await hideChrome({ top: index > 1, bottom: !lastTile });
            await delay(delays.afterHide);
          }
          const ax = Math.round(pos?.x ?? x);
          const ay = Math.round(pos?.y ?? y);
          // The final frame reveals footer chrome hidden in earlier frames, even
          // if scrolling clamped to a position we already captured.
          if (!lastTile && shots.some((shot) => shot.x === ax && shot.y === ay)) continue;
          const dataUrl = await captureTile();
          shots.push({ x: ax, y: ay, dataUrl, ...(preserved?.bottomRects?.length ? { bottomRects: preserved.bottomRects } : {}) });
        } else {
          const dataUrl = await captureTile();
          shots.push({ x: 0, y: 0, dataUrl });
        }
      }
    }
  } finally {
    try {
      await reset(orig);
    } catch {
      /* tab closed */
    }
  }
  if (!shots.length) throw new Error("Capture produced no frames");
  // scrollWidth can be larger than any position the page will actually scroll
  // to (a modal lock, or a 100vw child). Size the canvas to the tiles we have.
  let coveredW = 0;
  let coveredH = 0;
  for (const shot of shots) {
    coveredW = Math.max(coveredW, shot.x + dim.viewportWidth);
    coveredH = Math.max(coveredH, shot.y + dim.viewportHeight);
  }
  return {
    shots,
    dim,
    fullW: Math.min(fullW, Math.max(coveredW, dim.viewportWidth)),
    fullH: Math.min(fullH, Math.max(coveredH, dim.viewportHeight)),
    tiles: shots.length,
  };
}

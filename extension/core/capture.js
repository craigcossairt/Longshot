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
          if (index > 1) {
            await hideChrome();
            await delay(delays.afterHide);
          }
          const ax = Math.round(pos?.x ?? x);
          const ay = Math.round(pos?.y ?? y);
          if (shots.some((shot) => shot.x === ax && shot.y === ay)) continue;
          const dataUrl = await captureTile();
          shots.push({ x: ax, y: ay, dataUrl });
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
  return { shots, dim, fullW, fullH, tiles: shots.length };
}

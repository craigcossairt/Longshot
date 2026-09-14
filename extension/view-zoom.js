export const ZOOM_MIN = 0.15;
export const ZOOM_MAX = 2;
export const ZOOM_STEP = 0.1;

export function clampZoom(value) {
  if (!Number.isFinite(value)) return 1;
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, value));
}

export function stepZoom(value, delta) {
  return clampZoom(Math.round((value + delta) * 10) / 10);
}

export function fitWidthZoom(imageWidth, stageWidth, padding = 64) {
  if (!imageWidth) return 1;
  const available = Math.max(120, stageWidth - padding);
  return clampZoom(Math.min(1, available / imageWidth));
}

export function zoomPercent(value) {
  return Math.round(clampZoom(value) * 100);
}

export function scrollAfterZoom({
  imgX,
  imgY,
  nextZoom,
  wrapOffsetLeft,
  wrapOffsetTop,
  originXInStage,
  originYInStage,
}) {
  return {
    scrollLeft: wrapOffsetLeft + imgX * nextZoom - originXInStage,
    scrollTop: wrapOffsetTop + imgY * nextZoom - originYInStage,
  };
}

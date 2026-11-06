export const HIDE_POLICY = {
  minHeight: 24,
  maxHeight: 180,
  widthRatio: 0.55,
  topMin: -8,
  topMax: 96,
  minZIndex: 1,
  sidebarHeightRatio: 0.7,
  sidebarWidthRatio: 0.45,
  overlayAreaRatio: 0.6,
  edgePx: 8,
  // Sticky footers inside a dialog sit a few pixels above the scrollport edge.
  bottomSlack: 24,
};

/**
 * fixed/sticky roles that must not be treated as a repeating header.
 * sidebar: full-height side nav. It has to stay in every tile or the
 *   overlap of the last tile erases it.
 * overlay: a modal backdrop covering the viewport. Hiding it reveals the
 *   page underneath and the stitch composites the two states together.
 */
function rectBox(rect) {
  const left = rect.left || 0;
  const top = rect.top || 0;
  const width = rect.width || 0;
  const height = rect.height || 0;
  return {
    left,
    top,
    width,
    height,
    right: rect.right == null ? left + width : rect.right,
    bottom: rect.bottom == null ? top + height : rect.bottom,
  };
}

function anchorBox(anchor) {
  if (!anchor) return null;
  const left = anchor.left ?? anchor.x ?? 0;
  const top = anchor.top ?? anchor.y ?? 0;
  const width = anchor.width ?? anchor.w ?? 0;
  const height = anchor.height ?? anchor.h ?? 0;
  if (width < 8 || height < 8) return null;
  return {
    left,
    top,
    width,
    height,
    right: anchor.right == null ? left + width : anchor.right,
    bottom: anchor.bottom == null ? top + height : anchor.bottom,
  };
}

function wideShort(box, frame, policy) {
  return box.width > frame.width * policy.widthRatio && box.height > policy.minHeight && box.height < policy.maxHeight;
}

function onTop(box, frame, policy) {
  return box.top >= frame.top + policy.topMin && box.top < frame.top + policy.topMax;
}

function onBottom(box, frame, policy) {
  const slack = policy.bottomSlack ?? policy.edgePx;
  return box.top > frame.top + frame.height * 0.5 && box.bottom >= frame.bottom - slack;
}

export function chromeKind(desc, policy = HIDE_POLICY) {
  const pos = desc.position;
  const box = rectBox(desc.rect || {});
  const vw = desc.viewportWidth || 1;
  const vh = desc.viewportHeight || vw;
  const frames = [{ left: 0, top: 0, width: vw, height: vh, right: vw, bottom: vh }];
  const anchor = anchorBox(desc.anchor);
  if (anchor) frames.push(anchor);
  if (pos === "fixed" || pos === "sticky") {
    const side =
      box.height >= vh * policy.sidebarHeightRatio &&
      box.width > 0 &&
      box.width <= vw * policy.sidebarWidthRatio &&
      (box.left <= policy.edgePx || box.right >= vw - policy.edgePx);
    if (side) return "sidebar";
    const covers =
      pos === "fixed" &&
      box.width >= vw * 0.7 &&
      box.height >= vh * 0.7 &&
      box.width * box.height >= vw * vh * policy.overlayAreaRatio;
    if (covers) return "overlay";
    if (frames.some((frame) => wideShort(box, frame, policy) && onBottom(box, frame, policy))) return "bottombar";
    if (frames.some((frame) => wideShort(box, frame, policy) && onTop(box, frame, policy))) return "topbar";
    return "fixed";
  }
  if (pos !== "absolute") return null;
  const z = Number(desc.zIndex);
  const raised = Number.isFinite(z) && z > policy.minZIndex;
  if (frames.some((frame) => wideShort(box, frame, policy) && onBottom(box, frame, policy))) return "bottombar";
  if (raised && frames.some((frame) => wideShort(box, frame, policy) && onTop(box, frame, policy))) return "absolute-top";
  return null;
}

export function shouldHide(desc, policy = HIDE_POLICY, opts = {}) {
  if (desc.isRoot || desc.id === "longshot-capture-style") return false;
  const hideTop = opts.top !== false;
  const hideBottom = opts.bottom !== false;
  const kind = chromeKind(desc, policy);
  if (kind === "sidebar" || kind === "overlay" || !kind) return false;
  if (kind === "bottombar") return hideBottom;
  // A modal shell is position:fixed and must stay up. Only its pinned bars repeat.
  if (opts.barsOnly && kind === "fixed") return false;
  return hideTop;
}

/**
 * Serializable page installer. Must not close over module bindings — Chrome
 * executeScript and Playwright page.evaluate drop closures.
 */
export function installHideSession(policy) {
  const p = policy || {
    minHeight: 24,
    maxHeight: 180,
    widthRatio: 0.55,
    topMin: -8,
    topMax: 96,
    minZIndex: 1,
    sidebarHeightRatio: 0.7,
    sidebarWidthRatio: 0.45,
    overlayAreaRatio: 0.6,
    edgePx: 8,
    bottomSlack: 24,
  };
  if (globalThis.__longshotHide) return;
  const restores = [];
  const hiddenEls = new WeakSet();

  function hideElement(el) {
    if (hiddenEls.has(el)) return;
    hiddenEls.add(el);
    const prev = el.style.getPropertyValue("visibility");
    const pri = el.style.getPropertyPriority("visibility");
    el.style.setProperty("visibility", "hidden", "important");
    restores.push(() => {
      hiddenEls.delete(el);
      if (prev) el.style.setProperty("visibility", prev, pri);
      else el.style.removeProperty("visibility");
    });
  }

  function frameOf(anchor, vw, vh) {
    const frames = [{ left: 0, top: 0, width: vw, height: vh, right: vw, bottom: vh }];
    if (!anchor) return frames;
    const left = anchor.left ?? anchor.x ?? 0;
    const top = anchor.top ?? anchor.y ?? 0;
    const width = anchor.width ?? anchor.w ?? 0;
    const height = anchor.height ?? anchor.h ?? 0;
    if (width < 8 || height < 8) return frames;
    frames.push({
      left,
      top,
      width,
      height,
      right: anchor.right == null ? left + width : anchor.right,
      bottom: anchor.bottom == null ? top + height : anchor.bottom,
    });
    return frames;
  }

  function matches(box, frames, where) {
    const slack = p.bottomSlack == null ? p.edgePx : p.bottomSlack;
    for (let i = 0; i < frames.length; i++) {
      const frame = frames[i];
      const wide = box.width > frame.width * p.widthRatio && box.height > p.minHeight && box.height < p.maxHeight;
      if (!wide) continue;
      if (where === "bottom" && box.top > frame.top + frame.height * 0.5 && box.bottom >= frame.bottom - slack) return true;
      if (where === "top" && box.top >= frame.top + p.topMin && box.top < frame.top + p.topMax) return true;
    }
    return false;
  }

  function hideable(el, style, vw, vh, opts) {
    const pos = style.position;
    const rect = el.getBoundingClientRect();
    const left = rect.left || 0;
    const top = rect.top || 0;
    const width = rect.width || 0;
    const height = rect.height || 0;
    const box = {
      left,
      top,
      width,
      height,
      right: rect.right == null ? left + width : rect.right,
      bottom: rect.bottom == null ? top + height : rect.bottom,
    };
    const hideTop = !opts || opts.top !== false;
    const hideBottom = !opts || opts.bottom !== false;
    const barsOnly = Boolean(opts && opts.barsOnly);
    const frames = frameOf(opts && opts.anchor, vw, vh);
    if (pos === "fixed" || pos === "sticky") {
      const side =
        height >= vh * p.sidebarHeightRatio &&
        width > 0 &&
        width <= vw * p.sidebarWidthRatio &&
        (left <= p.edgePx || box.right >= vw - p.edgePx);
      if (side) return false;
      const covers =
        pos === "fixed" &&
        width >= vw * 0.7 &&
        height >= vh * 0.7 &&
        width * height >= vw * vh * p.overlayAreaRatio;
      if (covers) return false;
      if (matches(box, frames, "bottom")) return hideBottom;
      if (matches(box, frames, "top")) return hideTop;
      if (barsOnly) return false;
      return hideTop;
    }
    if (pos !== "absolute") return false;
    if (matches(box, frames, "bottom")) return hideBottom;
    if (!hideTop) return false;
    const z = Number(style.zIndex);
    return Boolean(matches(box, frames, "top") && Number.isFinite(z) && z > p.minZIndex);
  }

  function hideFloating(root, opts) {
    const view = root.defaultView || globalThis;
    const vw = view.innerWidth || globalThis.innerWidth;
    const vh = view.innerHeight || globalThis.innerHeight || vw;
    let nodes;
    try {
      nodes = root.querySelectorAll("*");
    } catch {
      return;
    }
    const doc = root.documentElement ? root : root;
    const html = doc.documentElement || globalThis.document?.documentElement;
    const body = doc.body || globalThis.document?.body;
    nodes.forEach((el) => {
      if (el === html || el === body) return;
      if (el.id === "longshot-capture-style") return;
      let style;
      try {
        style = view.getComputedStyle(el);
      } catch {
        return;
      }
      if (hideable(el, style, vw, vh, opts)) hideElement(el);
    });
    root.querySelectorAll("iframe, frame").forEach((frame) => {
      try {
        if (frame.contentDocument) {
          const nested = { top: opts && opts.top, bottom: opts && opts.bottom, barsOnly: opts && opts.barsOnly };
          hideFloating(frame.contentDocument, nested);
        }
      } catch {
        /* cross-origin */
      }
    });
  }

  globalThis.__longshotHide = {
    hide(opts) {
      while (restores.length) restores.pop()();
      hideFloating(globalThis.document, opts);
    },
    reset() {
      while (restores.length) restores.pop()();
    },
  };
}

export const HIDE_POLICY = {
  minHeight: 24,
  maxHeight: 180,
  widthRatio: 0.55,
  topMin: -8,
  topMax: 96,
  minZIndex: 1,
};

export function shouldHide(desc, policy = HIDE_POLICY) {
  if (desc.isRoot || desc.id === "longshot-capture-style") return false;
  const pos = desc.position;
  if (pos === "fixed" || pos === "sticky") return true;
  if (pos !== "absolute") return false;
  const rect = desc.rect || {};
  const z = Number(desc.zIndex);
  const vw = desc.viewportWidth;
  const topBar =
    rect.height > policy.minHeight &&
    rect.height < policy.maxHeight &&
    rect.width > vw * policy.widthRatio &&
    rect.top >= policy.topMin &&
    rect.top < policy.topMax;
  return Boolean(topBar && Number.isFinite(z) && z > policy.minZIndex);
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

  function hideable(el, style, vw) {
    const pos = style.position;
    if (pos === "fixed" || pos === "sticky") return true;
    if (pos !== "absolute") return false;
    const rect = el.getBoundingClientRect();
    const z = Number(style.zIndex);
    const topBar =
      rect.height > p.minHeight &&
      rect.height < p.maxHeight &&
      rect.width > vw * p.widthRatio &&
      rect.top >= p.topMin &&
      rect.top < p.topMax;
    return Boolean(topBar && Number.isFinite(z) && z > p.minZIndex);
  }

  function hideFloating(root) {
    const view = root.defaultView || globalThis;
    const vw = view.innerWidth || globalThis.innerWidth;
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
      if (hideable(el, style, vw)) hideElement(el);
    });
    root.querySelectorAll("iframe, frame").forEach((frame) => {
      try {
        if (frame.contentDocument) hideFloating(frame.contentDocument);
      } catch {
        /* cross-origin */
      }
    });
  }

  globalThis.__longshotHide = {
    hide() {
      hideFloating(globalThis.document);
    },
    reset() {
      while (restores.length) restores.pop()();
    },
  };
}

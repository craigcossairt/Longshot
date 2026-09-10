export const OVERFLOW_POLICY = {
  minExtra: 50,
  minViewportAreaRatio: 0.25,
};

export function overflowScore(candidate, viewport, policy = OVERFLOW_POLICY) {
  const vis = candidate.clientWidth * candidate.clientHeight;
  if (vis < viewport.width * viewport.height * policy.minViewportAreaRatio) return 0;
  const extraH = Math.max(0, candidate.scrollHeight - candidate.clientHeight);
  const extraW = Math.max(0, candidate.scrollWidth - candidate.clientWidth);
  if (extraH < policy.minExtra && extraW < policy.minExtra) return 0;
  return extraH * candidate.clientWidth + extraW * candidate.clientHeight;
}

export function pageScrollScore(page, viewport) {
  return (
    Math.max(0, page.scrollHeight - viewport.height) * viewport.width +
    Math.max(0, page.scrollWidth - viewport.width) * viewport.height
  );
}

export function pickOverflowScroller({ page, candidates, viewport }, policy = OVERFLOW_POLICY) {
  let best = null;
  let bestScore = pageScrollScore(page, viewport);
  for (const candidate of candidates) {
    const score = overflowScore(candidate, viewport, policy);
    if (score > bestScore) {
      best = candidate;
      bestScore = score;
    }
  }
  return best;
}

/**
 * Serializable page installer. Must not close over module bindings.
 * Finds the largest overflow pane that out-scrolls the document.
 */
export function bindOverflowCapture(policy) {
  const p = policy || { minExtra: 50, minViewportAreaRatio: 0.25 };
  let el = null;
  let orig = null;
  let windowOrig = null;

  function cropRect(target) {
    const r = target.getBoundingClientRect();
    const x = Math.max(0, r.left + target.clientLeft);
    const y = Math.max(0, r.top + target.clientTop);
    const right = Math.min(globalThis.innerWidth, r.left + target.clientLeft + target.clientWidth);
    const bottom = Math.min(globalThis.innerHeight, r.top + target.clientTop + target.clientHeight);
    return {
      x: Math.round(x),
      y: Math.round(y),
      w: Math.max(1, Math.round(right - x)),
      h: Math.max(1, Math.round(bottom - y)),
    };
  }

  function scoreOf(c, vw, vh) {
    const vis = c.clientWidth * c.clientHeight;
    if (vis < vw * vh * p.minViewportAreaRatio) return 0;
    const extraH = Math.max(0, c.scrollHeight - c.clientHeight);
    const extraW = Math.max(0, c.scrollWidth - c.clientWidth);
    if (extraH < p.minExtra && extraW < p.minExtra) return 0;
    return extraH * c.clientWidth + extraW * c.clientHeight;
  }

  function find() {
    el = null;
    orig = null;
    const doc = globalThis.document;
    const vw = globalThis.innerWidth;
    const vh = globalThis.innerHeight;
    windowOrig = { x: globalThis.scrollX, y: globalThis.scrollY };
    const html = doc.documentElement;
    const body = doc.body;
    const pageScore =
      Math.max(0, Math.max(html.scrollHeight, body?.scrollHeight || 0) - vh) * vw +
      Math.max(0, Math.max(html.scrollWidth, body?.scrollWidth || 0) - vw) * vh;
    let best = null;
    let bestScore = pageScore;
    let nodes;
    try {
      nodes = doc.querySelectorAll("*");
    } catch {
      return null;
    }
    nodes.forEach((node) => {
      if (node === html || node === body) return;
      if (node.id === "longshot-capture-style") return;
      let style;
      try {
        style = globalThis.getComputedStyle(node);
      } catch {
        return;
      }
      const oy = style.overflowY;
      const ox = style.overflowX;
      if (!/(auto|scroll|overlay)/.test(oy) && !/(auto|scroll|overlay)/.test(ox)) return;
      if (node.clientWidth < 8 || node.clientHeight < 8) return;
      const score = scoreOf(
        {
          scrollWidth: node.scrollWidth,
          scrollHeight: node.scrollHeight,
          clientWidth: node.clientWidth,
          clientHeight: node.clientHeight,
        },
        vw,
        vh,
      );
      if (score > bestScore) {
        best = node;
        bestScore = score;
      }
    });
    if (!best) return null;
    el = best;
    orig = { x: el.scrollLeft, y: el.scrollTop };
    try {
      el.scrollIntoView({ block: "nearest", inline: "nearest" });
    } catch {
      /* ignore */
    }
    el.scrollLeft = 0;
    el.scrollTop = 0;
    return {
      scrollLeft: el.scrollLeft,
      scrollTop: el.scrollTop,
      scrollWidth: el.scrollWidth,
      scrollHeight: el.scrollHeight,
      clientWidth: el.clientWidth,
      clientHeight: el.clientHeight,
      crop: cropRect(el),
    };
  }

  function waitFrames(count) {
    return new Promise((resolve) => {
      const step = () => {
        if (count <= 0) resolve();
        else {
          count -= 1;
          globalThis.requestAnimationFrame(step);
        }
      };
      globalThis.requestAnimationFrame(step);
    });
  }

  async function scroll(x, y) {
    if (!el) return { x, y };
    const maxX = Math.max(0, el.scrollWidth - el.clientWidth);
    const maxY = Math.max(0, el.scrollHeight - el.clientHeight);
    const tx = Math.min(Math.max(0, x), maxX);
    const ty = Math.min(Math.max(0, y), maxY);
    for (let i = 0; i < 6; i++) {
      el.scrollLeft = tx;
      el.scrollTop = ty;
      await waitFrames(2);
      if (Math.abs(el.scrollLeft - tx) < 1 && Math.abs(el.scrollTop - ty) < 1) break;
    }
    return { x: el.scrollLeft, y: el.scrollTop, crop: cropRect(el) };
  }

  function reset() {
    if (el && orig) {
      el.scrollLeft = orig.x;
      el.scrollTop = orig.y;
    }
    if (windowOrig) {
      try {
        globalThis.scrollTo({ left: windowOrig.x, top: windowOrig.y, behavior: "instant" });
      } catch {
        globalThis.scrollTo(windowOrig.x, windowOrig.y);
      }
    }
    el = null;
    orig = null;
    windowOrig = null;
  }

  function active() {
    return Boolean(el);
  }

  globalThis.__longshotOverflow = { find, scroll, reset, active };
}

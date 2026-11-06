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
  let scrollGeneration = 0;

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

  function visible(node) {
    for (let current = node; current; current = current.parentElement) {
      const style = globalThis.getComputedStyle(current);
      if (style.display === "none" || style.visibility === "hidden" || style.visibility === "collapse" || Number(style.opacity) === 0) return false;
    }
    return true;
  }

  function findOverlay(doc, vw, vh) {
    let nodes;
    try {
      nodes = doc.querySelectorAll("*");
    } catch {
      return null;
    }
    let best = null;
    const minArea = vw * vh * 0.6;
    nodes.forEach((node) => {
      if (node.id === "longshot-capture-style") return;
      let style;
      try {
        style = globalThis.getComputedStyle(node);
      } catch {
        return;
      }
      const semantic = node.matches?.('dialog[open], [role="dialog"], [role="alertdialog"], [aria-modal="true"]');
      if (!semantic && style.position !== "fixed") return;
      if (style.display === "none" || style.visibility === "hidden" || style.visibility === "collapse" || Number(style.opacity) === 0 || Number(style.zIndex) < 0) return;
      for (let ancestor = node.parentElement; ancestor; ancestor = ancestor.parentElement) {
        const parentStyle = globalThis.getComputedStyle(ancestor);
        if (parentStyle.display === "none" || parentStyle.visibility === "hidden" || Number(parentStyle.opacity) === 0) return;
      }
      const rect = node.getBoundingClientRect();
      if (rect.width < 8 || rect.height < 8 || rect.right <= 0 || rect.bottom <= 0 || rect.left >= vw || rect.top >= vh) return;
      if (!semantic && (rect.width < vw * 0.7 || rect.height < vh * 0.7 || rect.width * rect.height < minArea)) return;
      const hit = doc.elementFromPoint(Math.max(0, Math.min(vw - 1, rect.left + rect.width / 2)), Math.max(0, Math.min(vh - 1, rect.top + rect.height / 2)));
      if (!hit || (hit !== node && !node.contains(hit))) return;
      // Geometry alone also matches wallpapers and fixed app shells. A foreground
      // dialog or a real inner scroller is required before overriding page capture.
      const dialog = semantic || node.querySelector?.('dialog[open], [role="dialog"], [role="alertdialog"], [aria-modal="true"]');
      if (!dialog && !findScrollerWithin(node)) return;
      best = node;
    });
    return best;
  }

  function findScrollerWithin(root) {
    const nodes = [root];
    try {
      root.querySelectorAll("*").forEach((node) => nodes.push(node));
    } catch {
      /* ignore */
    }
    let best = null;
    let bestScore = 0;
    for (const node of nodes) {
      if (node.id === "longshot-capture-style") continue;
      let style;
      try {
        style = globalThis.getComputedStyle(node);
      } catch {
        continue;
      }
      if (style.visibility === "hidden" || style.visibility === "collapse" || Number(style.opacity) === 0) continue;
      const oy = style.overflowY;
      const ox = style.overflowX;
      if (!/(auto|scroll|overlay)/.test(oy) && !/(auto|scroll|overlay)/.test(ox)) continue;
      if (node.clientWidth < 8 || node.clientHeight < 8 || !visible(node)) continue;
      const extraH = Math.max(0, node.scrollHeight - node.clientHeight);
      const extraW = Math.max(0, node.scrollWidth - node.clientWidth);
      if (extraH < 24 && extraW < 24) continue;
      const score = extraH * node.clientWidth + extraW * node.clientHeight;
      if (score > bestScore) {
        best = node;
        bestScore = score;
      }
    }
    return best;
  }

  function find() {
    scrollGeneration += 1;
    el = null;
    orig = null;
    const doc = globalThis.document;
    const vw = globalThis.innerWidth;
    const vh = globalThis.innerHeight;
    windowOrig = { x: globalThis.scrollX, y: globalThis.scrollY };
    const html = doc.documentElement;
    const body = doc.body;
    const overlay = findOverlay(doc, vw, vh);
    if (overlay) {
      const target = findScrollerWithin(overlay);
      if (!target) return { kind: "modal", fits: true };
      el = target;
      orig = { x: el.scrollLeft, y: el.scrollTop };
      el.scrollLeft = 0;
      el.scrollTop = 0;
      const fits = el.scrollHeight <= el.clientHeight + 8;
      return {
        kind: "modal",
        fits,
        scrollLeft: el.scrollLeft,
        scrollTop: el.scrollTop,
        scrollWidth: el.clientWidth,
        scrollHeight: Math.max(el.scrollHeight, el.clientHeight),
        clientWidth: el.clientWidth,
        clientHeight: el.clientHeight,
        crop: cropRect(el),
      };
    }
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
      if (node.clientWidth < 8 || node.clientHeight < 8 || !visible(node)) return;
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
    const generation = scrollGeneration;
    if (!el) return { x, y };
    const maxX = Math.max(0, el.scrollWidth - el.clientWidth);
    const maxY = Math.max(0, el.scrollHeight - el.clientHeight);
    const tx = Math.min(Math.max(0, x), maxX);
    const ty = Math.min(Math.max(0, y), maxY);
    for (let i = 0; i < 6; i++) {
      el.scrollLeft = tx;
      el.scrollTop = ty;
      await waitFrames(2);
      if (generation !== scrollGeneration || !el) return { x: 0, y: 0 };
      if (Math.abs(el.scrollLeft - tx) < 1 && Math.abs(el.scrollTop - ty) < 1) break;
    }
    return { x: el.scrollLeft, y: el.scrollTop, crop: cropRect(el) };
  }

  function reset() {
    scrollGeneration += 1;
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

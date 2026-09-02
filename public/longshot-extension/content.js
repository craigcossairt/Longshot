(() => {
  const restores = [];
  const hiddenEls = new WeakSet();

  function pushRestore(fn) {
    restores.push(fn);
  }

  function expandFrames() {
    document.querySelectorAll("iframe, frame").forEach((frame) => {
      try {
        const doc = frame.contentDocument;
        if (!doc?.documentElement) return;
        const prev = {
          height: frame.style.height,
          overflow: frame.style.overflow,
        };
        const next = Math.max(doc.documentElement.scrollHeight, doc.body?.scrollHeight || 0);
        frame.style.height = `${next}px`;
        frame.style.overflow = "hidden";
        pushRestore(() => {
          frame.style.height = prev.height;
          frame.style.overflow = prev.overflow;
        });
      } catch {
        /* cross-origin */
      }
    });
  }

  function injectCaptureCss() {
    if (document.getElementById("longshot-capture-style")) return;
    const style = document.createElement("style");
    style.id = "longshot-capture-style";
    style.textContent = `
      html { scroll-behavior: auto !important; scrollbar-width: none !important; overflow-anchor: none !important; }
      body { scroll-behavior: auto !important; overflow-anchor: none !important; }
      * { scroll-behavior: auto !important; }
      html::-webkit-scrollbar, body::-webkit-scrollbar, *::-webkit-scrollbar {
        width: 0 !important;
        height: 0 !important;
        display: none !important;
      }
    `;
    document.documentElement.appendChild(style);
    pushRestore(() => style.remove());
  }

  function hideElement(el) {
    if (hiddenEls.has(el)) return;
    hiddenEls.add(el);
    const prev = el.style.getPropertyValue("visibility");
    const pri = el.style.getPropertyPriority("visibility");
    el.style.setProperty("visibility", "hidden", "important");
    pushRestore(() => {
      hiddenEls.delete(el);
      if (prev) el.style.setProperty("visibility", prev, pri);
      else el.style.removeProperty("visibility");
    });
  }

  function hideFloating(root = document) {
    const view = root.defaultView || window;
    const vw = view.innerWidth || window.innerWidth;
    let nodes;
    try {
      nodes = root.querySelectorAll("*");
    } catch {
      return;
    }
    nodes.forEach((el) => {
      if (el === document.documentElement || el === document.body) return;
      if (el.id === "longshot-capture-style") return;
      let style;
      try {
        style = view.getComputedStyle(el);
      } catch {
        return;
      }
      const pos = style.position;
      if (pos === "fixed" || pos === "sticky") {
        hideElement(el);
        return;
      }
      if (pos !== "absolute") return;
      const rect = el.getBoundingClientRect();
      const z = Number(style.zIndex);
      const topBar = rect.height > 24 && rect.height < 180 && rect.width > vw * 0.55 && rect.top >= -8 && rect.top < 96;
      if (topBar && Number.isFinite(z) && z > 1) hideElement(el);
    });
    root.querySelectorAll("iframe, frame").forEach((frame) => {
      try {
        if (frame.contentDocument) hideFloating(frame.contentDocument);
      } catch {
        /* cross-origin */
      }
    });
  }

  function measure() {
    const el = document.documentElement;
    const body = document.body;
    return {
      scrollX: window.scrollX,
      scrollY: window.scrollY,
      scrollWidth: Math.max(el.scrollWidth, body?.scrollWidth || 0),
      scrollHeight: Math.max(el.scrollHeight, body?.scrollHeight || 0),
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio || 1,
      title: document.title || "Page",
      url: location.href,
    };
  }

  function waitFrames(count) {
    return new Promise((resolve) => {
      const step = () => {
        if (count <= 0) resolve();
        else {
          count -= 1;
          requestAnimationFrame(step);
        }
      };
      requestAnimationFrame(step);
    });
  }

  function scrollInstant(x, y) {
    try {
      window.scrollTo({ left: x, top: y, behavior: "instant" });
    } catch {
      window.scrollTo(x, y);
    }
  }

  async function scrollToPos(x, y) {
    const root = document.scrollingElement || document.documentElement;
    const maxX = Math.max(0, root.scrollWidth - window.innerWidth);
    const maxY = Math.max(0, root.scrollHeight - window.innerHeight);
    const tx = Math.min(Math.max(0, x), maxX);
    const ty = Math.min(Math.max(0, y), maxY);
    for (let i = 0; i < 6; i++) {
      scrollInstant(tx, ty);
      await waitFrames(2);
      if (Math.abs(window.scrollX - tx) < 1 && Math.abs(window.scrollY - ty) < 1) break;
    }
    return { x: window.scrollX, y: window.scrollY };
  }

  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.type === "LONGSHOT_PING") {
      sendResponse({ ok: true });
      return;
    }
    if (msg.type === "LONGSHOT_MEASURE") {
      injectCaptureCss();
      if (msg.expandFrames) expandFrames();
      sendResponse(measure());
      return;
    }
    if (msg.type === "LONGSHOT_HIDE_CHROME") {
      hideFloating(document);
      sendResponse({ ok: true });
      return;
    }
    if (msg.type === "LONGSHOT_SCROLL") {
      scrollToPos(msg.x, msg.y).then(sendResponse);
      return true;
    }
    if (msg.type === "LONGSHOT_RESET") {
      scrollInstant(msg.x, msg.y);
      while (restores.length) restores.pop()();
      sendResponse({ ok: true });
    }
  });
})();

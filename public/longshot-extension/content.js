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

  function selectRegion() {
    return new Promise((resolve) => {
      if (document.getElementById("longshot-region-root")) {
        resolve(null);
        return;
      }
      const host = document.createElement("div");
      host.id = "longshot-region-root";
      host.style.cssText = "all:initial;display:block;position:fixed;inset:0;z-index:2147483647;";
      const shadow = host.attachShadow({ mode: "closed" });
      shadow.innerHTML = `
        <style>
          :host, .shade { position: fixed; inset: 0; }
          .shade { cursor: crosshair; background: rgb(14 14 16 / 0.28); }
          .hint {
            position: fixed; top: 16px; left: 50%; transform: translateX(-50%);
            padding: 8px 12px; border-radius: 8px; background: #0e0e10; color: #f1f0ec;
            font: 500 13px/1.3 Outfit, system-ui, sans-serif; pointer-events: none;
            border: 1px solid #2a2a2e; box-shadow: 0 8px 24px rgb(0 0 0 / 0.35);
          }
          .box {
            position: fixed; border: 2px solid #d2d6d0; background: rgb(210 214 208 / 0.12);
            box-shadow: 0 0 0 9999px rgb(14 14 16 / 0.45); pointer-events: none;
          }
        </style>
        <div class="shade">
          <div class="hint">Drag to select an area. Esc cancels.</div>
          <div class="box" hidden></div>
        </div>
      `;
      const shade = shadow.querySelector(".shade");
      const box = shadow.querySelector(".box");
      let start = null;
      let done = false;

      function cleanup(result) {
        if (done) return;
        done = true;
        window.removeEventListener("keydown", onKey, true);
        host.remove();
        resolve(result);
      }

      function onKey(e) {
        if (e.key === "Escape") {
          e.preventDefault();
          cleanup(null);
        }
      }

      function rectFrom(a, b) {
        const x = Math.min(a.x, b.x);
        const y = Math.min(a.y, b.y);
        return { x, y, w: Math.abs(b.x - a.x), h: Math.abs(b.y - a.y) };
      }

      shade.addEventListener("mousedown", (e) => {
        if (e.button !== 0) return;
        e.preventDefault();
        start = { x: e.clientX, y: e.clientY };
        box.hidden = false;
        box.style.left = `${start.x}px`;
        box.style.top = `${start.y}px`;
        box.style.width = "0px";
        box.style.height = "0px";
      });
      shade.addEventListener("mousemove", (e) => {
        if (!start) return;
        const r = rectFrom(start, { x: e.clientX, y: e.clientY });
        box.style.left = `${r.x}px`;
        box.style.top = `${r.y}px`;
        box.style.width = `${r.w}px`;
        box.style.height = `${r.h}px`;
      });
      shade.addEventListener("mouseup", (e) => {
        if (!start) return;
        const r = rectFrom(start, { x: e.clientX, y: e.clientY });
        start = null;
        if (r.w < 8 || r.h < 8) {
          cleanup(null);
          return;
        }
        cleanup({
          ...r,
          title: document.title || "Page",
          url: location.href,
          devicePixelRatio: window.devicePixelRatio || 1,
        });
      });
      window.addEventListener("keydown", onKey, true);
      document.documentElement.appendChild(host);
    });
  }

  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.type === "LONGSHOT_PING") {
      sendResponse({ ok: true });
      return;
    }
    if (msg.type === "LONGSHOT_SELECT_REGION") {
      selectRegion().then(sendResponse);
      return true;
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

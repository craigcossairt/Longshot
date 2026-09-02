(() => {
  const restores = [];

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
        restores.push(() => {
          frame.style.height = prev.height;
          frame.style.overflow = prev.overflow;
        });
      } catch {
        /* cross-origin */
      }
    });
  }

  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.type === "LONGSHOT_PING") {
      sendResponse({ ok: true });
      return;
    }
    if (msg.type === "LONGSHOT_MEASURE") {
      if (msg.expandFrames) expandFrames();
      const el = document.documentElement;
      sendResponse({
        scrollX: window.scrollX,
        scrollY: window.scrollY,
        scrollWidth: Math.max(el.scrollWidth, document.body?.scrollWidth || 0),
        scrollHeight: Math.max(el.scrollHeight, document.body?.scrollHeight || 0),
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio || 1,
        title: document.title || "Page",
        url: location.href,
      });
      return;
    }
    if (msg.type === "LONGSHOT_SCROLL") {
      window.scrollTo(msg.x, msg.y);
      requestAnimationFrame(() => sendResponse({ x: window.scrollX, y: window.scrollY }));
      return true;
    }
    if (msg.type === "LONGSHOT_RESET") {
      window.scrollTo(msg.x, msg.y);
      while (restores.length) restores.pop()();
      sendResponse({ ok: true });
    }
  });
})();

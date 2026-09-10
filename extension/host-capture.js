import { HIDE_POLICY, OVERFLOW_POLICY, bindOverflowCapture, installHideSession } from "./core/index.js";

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

function dispatch(msg, sendResponse) {
  if (msg.type === "LONGSHOT_PING") {
    sendResponse({ ok: true });
    return;
  }
  if (msg.type === "LONGSHOT_MEASURE") {
    installHideSession(HIDE_POLICY);
    bindOverflowCapture(OVERFLOW_POLICY);
    const dim = measure();
    if (msg.findOverflow && globalThis.__longshotOverflow) {
      const overflow = globalThis.__longshotOverflow.find();
      if (overflow) dim.overflow = overflow;
    }
    sendResponse(dim);
    return;
  }
  if (msg.type === "LONGSHOT_HIDE_CHROME") {
    globalThis.__longshotHide?.hide();
    sendResponse({ ok: true });
    return;
  }
  if (msg.type === "LONGSHOT_SCROLL") {
    if (globalThis.__longshotOverflow?.active()) {
      globalThis.__longshotOverflow.scroll(msg.x, msg.y).then(sendResponse);
      return true;
    }
    scrollToPos(msg.x, msg.y).then(sendResponse);
    return true;
  }
  if (msg.type === "LONGSHOT_RESET") {
    if (globalThis.__longshotOverflow?.active()) globalThis.__longshotOverflow.reset();
    else scrollInstant(msg.x, msg.y);
    globalThis.__longshotHide?.reset();
    sendResponse({ ok: true });
  }
  return false;
}

export function installHostCapture() {
  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.longshotTargetTabId == null) return;
    const run = (tab) => {
      if (!tab || tab.id !== msg.longshotTargetTabId) return;
      const asyncWait = dispatch(msg, sendResponse);
      if (asyncWait !== true) return;
    };
    const current = chrome.tabs.getCurrent();
    if (current && typeof current.then === "function") {
      current.then(run);
      return true;
    }
    chrome.tabs.getCurrent(run);
    return true;
  });
}

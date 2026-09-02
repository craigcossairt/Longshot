chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type !== "LONGSHOT_OFFSCREEN_COPY") return;
  (async () => {
    const res = await fetch(msg.dataUrl);
    const blob = await res.blob();
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    sendResponse({ ok: true });
  })().catch((error) => {
    sendResponse({ ok: false, error: error instanceof Error ? error.message : "Copy failed" });
  });
  return true;
});

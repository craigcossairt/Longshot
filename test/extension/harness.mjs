import { createReadStream, existsSync } from "node:fs";
import { createServer } from "node:http";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const fixtures = join(root, "test/fixtures");
const TYPES = { ".html": "text/html; charset=utf-8", ".png": "image/png" };

// Content scripts cannot run on file:// without a user toggle, so fixtures are served.
export async function serveFixtures() {
  const server = createServer((req, res) => {
    const path = resolve(fixtures, `.${decodeURIComponent(new URL(req.url, "http://x").pathname)}`);
    if (!path.startsWith(fixtures) || !existsSync(path)) {
      res.statusCode = 404;
      res.end();
      return;
    }
    res.setHeader("content-type", TYPES[extname(path)] || "application/octet-stream");
    createReadStream(path).pipe(res);
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  return { url: (name) => `http://127.0.0.1:${server.address().port}/${name}`, close: () => server.close() };
}

// The extension runs only in Chromium (not branded Chrome, which ignores --load-extension).
export async function launchExtension({ dpr = 1 } = {}) {
  const ext = join(root, "extension");
  const context = await chromium.launchPersistentContext("", {
    headless: true,
    channel: "chromium",
    viewport: { width: 800, height: 600 },
    // A real device scale, not Playwright's emulated one: captureVisibleTab ignores
    // emulation and would return 1x tiles.
    args: [`--disable-extensions-except=${ext}`, `--load-extension=${ext}`, `--force-device-scale-factor=${dpr}`],
  });
  let [worker] = context.serviceWorkers();
  if (!worker) worker = await context.waitForEvent("serviceworker");
  for (let i = 0; i < 100; i++) {
    const ready = await worker
      .evaluate(() => typeof chrome !== "undefined" && Boolean(chrome.tabs) && typeof setTimeout === "function")
      .catch(() => false);
    if (ready) break;
    await new Promise((r) => setTimeout(r, 100));
  }
  const extUrl = (path) => `chrome-extension://${new URL(worker.url()).host}/${path}`;
  return { context, worker, extUrl };
}

// Opens popup.html in its own unfocused window, so the capture targets the
// active tab of the main window as it would from the toolbar.
export async function openPopup({ context, worker, extUrl }) {
  const pending = context.waitForEvent("page", (p) => p.url().includes("popup.html"));
  await worker.evaluate((url) => chrome.windows.create({ url, type: "popup", focused: false }), extUrl("popup.html"));
  const popup = await pending;
  await popup.waitForLoadState();
  return popup;
}

export function requestCapture(popup, mode = "full") {
  return popup.evaluate(
    (m) =>
      new Promise((r) =>
        chrome.runtime.sendMessage({ type: "LONGSHOT_CAPTURE", mode: m }, (res) =>
          r(res ?? { ok: false, error: chrome.runtime.lastError?.message }),
        ),
      ),
    mode,
  );
}

export async function setSettings(worker, settings) {
  await worker.evaluate((s) => chrome.storage.sync.set(s), settings);
}

export async function currentCapture(worker) {
  return worker.evaluate(async () => (await chrome.storage.local.get("longshotCurrent")).longshotCurrent || null);
}

// Pixel samples from the middle column of a data URL image, decoded in a page.
export async function samplePixels(page, dataUrl, ys) {
  return page.evaluate(
    async ({ dataUrl, ys }) => {
      const bmp = await createImageBitmap(await (await fetch(dataUrl)).blob());
      const canvas = new OffscreenCanvas(bmp.width, bmp.height);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(bmp, 0, 0);
      return ys.map((y) => [...ctx.getImageData(Math.floor(bmp.width / 2), y < 0 ? bmp.height + y : y, 1, 1).data]);
    },
    { dataUrl, ys },
  );
}

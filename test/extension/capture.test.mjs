import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import {
  currentCapture,
  launchExtension,
  openPopup,
  requestCapture,
  samplePixels,
  serveFixtures,
  setSettings,
} from "./harness.mjs";

let server;
before(async () => {
  server = await serveFixtures();
});
after(() => server?.close());

async function withExtension(options, fn) {
  const ext = await launchExtension(options);
  try {
    return await fn(ext);
  } finally {
    await ext.context.close();
  }
}

describe("extension capture", { timeout: 300000 }, () => {
  it("captures all of a 2x tall page instead of a truncated or blank image", async () => {
    await withExtension({ dpr: 2 }, async (ext) => {
      const page = await ext.context.newPage();
      await page.goto(server.url("tall.html"));
      const popup = await openPopup(ext);
      const res = await requestCapture(popup, "full");
      assert.deepEqual(res, { ok: true });
      const record = await currentCapture(ext.worker);
      assert.ok(record.height <= 32768 && record.height > 30000, `height ${record.height}`);
      const [top, bottom] = await samplePixels(page, record.dataUrl, [2, -3]);
      assert.equal(top[3], 255, "top pixel is opaque");
      assert.equal(bottom[3], 255, "bottom pixel is opaque");
      assert.ok(top[0] > top[2], `top is red: ${top}`);
      // The fixture ends at #3333cc; a truncated capture ends partway through the gradient.
      assert.ok(bottom[2] - bottom[0] > 120, `bottom is the gradient's end: ${bottom}`);
    });
  });

  it("copies to the clipboard when the editor is skipped", async () => {
    await withExtension({}, async (ext) => {
      await setSettings(ext.worker, { skipEditor: true, skipEditorAction: "copy" });
      const page = await ext.context.newPage();
      await page.goto(server.url("sticky.html"));
      const popup = await openPopup(ext);
      const closed = popup.waitForEvent("close");
      await popup.click("#visible");
      await closed;
      await ext.context.grantPermissions(["clipboard-read"], { origin: new URL(page.url()).origin });
      const types = await page.evaluate(async () => (await navigator.clipboard.read()).flatMap((item) => item.types));
      assert.deepEqual(types, ["image/png"]);
      assert.ok(!ext.context.pages().some((p) => p.url().includes("editor.html")), "editor stays closed");
    });
  });

  it("copies from the popup when the captured page cannot take the clipboard write", async () => {
    await withExtension({}, async (ext) => {
      await setSettings(ext.worker, { skipEditor: true, skipEditorAction: "copy" });
      // Extension pages cannot be scripted, so the popup does the copy.
      const files = await ext.context.newPage();
      await files.goto(ext.extUrl("files.html"));
      const popup = await openPopup(ext);
      const closed = popup.waitForEvent("close");
      await popup.click("#visible");
      await closed;
      const page = await ext.context.newPage();
      await page.goto(server.url("sticky.html"));
      await ext.context.grantPermissions(["clipboard-read"], { origin: new URL(page.url()).origin });
      const types = await page.evaluate(async () => (await navigator.clipboard.read()).flatMap((item) => item.types));
      assert.deepEqual(types, ["image/png"]);
    });
  });

  it("downloads from the editor without messaging the image to the service worker", async () => {
    await withExtension({}, async (ext) => {
      await setSettings(ext.worker, { saveAsDialog: false });
      const page = await ext.context.newPage();
      await page.goto(server.url("sticky.html"));
      const popup = await openPopup(ext);
      const opened = ext.context.waitForEvent("page", (p) => p.url().includes("editor.html"));
      assert.deepEqual(await requestCapture(popup, "visible"), { ok: true });
      const editor = await opened;
      await editor.waitForLoadState();
      await editor.locator("#download").click();
      await editor.locator("#pdf").click();
      let done = [];
      for (let i = 0; i < 50 && done.length < 2; i++) {
        await new Promise((r) => setTimeout(r, 200));
        done = (await ext.worker.evaluate(() => chrome.downloads.search({}))).filter((d) => d.state === "complete");
      }
      assert.equal(done.length, 2);
      for (const d of done) {
        assert.match(d.url, /^blob:chrome-extension:/);
        assert.ok(d.fileSize > 0);
      }
    });
  });

  it("restores the page when a capture fails before tiling starts", async () => {
    await withExtension({}, async (ext) => {
      const page = await ext.context.newPage();
      await page.goto(server.url("overflow.html"));
      // The overflow fixture has an app header, so the first screenshot (the header)
      // is taken before runTiledCapture. Make it fail.
      await ext.worker.evaluate(() => {
        chrome.tabs.captureVisibleTab = () => Promise.reject(new Error("forced failure"));
      });
      const popup = await openPopup(ext);
      const res = await requestCapture(popup, "full");
      assert.equal(res.ok, false);
      assert.match(res.error, /forced failure/);
      assert.equal(await page.locator("#longshot-capture-style").count(), 0, "capture CSS removed");
    });
  });

  it("does not hang capturing an extension page while an editor tab is open", async () => {
    await withExtension({}, async (ext) => {
      const editor = await ext.context.newPage();
      await editor.goto(ext.extUrl("editor.html"));
      const files = await ext.context.newPage();
      await files.goto(ext.extUrl("files.html"));
      const popup = await openPopup(ext);
      const res = await Promise.race([
        requestCapture(popup, "full"),
        new Promise((r) => setTimeout(() => r({ ok: false, error: "timed out" }), 20000)),
      ]);
      assert.deepEqual(res, { ok: true });
    });
  });

  it("reports AVIF as unsupported instead of saving PNG bytes", async () => {
    await withExtension({}, async (ext) => {
      await setSettings(ext.worker, { format: "avif" });
      const page = await ext.context.newPage();
      await page.goto(server.url("sticky.html"));
      const popup = await openPopup(ext);
      const res = await requestCapture(popup, "visible");
      const encodes = await page.evaluate(async () => {
        const canvas = new OffscreenCanvas(1, 1);
        canvas.getContext("2d");
        const blob = await canvas.convertToBlob({ type: "image/avif" });
        return blob.type === "image/avif";
      });
      if (encodes) assert.deepEqual(res, { ok: true });
      else assert.deepEqual(res, { ok: false, error: "This browser cannot encode AVIF" });
    });
  });
});

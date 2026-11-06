import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { after, describe, it } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright";
import { capture } from "../../cli/playwright-adapter.mjs";
import { CANVAS_MAX_SIDE } from "../../extension/core/index.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const fixture = pathToFileURL(join(root, "test/fixtures/tall.html")).href;
const channel = process.env.LONGSHOT_CHANNEL || "chrome";
const tmp = mkdtempSync(join(tmpdir(), "longshot-tall-"));

after(() => rmSync(tmp, { recursive: true, force: true }));

async function samplePixels(path) {
  const browser = await chromium.launch(channel === "chromium" ? {} : { channel });
  try {
    const page = await browser.newPage();
    return await page.evaluate(async (bytes) => {
      const bmp = await createImageBitmap(new Blob([new Uint8Array(bytes)]));
      const canvas = new OffscreenCanvas(bmp.width, bmp.height);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(bmp, 0, 0);
      const px = (y) => [...ctx.getImageData(Math.floor(bmp.width / 2), y, 1, 1).data];
      return { top: px(2), bottom: px(bmp.height - 3) };
    }, [...readFileSync(path)]);
  } finally {
    await browser.close();
  }
}

// 40000 CSS px at 2x is 80000 device px: past Chrome's canvas limits unless the
// image is scaled while it is stitched.
describe("tall page at 2x", { timeout: 240000 }, () => {
  for (const engine of ["tiled", "native"]) {
    it(`${engine}: scales to fit instead of producing a blank image`, async () => {
      const out = join(tmp, `tall-${engine}.png`);
      const result = await capture({
        url: fixture,
        fullPage: true,
        engine,
        overflow: false,
        device: "desktop",
        format: "png",
        maxBytes: 0,
        out,
        channel,
        headed: false,
        selector: null,
        region: null,
        wait: null,
        cdp: null,
        viewport: { width: 800, height: 600, scale: 2 },
      });
      assert.ok(result.height <= CANVAS_MAX_SIDE, `height ${result.height}`);
      assert.ok(result.height > 30000, `height ${result.height}`);
      const { top, bottom } = await samplePixels(result.path);
      assert.equal(top[3], 255, "top pixel is opaque");
      assert.equal(bottom[3], 255, "bottom pixel is opaque");
      assert.ok(top[0] > top[2], `top is red: ${top}`);
      // The fixture ends at #3333cc; a truncated capture ends partway through the gradient.
      assert.ok(bottom[2] - bottom[0] > 120, `bottom is the gradient's end: ${bottom}`);
    });
  }
});

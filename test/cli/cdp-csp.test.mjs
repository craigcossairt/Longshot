import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { after, describe, it } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import { EXIT } from "../../cli/args.mjs";
import { capture } from "../../cli/playwright-adapter.mjs";
import { chromium } from "../../cli/node_modules/playwright/index.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const fixture = pathToFileURL(join(root, "test/fixtures/csp-bloom.html")).href;
const channel = process.env.LONGSHOT_CHANNEL || "chrome";
const tmp = mkdtempSync(join(tmpdir(), "longshot-cdp-csp-"));

after(() => rmSync(tmp, { recursive: true, force: true }));

describe("CDP + Bloom-shaped CSP", { timeout: 120000 }, () => {
  it("captures over --cdp without bypassCSP", async () => {
    const port = 9300 + Math.floor(Math.random() * 500);
    const launchOpts = {
      headless: true,
      args: [`--remote-debugging-port=${port}`],
    };
    if (channel !== "chromium") launchOpts.channel = channel;
    let browser;
    try {
      browser = await chromium.launch(launchOpts);
    } catch (error) {
      throw new Error(`browser could not launch (${channel}): ${error.message}`);
    }
    try {
      const result = await capture({
        url: fixture,
        fullPage: true,
        engine: "tiled",
        overflow: false,
        device: "desktop",
        width: 800,
        height: 600,
        scale: 1,
        format: "png",
        maxBytes: 0,
        out: join(tmp, "cdp-csp.png"),
        channel,
        headed: false,
        selector: null,
        region: null,
        wait: 200,
        cdp: `http://127.0.0.1:${port}`,
        viewport: { width: 800, height: 600, scale: 1 },
      });
      assert.ok(result.bytes > 0);
      assert.ok(result.width >= 800);
    } catch (error) {
      if (error?.code === EXIT.BROWSER) {
        throw new Error(`cdp connect failed: ${error.message}`);
      }
      throw error;
    } finally {
      await browser.close();
    }
  });
});

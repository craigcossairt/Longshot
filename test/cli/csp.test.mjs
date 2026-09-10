import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { after, describe, it } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import { EXIT } from "../../cli/args.mjs";
import { capture } from "../../cli/playwright-adapter.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const fixture = pathToFileURL(join(root, "test/fixtures/csp.html")).href;
const channel = process.env.LONGSHOT_CHANNEL || "chrome";
const tmp = mkdtempSync(join(tmpdir(), "longshot-csp-"));

after(() => {
  rmSync(tmp, { recursive: true, force: true });
});

describe("CSP fixture", { timeout: 90000 }, () => {
  it("captures a page with default-src 'self'", async () => {
    let result;
    try {
      result = await capture({
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
        out: join(tmp, "csp.png"),
        channel,
        headed: false,
        selector: null,
        region: null,
        wait: 200,
        cdp: null,
        viewport: { width: 800, height: 600, scale: 1 },
      });
    } catch (error) {
      if (error?.code === EXIT.BROWSER) {
        throw new Error(`browser could not launch (${channel}): ${error.message}`);
      }
      throw error;
    }
    assert.ok(result.bytes > 0);
    assert.ok(result.width >= 800);
    assert.ok(result.height >= 600);
  });
});

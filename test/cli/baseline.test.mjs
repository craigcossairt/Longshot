import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { after, describe, it } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import { capture } from "../../cli/playwright-adapter.mjs";
import { buildVerdict, compareToBaselineFile, compareVerdict } from "../../cli/verdict.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const sticky = pathToFileURL(join(root, "test/fixtures/sticky.html")).href;
const csp = pathToFileURL(join(root, "test/fixtures/csp.html")).href;
const channel = process.env.LONGSHOT_CHANNEL || "chrome";
const tmp = mkdtempSync(join(tmpdir(), "longshot-baseline-"));

after(() => rmSync(tmp, { recursive: true, force: true }));

function opts(url, out) {
  return {
    url,
    fullPage: false,
    engine: "tiled",
    overflow: false,
    device: "desktop",
    width: 800,
    height: 600,
    scale: 1,
    format: "png",
    maxBytes: 0,
    out,
    channel,
    headed: false,
    selector: null,
    region: null,
    wait: 200,
    cdp: null,
    viewport: { width: 800, height: 600, scale: 1 },
  };
}

describe("baseline capture", { timeout: 180000 }, () => {
  it("reports no divergence when the same page is captured twice", async () => {
    const first = await capture(opts(sticky, join(tmp, "a.png")));
    const second = await capture(opts(sticky, join(tmp, "b.png")));
    const cmp = compareVerdict(buildVerdict(second), buildVerdict(first));
    assert.equal(cmp.divergesFromBaseline, false, cmp.reasons.join("; "));
  });

  it("reports divergence with a reason when the page changed", async () => {
    const first = await capture(opts(sticky, join(tmp, "c.png")));
    const second = await capture(opts(csp, join(tmp, "d.png")));
    const cmp = compareVerdict(buildVerdict(second), buildVerdict(first));
    assert.equal(cmp.divergesFromBaseline, true);
    assert.ok(cmp.reasons.length > 0);
  });

  it("reports divergence for a missing baseline file rather than success", async () => {
    const first = await capture(opts(sticky, join(tmp, "e.png")));
    const cmp = compareToBaselineFile(buildVerdict(first), join(tmp, "missing.verdict.json"));
    assert.equal(cmp.divergesFromBaseline, true);
    assert.ok(cmp.reasons.some((r) => /missing/.test(r)));
  });
});

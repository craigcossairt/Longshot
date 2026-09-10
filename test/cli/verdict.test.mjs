import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, describe, it } from "node:test";
import {
  buildVerdict,
  compareToBaseline,
  compareToBaselineFile,
  compareVerdict,
  REGION_GRID,
} from "../../cli/verdict.mjs";
import { EXIT, parseArgs } from "../../cli/args.mjs";

const tmp = mkdtempSync(join(tmpdir(), "longshot-verdict-"));
after(() => rmSync(tmp, { recursive: true, force: true }));

function verdict(extra = {}) {
  const regions = Array.from({ length: REGION_GRID * REGION_GRID }, (_, i) => `r${i}`);
  return buildVerdict({
    path: "a.png",
    width: 800,
    height: 600,
    format: "png",
    bytes: 1000,
    engine: "tiled",
    tiles: 1,
    url: "file:///page.html",
    sha256: "abc",
    regions,
    ...extra,
  });
}

describe("parseArgs --baseline", () => {
  it("records the baseline path", () => {
    const parsed = parseArgs(["--url", "https://example.com", "--baseline", "prior.verdict.json"]);
    assert.equal(parsed.ok, true);
    assert.equal(parsed.options.baseline, "prior.verdict.json");
  });
});

describe("compareToBaseline", () => {
  it("reports no divergence for the same verdict twice", () => {
    const cur = verdict();
    const cmp = compareVerdict(cur, { ...cur });
    assert.equal(cmp.divergesFromBaseline, false);
    assert.deepEqual(cmp.reasons, []);
  });

  it("reports divergence with a reason when the page changed", () => {
    const cur = verdict({ width: 800, regions: verdict().regions.map((h, i) => (i < 20 ? `x${i}` : h)) });
    const base = verdict();
    const cmp = compareVerdict(cur, base);
    assert.equal(cmp.divergesFromBaseline, true);
    assert.ok(cmp.reasons.some((r) => /regions changed/.test(r)));
  });

  it("treats corrupt JSON as divergence, not success", () => {
    const cmp = compareToBaseline(verdict(), "{not json");
    assert.equal(cmp.divergesFromBaseline, true);
    assert.ok(cmp.reasons.some((r) => /unreadable: invalid JSON/.test(r)));
  });

  it("treats a missing baseline file as divergence, not success", () => {
    const cmp = compareToBaselineFile(verdict(), join(tmp, "no-such-file.json"));
    assert.equal(cmp.divergesFromBaseline, true);
    assert.ok(cmp.reasons.some((r) => /baseline missing/.test(r)));
  });

  it("treats a malformed object as divergence", () => {
    const cmp = compareToBaseline(verdict(), "[]");
    assert.equal(cmp.divergesFromBaseline, true);
  });

  it("does not cry wolf when sha256 differs but regions stay within tolerance", () => {
    const base = verdict();
    const cur = verdict({ sha256: "different", regions: base.regions.map((h, i) => (i === 0 ? "only-one" : h)) });
    const cmp = compareVerdict(cur, base);
    assert.equal(cmp.divergesFromBaseline, false);
  });
});

describe("exit codes", () => {
  it("reserves 5 for baseline divergence", () => {
    assert.equal(EXIT.DIFF, 5);
    assert.notEqual(EXIT.DIFF, EXIT.CAPTURE);
  });
});

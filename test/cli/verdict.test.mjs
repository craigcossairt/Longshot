import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync, linkSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, describe, it } from "node:test";
import {
  buildVerdict,
  compareToBaseline,
  compareToBaselineFile,
  compareVerdict,
  REGION_GRID,
  assertBaselineSafeOutput,
} from "../../cli/verdict.mjs";
import { EXIT, parseArgs } from "../../cli/args.mjs";

const tmp = mkdtempSync(join(tmpdir(), "longshot-verdict-"));
after(() => rmSync(tmp, { recursive: true, force: true }));

describe("baseline file identity", () => {
  for (const sidecar of [false, true]) {
    it(`rejects a hard-linked ${sidecar ? "verdict" : "image"} destination`, () => {
      const baseline = join(tmp, `hardlink-${sidecar}.json`);
      writeFileSync(baseline, "baseline");
      const image = join(tmp, `target-${sidecar}.png`);
      linkSync(baseline, sidecar ? join(tmp, `target-${sidecar}.verdict.json`) : image);
      assert.throws(() => assertBaselineSafeOutput(image, baseline), /overwrite --baseline/);
    });
  }
  it("rejects differently cased aliases on a case-insensitive filesystem", (t) => {
    const baseline = join(tmp, "MixedCase.verdict.json");
    writeFileSync(baseline, "baseline");
    if (!existsSync(join(tmp, "mixedcase.verdict.json"))) return t.skip("filesystem is case-sensitive");
    assert.throws(() => assertBaselineSafeOutput(join(tmp, "mixedcase.png"), baseline), /overwrite --baseline/);
  });
});

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

  it("rejects incomplete region data rather than comparing only matching metadata", () => {
    const incomplete = { ...verdict(), regions: [] };
    const cmp = compareToBaseline(verdict(), JSON.stringify(incomplete));
    assert.equal(cmp.divergesFromBaseline, true);
    assert.match(cmp.reasons[0], /not a complete verdict/);
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

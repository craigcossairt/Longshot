import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { after, describe, it } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import { buildVerdict } from "../../cli/verdict.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const entry = join(root, "longshot.js");
const fixture = pathToFileURL(join(root, "test/fixtures/csp.html")).href;
const channel = process.env.LONGSHOT_CHANNEL || "chrome";
const tmp = mkdtempSync(join(tmpdir(), "longshot-process-"));
after(() => rmSync(tmp, { recursive: true, force: true }));

function run(args) {
  return new Promise((resolve, reject) => {
    execFile(process.execPath, [entry, ...args], { timeout: 45000 }, (error, stdout, stderr) => {
      if (error?.killed) return reject(new Error(`CLI did not exit: ${stderr}`));
      try { resolve({ code: error?.code || 0, result: JSON.parse(stdout) }); }
      catch (cause) { reject(new Error(`Invalid CLI response: ${stdout} ${stderr}`, { cause })); }
    });
  });
}

const args = (out) => ["--url", fixture, "--channel", channel, "--width", "200", "--height", "200", "--out", out];

describe("CLI output safety", { timeout: 180000 }, () => {
  it("does not create a missing baseline before comparing to it", async () => {
    const out = join(tmp, "missing.png");
    const baseline = join(tmp, "missing.verdict.json");
    const result = await run([...args(out), "--baseline", baseline]);
    assert.equal(result.code, 5);
    assert.match(result.result.error, /baseline missing/);
    assert.equal(existsSync(out), false);
    assert.equal(existsSync(baseline), false);
  });

  it("preserves the baseline when its image was deleted and output would reuse its sidecar", async () => {
    const out = join(tmp, "previous.png");
    const baseline = join(tmp, "previous.verdict.json");
    const previous = JSON.stringify(buildVerdict({ width: 200, height: 200, format: "png", engine: "viewport",
      tiles: 1, regions: Array(64).fill("previous"), sha256: "previous", url: fixture }));
    writeFileSync(baseline, previous);
    const result = await run([...args(out), "--baseline", baseline]);
    assert.equal(result.code, 2);
    assert.match(result.result.error, /overwrite --baseline/);
    assert.equal(readFileSync(baseline, "utf8"), previous);
    assert.equal(existsSync(out), false);
  });

  it("compares a successful CLI capture against an independent baseline", async () => {
    const first = await run(args(join(tmp, "first.png")));
    assert.equal(first.code, 0, first.result.error);
    const second = await run([...args(join(tmp, "second.png")), "--baseline", first.result.verdict]);
    assert.equal(second.code, 0, second.result.error);
  });

  it("reports an impossible byte budget instead of writing an oversized result", async () => {
    const out = join(tmp, "oversized.png");
    const result = await run([...args(out), "--max-bytes", "1"]);
    assert.equal(result.code, 1);
    assert.match(result.result.error, /Cannot meet --max-bytes/);
    assert.equal(existsSync(out), false);
  });

  it("includes the PDF wrapper in the final byte budget", async () => {
    const blank = pathToFileURL(join(root, "test/fixtures/cli-budget.html")).href;
    const first = await run([...args(join(tmp, "pdf-reference.pdf")), "--url", blank, "--format", "pdf"]);
    assert.equal(first.code, 0, first.result.error);
    const out = join(tmp, "pdf-over-budget.pdf");
    const result = await run([...args(out), "--url", blank, "--format", "pdf", "--max-bytes", String(first.result.bytes - 1)]);
    assert.equal(result.code, 1);
    assert.match(result.result.error, /final pdf/);
    assert.equal(existsSync(out), false);
  });
});

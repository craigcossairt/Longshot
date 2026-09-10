import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const coreDir = join(dirname(fileURLToPath(import.meta.url)), "../../extension/core");

function moduleScopeSource(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
}

function listJs(dir, acc = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) listJs(full, acc);
    else if (entry.name.endsWith(".js")) acc.push(full);
  }
  return acc;
}

describe("extension/core purity", () => {
  it("does not reference chrome, window, or document at module scope", () => {
    const files = listJs(coreDir);
    assert.ok(files.length > 0);
    for (const full of files) {
      const src = moduleScopeSource(readFileSync(full, "utf8"));
      const stripped = src.replace(/export function[\s\S]*?(?=\nexport |\n*$)/g, "");
      assert.doesNotMatch(stripped, /\bchrome\./, `${full} references chrome. at module scope`);
      assert.doesNotMatch(stripped, /\bwindow\./, `${full} references window. at module scope`);
      assert.doesNotMatch(stripped, /\bdocument\./, `${full} references document. at module scope`);
    }
  });
});

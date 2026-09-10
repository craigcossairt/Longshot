import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const coreDir = join(dirname(fileURLToPath(import.meta.url)), "../../extension/core");

function moduleScopeSource(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
}

describe("extension/core purity", () => {
  it("does not reference chrome, window, or document at module scope", () => {
    const files = readdirSync(coreDir).filter((name) => name.endsWith(".js"));
    assert.ok(files.length > 0);
    for (const name of files) {
      const src = moduleScopeSource(readFileSync(join(coreDir, name), "utf8"));
      const stripped = src.replace(/export function[\s\S]*?(?=\nexport |\n*$)/g, "");
      assert.doesNotMatch(stripped, /\bchrome\./, `${name} references chrome. at module scope`);
      assert.doesNotMatch(stripped, /\bwindow\./, `${name} references window. at module scope`);
      assert.doesNotMatch(stripped, /\bdocument\./, `${name} references document. at module scope`);
    }
  });
});

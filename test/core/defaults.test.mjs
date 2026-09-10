import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { DEFAULTS } from "../../extension/core/defaults.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

describe("DEFAULTS", () => {
  it("matches the classic options-page copy", () => {
    const src = readFileSync(join(root, "extension/defaults.js"), "utf8");
    const classic = new Function(`${src}; return LONGSHOT_DEFAULTS;`)();
    assert.deepEqual(classic, DEFAULTS);
  });
});

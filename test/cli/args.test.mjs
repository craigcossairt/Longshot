import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { EXIT, parseArgs } from "../../cli/args.mjs";

describe("parseArgs", () => {
  it("requires --url", () => {
    const parsed = parseArgs([]);
    assert.equal(parsed.ok, false);
    assert.equal(parsed.code, EXIT.ARGS);
  });

  it("rejects unknown flags", () => {
    const parsed = parseArgs(["--url", "https://example.com", "--nope", "1"]);
    assert.equal(parsed.ok, false);
    assert.equal(parsed.code, EXIT.ARGS);
  });

  it("rejects combined capture modes", () => {
    const parsed = parseArgs(["--url", "https://example.com", "--full-page", "--selector", "main"]);
    assert.equal(parsed.ok, false);
  });

  it("parses a tiled full-page capture", () => {
    const parsed = parseArgs([
      "--url",
      "https://example.com",
      "--full-page",
      "--format",
      "jpeg",
      "--max-bytes",
      "500000",
      "--device",
      "mobile",
    ]);
    assert.equal(parsed.ok, true);
    assert.equal(parsed.options.engine, "tiled");
    assert.equal(parsed.options.format, "jpeg");
    assert.equal(parsed.options.maxBytes, 500000);
    assert.equal(parsed.options.viewport.width, 390);
  });

  it("parses --region x,y,w,h", () => {
    const parsed = parseArgs(["--url", "https://example.com", "--region", "10,20,300,400"]);
    assert.equal(parsed.ok, true);
    assert.deepEqual(parsed.options.region, { x: 10, y: 20, w: 300, h: 400 });
  });
});

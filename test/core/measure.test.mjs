import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { positions } from "../../extension/core/measure.js";

describe("positions", () => {
  it("returns [0] when the page fits in the viewport", () => {
    assert.deepEqual(positions(800, 800), [0]);
    assert.deepEqual(positions(500, 800), [0]);
  });

  it("keeps the last origin on a step when the page is an exact multiple", () => {
    assert.deepEqual(positions(1600, 800), [0, 800]);
    assert.deepEqual(positions(2400, 800), [0, 800, 1600]);
  });

  it("snaps the last origin to full - view for a partial final tile", () => {
    assert.deepEqual(positions(1000, 800), [0, 200]);
    assert.deepEqual(positions(2000, 800), [0, 800, 1200]);
  });

  it("builds a 2d grid from independent axis calls", () => {
    const xs = positions(1000, 800);
    const ys = positions(2000, 800);
    assert.deepEqual(xs, [0, 200]);
    assert.deepEqual(ys, [0, 800, 1200]);
    const cells = ys.flatMap((y) => xs.map((x) => [x, y]));
    assert.equal(cells.length, 6);
    assert.deepEqual(cells[cells.length - 1], [200, 1200]);
  });
});

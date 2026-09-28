import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { stitch } from "../../extension/core/stitch.js";

function recorder() {
  const canvases = [];
  const createCanvas = (width, height) => {
    const draws = [];
    const canvas = { width, height, draws, getContext: () => ({ drawImage: (...args) => draws.push(args.slice(1)) }) };
    canvases.push(canvas);
    return canvas;
  };
  return { canvases, createCanvas };
}

const decode = async (dataUrl) => ({ width: 200, height: 100, id: dataUrl });
const shots = [
  { x: 0, y: 0, dataUrl: "a" },
  { x: 0, y: 50, dataUrl: "b" },
];

describe("stitch", () => {
  it("draws tiles at device offsets when scale is 1", async () => {
    const { canvases, createCanvas } = recorder();
    const out = await stitch(shots, { fullW: 100, fullH: 100, dpr: 2 }, { decode, createCanvas });
    assert.equal(canvases.length, 1);
    assert.deepEqual([out.width, out.height], [200, 200]);
    assert.deepEqual(out.draws, [
      [0, 0],
      [0, 100],
    ]);
  });

  it("allocates only the scaled canvas and draws tiles into it edge to edge", async () => {
    const { canvases, createCanvas } = recorder();
    const out = await stitch(shots, { fullW: 100, fullH: 100, dpr: 2, scale: 0.5 }, { decode, createCanvas });
    assert.equal(canvases.length, 1);
    assert.deepEqual([out.width, out.height], [100, 100]);
    assert.deepEqual(out.draws, [
      [0, 0, 100, 50],
      [0, 50, 100, 50],
    ]);
  });
});

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { fitFileSize, fitLimits } from "../../extension/core/fit.js";

function fakeCanvas(width, height) {
  return {
    width,
    height,
    getContext() {
      return { imageSmoothingEnabled: false, drawImage() {} };
    },
  };
}

function encodeSized(bytesFor) {
  return async (canvas, { quality = 1 } = {}) => ({
    size: Math.max(1, Math.round(bytesFor(canvas, quality))),
  });
}

describe("fitLimits", () => {
  it("returns the source when scale and limits are no-ops", () => {
    const source = fakeCanvas(800, 600);
    const out = fitLimits(source, { scalePercent: 100, maxWidth: 8192, maxHeight: 32768 }, { createCanvas: fakeCanvas });
    assert.equal(out, source);
  });

  it("scales down to maxWidth / maxHeight", () => {
    const source = fakeCanvas(2000, 1000);
    const out = fitLimits(source, { scalePercent: 100, maxWidth: 1000, maxHeight: 32768 }, { createCanvas: fakeCanvas });
    assert.equal(out.width, 1000);
    assert.equal(out.height, 500);
  });
});

describe("fitFileSize", () => {
  it("is a no-op when maxFileMB is 0", async () => {
    const source = fakeCanvas(800, 600);
    const out = await fitFileSize(source, { maxFileMB: 0, format: "png" }, {
      encode: encodeSized(() => 9e9),
      createCanvas: fakeCanvas,
    });
    assert.equal(out, source);
  });

  it("lowers jpeg quality before resizing", async () => {
    const source = fakeCanvas(400, 400);
    const qualities = [];
    const out = await fitFileSize(
      source,
      { maxFileMB: 1, format: "jpeg", quality: 0.92 },
      {
        encode: async (canvas, { quality }) => {
          qualities.push(quality);
          return { size: quality > 0.5 ? 2 * 1024 * 1024 : 100 };
        },
        createCanvas: fakeCanvas,
      },
    );
    assert.equal(out, source);
    assert.ok(qualities.includes(0.92));
    assert.ok(qualities.some((q) => q <= 0.5));
  });

  it("downscales by sqrt(max/size)*0.9 when still over budget", async () => {
    const source = fakeCanvas(1000, 1000);
    const widths = [];
    const out = await fitFileSize(
      source,
      { maxFileMB: 1, format: "png" },
      {
        encode: async (canvas) => {
          widths.push(canvas.width);
          return { size: canvas.width * canvas.height * 4 };
        },
        createCanvas: fakeCanvas,
      },
    );
    assert.ok(out.width < 1000);
    assert.ok(widths.length > 1);
  });

  it("gives up at the 256px floor and returns the last canvas", async () => {
    const source = fakeCanvas(1000, 1000);
    const out = await fitFileSize(
      source,
      { maxFileMB: 0.000001, format: "png" },
      {
        encode: async (canvas) => ({ size: canvas.width * canvas.height * 1000 }),
        createCanvas: fakeCanvas,
      },
    );
    assert.equal(out.width, 256);
    assert.equal(out.height, 256);
  });

  it("gives up when the scale factor is not finite", async () => {
    const source = fakeCanvas(800, 600);
    const out = await fitFileSize(
      source,
      { maxFileMB: 1, format: "png" },
      {
        encode: async () => ({ size: 0 }),
        createCanvas: fakeCanvas,
      },
    );
    assert.equal(out, source);
  });
});

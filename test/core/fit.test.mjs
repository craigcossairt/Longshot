import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CANVAS_MAX_AREA, CANVAS_MAX_SIDE, fitFileSize, fitLimits, limitScale } from "../../extension/core/fit.js";

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

describe("limitScale", () => {
  const defaults = { scalePercent: 100, maxWidth: 8192, maxHeight: 32768 };

  it("is 1 when nothing needs to shrink", () => {
    assert.equal(limitScale(1600, 20000, defaults), 1);
  });

  it("applies scalePercent and never enlarges past it", () => {
    assert.equal(limitScale(1000, 1000, { ...defaults, scalePercent: 50 }), 0.5);
    assert.equal(limitScale(100, 100, { ...defaults, scalePercent: 100, maxWidth: 1e6 }), 1);
  });

  it("fits the tighter of maxWidth and maxHeight", () => {
    assert.equal(limitScale(1600, 80000, defaults), 32768 / 80000);
    assert.equal(limitScale(16000, 100, defaults), 8192 / 16000);
  });

  it("stays inside canvas limits when the settings allow more", () => {
    const open = { scalePercent: 100, maxWidth: 0, maxHeight: 0 };
    const s = limitScale(20000, 20000, open);
    assert.ok(20000 * s * 20000 * s <= CANVAS_MAX_AREA + 1);
    assert.ok(Math.round(100000 * limitScale(10, 100000, open)) <= CANVAS_MAX_SIDE);
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

  it("keeps the aspect ratio when the short side hits the 256px floor", async () => {
    const source = fakeCanvas(400, 4000);
    const out = await fitFileSize(
      source,
      { maxFileMB: 0.000001, format: "png" },
      {
        encode: async (canvas) => ({ size: canvas.width * canvas.height * 1000 }),
        createCanvas: fakeCanvas,
      },
    );
    assert.equal(out.width, 256);
    assert.equal(out.height, 2560);
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

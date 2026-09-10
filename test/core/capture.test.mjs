import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { runTiledCapture } from "../../extension/core/capture.js";

function dimFor({ scrollWidth, scrollHeight, vw, vh }) {
  return {
    scrollX: 0,
    scrollY: 0,
    scrollWidth,
    scrollHeight,
    viewportWidth: vw,
    viewportHeight: vh,
    devicePixelRatio: 1,
    title: "Page",
    url: "https://example.com/",
  };
}

describe("runTiledCapture", () => {
  it("hides chrome from tile 2 onward and uses actual scroll positions", async () => {
    const hides = [];
    const scrolls = [];
    const result = await runTiledCapture({
      mode: "full",
      dim: dimFor({ scrollWidth: 800, scrollHeight: 2000, vw: 800, vh: 800 }),
      scroll: async (x, y) => {
        scrolls.push([x, y]);
        return { x, y };
      },
      hideChrome: async () => {
        hides.push(scrolls.length);
      },
      reset: async () => {},
      captureTile: async () => "data:tile",
      delay: async () => {},
    });
    assert.equal(result.tiles, 3);
    assert.deepEqual(
      result.shots.map((s) => [s.x, s.y]),
      [
        [0, 0],
        [0, 800],
        [0, 1200],
      ],
    );
    assert.deepEqual(hides, [2, 3]);
  });

  it("skips a duplicate actual scroll position", async () => {
    let n = 0;
    const result = await runTiledCapture({
      mode: "full",
      dim: dimFor({ scrollWidth: 800, scrollHeight: 1000, vw: 800, vh: 800 }),
      scroll: async (x, y) => {
        n += 1;
        if (n === 2) return { x: 0, y: 0 };
        return { x, y };
      },
      hideChrome: async () => {},
      reset: async () => {},
      captureTile: async () => "data:tile",
      delay: async () => {},
    });
    assert.equal(result.tiles, 1);
  });

  it("places a visible capture at (0,0) regardless of scroll", async () => {
    const result = await runTiledCapture({
      mode: "visible",
      dim: dimFor({ scrollWidth: 2000, scrollHeight: 2000, vw: 800, vh: 600 }),
      scroll: async () => {
        throw new Error("visible mode must not scroll");
      },
      hideChrome: async () => {
        throw new Error("visible mode must not hide");
      },
      reset: async () => {},
      captureTile: async () => "data:visible",
      delay: async () => {},
    });
    assert.deepEqual(result.shots, [{ x: 0, y: 0, dataUrl: "data:visible" }]);
    assert.equal(result.fullW, 800);
    assert.equal(result.fullH, 600);
  });
});

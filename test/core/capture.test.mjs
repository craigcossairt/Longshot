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
  it("preserves headers across the top row and footers across a clamped bottom row", async () => {
    const hides = [];
    let current;
    const footer = [{x:0,y:270,w:400,h:30}];
    const result = await runTiledCapture({
      mode: "full", dim: dimFor({scrollWidth:800,scrollHeight:700,vw:400,vh:300}),
      scroll: async (x, y) => ({x, y: Math.min(y, 300)}),
      hideChrome: async (opts) => { current = opts; hides.push(opts); return opts.bottom ? {} : {bottomRects:footer}; },
      reset: async () => {}, delay: async () => {},
      captureTile: async () => JSON.stringify(current),
    });
    assert.deepEqual(hides, [
      {top:false,bottom:true}, {top:false,bottom:true},
      {top:true,bottom:true}, {top:true,bottom:true},
      {top:true,bottom:false}, {top:true,bottom:false},
    ]);
    assert.equal(result.shots.length, 6);
    assert.deepEqual(result.shots.slice(-2).map((s) => s.bottomRects), [footer,footer]);
  });

  it("hides the footer on every tile but the last and uses actual scroll positions", async () => {
    const hides = [];
    const scrolls = [];
    const result = await runTiledCapture({
      mode: "full",
      dim: dimFor({ scrollWidth: 800, scrollHeight: 2000, vw: 800, vh: 800 }),
      scroll: async (x, y) => {
        scrolls.push([x, y]);
        return { x, y };
      },
      hideChrome: async (opts) => {
        hides.push(opts);
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
    assert.deepEqual(hides, [
      { top: false, bottom: true },
      { top: true, bottom: true },
      { top: true, bottom: false },
    ]);
  });

  it("leaves chrome alone when the page fits in one tile", async () => {
    let hides = 0;
    const result = await runTiledCapture({
      mode: "full",
      dim: dimFor({ scrollWidth: 800, scrollHeight: 600, vw: 800, vh: 600 }),
      scroll: async (x, y) => ({ x, y }),
      hideChrome: async () => {
        hides += 1;
      },
      reset: async () => {},
      captureTile: async () => "data:tile",
      delay: async () => {},
    });
    assert.equal(result.tiles, 1);
    assert.equal(hides, 0);
  });

  it("sizes the canvas to the tiles that actually scrolled", async () => {
    const result = await runTiledCapture({
      mode: "full",
      dim: dimFor({ scrollWidth: 1600, scrollHeight: 800, vw: 800, vh: 800 }),
      scroll: async () => ({ x: 0, y: 0 }),
      hideChrome: async () => {},
      reset: async () => {},
      captureTile: async () => "data:tile",
      delay: async () => {},
    });
    assert.equal(result.tiles, 2);
    assert.equal(result.fullW, 800);
    assert.equal(result.fullH, 800);
  });

  it("skips an intermediate duplicate but captures the last position again", async () => {
    let n = 0;
    const result = await runTiledCapture({
      mode: "full",
      dim: dimFor({ scrollWidth: 800, scrollHeight: 2000, vw: 800, vh: 800 }),
      scroll: async (x, y) => {
        n += 1;
        return { x: 0, y: 0 };
      },
      hideChrome: async () => {},
      reset: async () => {},
      captureTile: async () => "data:tile",
      delay: async () => {},
    });
    assert.equal(n, 3);
    assert.equal(result.tiles, 2);
  });

  it("retains the final frame and footer rectangles when its scroll position clamps", async () => {
    let bottomVisible = false;
    const bottomRects = [{ x: 0, y: 740, w: 800, h: 60 }];
    const result = await runTiledCapture({
      mode: "full",
      dim: dimFor({ scrollWidth: 800, scrollHeight: 1000, vw: 800, vh: 800 }),
      scroll: async () => ({ x: 0, y: 0 }),
      hideChrome: async ({ bottom }) => {
        bottomVisible = !bottom;
        return bottomVisible ? { bottomRects } : {};
      },
      reset: async () => {},
      captureTile: async () => bottomVisible ? "data:footer" : "data:content",
      delay: async () => {},
    });
    assert.deepEqual(result.shots, [
      { x: 0, y: 0, dataUrl: "data:content" },
      { x: 0, y: 0, dataUrl: "data:footer", bottomRects },
    ]);
    assert.equal(result.fullH, 800);
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

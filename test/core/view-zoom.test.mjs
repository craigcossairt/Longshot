import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ZOOM_MAX,
  ZOOM_MIN,
  ZOOM_STEP,
  clampZoom,
  fitWidthZoom,
  scrollAfterZoom,
  stepZoom,
  zoomPercent,
} from "../../extension/view-zoom.js";

describe("clampZoom", () => {
  it("clamps to the editor range", () => {
    assert.equal(clampZoom(ZOOM_MIN), ZOOM_MIN);
    assert.equal(clampZoom(ZOOM_MAX), ZOOM_MAX);
    assert.equal(clampZoom(0.01), ZOOM_MIN);
    assert.equal(clampZoom(8), ZOOM_MAX);
  });

  it("treats non-finite values as 100%", () => {
    assert.equal(clampZoom(Number.NaN), 1);
    assert.equal(clampZoom(Infinity), 1);
  });
});

describe("stepZoom", () => {
  it("steps by 10% and stays in range", () => {
    assert.equal(stepZoom(1, ZOOM_STEP), 1.1);
    assert.equal(stepZoom(0.2, -ZOOM_STEP), ZOOM_MIN);
    assert.equal(stepZoom(ZOOM_MIN, -ZOOM_STEP), ZOOM_MIN);
    assert.equal(stepZoom(ZOOM_MAX, ZOOM_STEP), ZOOM_MAX);
  });
});

describe("fitWidthZoom", () => {
  it("fits a wide capture to the stage without upscaling", () => {
    assert.equal(fitWidthZoom(2000, 1064, 64), 0.5);
    assert.equal(fitWidthZoom(800, 2000), 1);
    assert.equal(fitWidthZoom(0, 1000), 1);
  });
});

describe("zoomPercent", () => {
  it("rounds the visible label", () => {
    assert.equal(zoomPercent(0.456), 46);
    assert.equal(zoomPercent(1), 100);
  });
});

describe("scrollAfterZoom", () => {
  it("keeps the image point under the cursor", () => {
    const next = scrollAfterZoom({
      imgX: 200,
      imgY: 80,
      nextZoom: 2,
      wrapOffsetLeft: 100,
      wrapOffsetTop: 32,
      originXInStage: 500,
      originYInStage: 200,
    });
    assert.equal(next.scrollLeft, 0);
    assert.equal(next.scrollTop, -8);
  });
});

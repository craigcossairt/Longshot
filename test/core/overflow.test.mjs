import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  OVERFLOW_POLICY,
  overflowScore,
  pageScrollScore,
  pickOverflowScroller,
} from "../../extension/core/overflow.js";

const viewport = { width: 1280, height: 800 };

describe("pickOverflowScroller", () => {
  it("keeps a tall document when that is the main scroller", () => {
    const page = { scrollWidth: 1280, scrollHeight: 5000 };
    const sidebar = {
      scrollWidth: 240,
      scrollHeight: 2000,
      clientWidth: 240,
      clientHeight: 800,
    };
    const picked = pickOverflowScroller({ page, candidates: [sidebar], viewport });
    assert.equal(picked, null);
    assert.ok(pageScrollScore(page, viewport) > overflowScore(sidebar, viewport));
  });

  it("picks a large overflow pane when the page itself does not scroll", () => {
    const page = { scrollWidth: 1280, scrollHeight: 800 };
    const feed = {
      scrollWidth: 960,
      scrollHeight: 4200,
      clientWidth: 960,
      clientHeight: 760,
    };
    const picked = pickOverflowScroller({ page, candidates: [feed], viewport });
    assert.equal(picked, feed);
  });

  it("ignores a tiny overflow widget", () => {
    const page = { scrollWidth: 1280, scrollHeight: 800 };
    const widget = {
      scrollWidth: 80,
      scrollHeight: 400,
      clientWidth: 80,
      clientHeight: 80,
    };
    assert.equal(overflowScore(widget, viewport), 0);
    const picked = pickOverflowScroller({ page, candidates: [widget], viewport });
    assert.equal(picked, null);
  });

  it("uses OVERFLOW_POLICY thresholds", () => {
    const almost = {
      scrollWidth: 1280,
      scrollHeight: 800 + OVERFLOW_POLICY.minExtra - 1,
      clientWidth: 1280,
      clientHeight: 800,
    };
    assert.equal(overflowScore(almost, viewport), 0);
  });
});

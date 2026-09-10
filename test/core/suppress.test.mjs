import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { HIDE_POLICY, shouldHide } from "../../extension/core/suppress.js";

const vw = 1280;

function desc(extra) {
  return { viewportWidth: vw, zIndex: "auto", rect: { top: 0, height: 40, width: 100 }, ...extra };
}

describe("shouldHide", () => {
  it("hides position:fixed", () => {
    assert.equal(shouldHide(desc({ position: "fixed" })), true);
  });

  it("hides position:sticky", () => {
    assert.equal(shouldHide(desc({ position: "sticky" })), true);
  });

  it("hides a high-z-index absolute top bar", () => {
    assert.equal(
      shouldHide(
        desc({
          position: "absolute",
          zIndex: 10,
          rect: { top: 0, height: 64, width: vw * 0.8 },
        }),
      ),
      true,
    );
  });

  it("does not hide a small absolute widget", () => {
    assert.equal(
      shouldHide(
        desc({
          position: "absolute",
          zIndex: 50,
          rect: { top: 20, height: 32, width: 48 },
        }),
      ),
      false,
    );
  });

  it("does not hide html/body or the capture style tag", () => {
    assert.equal(shouldHide(desc({ position: "fixed", isRoot: true })), false);
    assert.equal(shouldHide(desc({ position: "fixed", id: "longshot-capture-style" })), false);
  });

  it("does not hide static or relative elements", () => {
    assert.equal(shouldHide(desc({ position: "static" })), false);
    assert.equal(shouldHide(desc({ position: "relative", zIndex: 99 })), false);
  });

  it("uses HIDE_POLICY thresholds for the top-bar heuristic", () => {
    const almost = desc({
      position: "absolute",
      zIndex: HIDE_POLICY.minZIndex + 1,
      rect: {
        top: HIDE_POLICY.topMin,
        height: HIDE_POLICY.minHeight + 1,
        width: vw * HIDE_POLICY.widthRatio + 1,
      },
    });
    assert.equal(shouldHide(almost), true);
    assert.equal(shouldHide({ ...almost, zIndex: HIDE_POLICY.minZIndex }), false);
  });
});

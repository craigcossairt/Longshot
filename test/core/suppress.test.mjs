import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { afterEach, describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { HIDE_POLICY, installHideSession, shouldHide } from "../../extension/core/suppress.js";

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

function fakeEl({ id = "", position = "static", zIndex = "auto", rect = { top: 0, height: 40, width: 100 } } = {}) {
  const box = { top: rect.top, height: rect.height, width: rect.width, left: 0, right: rect.width, bottom: rect.top + rect.height };
  return {
    id,
    _position: position,
    _zIndex: String(zIndex),
    style: {
      vis: "",
      pri: "",
      getPropertyValue(name) {
        return name === "visibility" ? this.vis : "";
      },
      getPropertyPriority(name) {
        return name === "visibility" ? this.pri : "";
      },
      setProperty(name, value, priority) {
        if (name === "visibility") {
          this.vis = value;
          this.pri = priority || "";
        }
      },
      removeProperty(name) {
        if (name === "visibility") {
          this.vis = "";
          this.pri = "";
        }
      },
    },
    getBoundingClientRect() {
      return box;
    },
  };
}

function installDoc(elements, policy) {
  const html = fakeEl({ id: "html" });
  const body = fakeEl({ id: "body" });
  const all = [html, body, ...elements];
  const view = {
    innerWidth: vw,
    getComputedStyle(el) {
      return { position: el._position, zIndex: el._zIndex };
    },
  };
  const document = {
    documentElement: html,
    body,
    defaultView: view,
    querySelectorAll(sel) {
      if (sel === "*" ) return { forEach: (fn) => all.forEach(fn) };
      return { forEach() {} };
    },
  };
  globalThis.document = document;
  globalThis.innerWidth = vw;
  delete globalThis.__longshotHide;
  installHideSession(policy);
  globalThis.__longshotHide.hide();
  return { html, body, elements };
}

afterEach(() => {
  delete globalThis.__longshotHide;
  delete globalThis.document;
  delete globalThis.innerWidth;
});

describe("installHideSession", () => {
  it("hides position:sticky", () => {
    const sticky = fakeEl({ position: "sticky", rect: { top: 0, height: 64, width: vw } });
    installDoc([sticky]);
    assert.equal(sticky.style.getPropertyValue("visibility"), "hidden");
    assert.equal(sticky.style.getPropertyPriority("visibility"), "important");
  });

  it("hides position:fixed", () => {
    const bar = fakeEl({ position: "fixed" });
    installDoc([bar]);
    assert.equal(bar.style.getPropertyValue("visibility"), "hidden");
  });

  it("hides a high-z-index absolute top bar", () => {
    const bar = fakeEl({
      position: "absolute",
      zIndex: 10,
      rect: { top: 0, height: 64, width: vw * 0.8 },
    });
    installDoc([bar]);
    assert.equal(bar.style.getPropertyValue("visibility"), "hidden");
  });

  it("does not hide a small absolute widget", () => {
    const widget = fakeEl({
      position: "absolute",
      zIndex: 50,
      rect: { top: 20, height: 32, width: 48 },
    });
    installDoc([widget]);
    assert.equal(widget.style.getPropertyValue("visibility"), "");
  });

  it("does not hide html, body, or the capture style tag", () => {
    const style = fakeEl({ id: "longshot-capture-style", position: "fixed" });
    const { html, body } = installDoc([style]);
    assert.equal(html.style.getPropertyValue("visibility"), "");
    assert.equal(body.style.getPropertyValue("visibility"), "");
    assert.equal(style.style.getPropertyValue("visibility"), "");
  });

  it("reset restores visibility and a second hide can run again", () => {
    const sticky = fakeEl({ position: "sticky" });
    sticky.style.setProperty("visibility", "visible", "");
    installDoc([sticky]);
    assert.equal(sticky.style.getPropertyValue("visibility"), "hidden");
    globalThis.__longshotHide.reset();
    assert.equal(sticky.style.getPropertyValue("visibility"), "visible");
    globalThis.__longshotHide.hide();
    assert.equal(sticky.style.getPropertyValue("visibility"), "hidden");
  });

  it("uses the inline fallback policy when none is passed", () => {
    const bar = fakeEl({
      position: "absolute",
      zIndex: 10,
      rect: { top: 0, height: 64, width: vw * 0.8 },
    });
    installDoc([bar], null);
    assert.equal(bar.style.getPropertyValue("visibility"), "hidden");
  });
});

describe("HIDE_POLICY copies", () => {
  it("keeps the installHideSession fallback literal in sync with HIDE_POLICY", () => {
    const src = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../../extension/core/suppress.js"), "utf8");
    const block = src.match(/const p = policy \|\| \{([^}]+)\}/);
    assert.ok(block, "missing policy fallback object");
    for (const [key, value] of Object.entries(HIDE_POLICY)) {
      assert.match(block[1], new RegExp(`${key}:\\s*${value}\\b`), `fallback ${key} drifted from HIDE_POLICY`);
    }
  });
});

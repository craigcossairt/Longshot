import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { afterEach, describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { HIDE_POLICY, chromeKind, installHideSession, shouldHide } from "../../extension/core/suppress.js";

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

  it("keeps a full-height side nav and a modal backdrop", () => {
    const side = desc({
      position: "fixed",
      viewportHeight: 800,
      rect: { top: 0, left: 0, height: 800, width: 240 },
    });
    const backdrop = desc({
      position: "fixed",
      viewportHeight: 800,
      rect: { top: 0, left: 0, width: vw, height: 800 },
    });
    assert.equal(chromeKind(side), "sidebar");
    assert.equal(chromeKind(backdrop), "overlay");
    assert.equal(shouldHide(side), false);
    assert.equal(shouldHide(backdrop), false);
  });

  it("hides a footer on middle tiles and keeps it on the last tile", () => {
    const footer = desc({
      position: "fixed",
      viewportHeight: 800,
      rect: { top: 752, left: 0, height: 48, width: vw, bottom: 800 },
    });
    assert.equal(chromeKind(footer), "bottombar");
    assert.equal(shouldHide(footer), true);
    assert.equal(shouldHide(footer, HIDE_POLICY, { top: true, bottom: false }), false);
  });

  it("treats a sticky footer pinned to a dialog crop as a bottom bar", () => {
    const footer = desc({
      position: "sticky",
      viewportHeight: 800,
      rect: { top: 600, left: 100, width: 600, height: 56, bottom: 656 },
      anchor: { x: 80, y: 100, w: 680, h: 560 },
    });
    assert.equal(chromeKind(footer), "bottombar");
    assert.equal(chromeKind({ ...footer, anchor: null }), "fixed");
    assert.equal(shouldHide(footer, HIDE_POLICY, { top: false, bottom: true }), true);
    assert.equal(shouldHide({ ...footer, anchor: null }, HIDE_POLICY, { top: false, bottom: true }), false);
  });

  it("treats an absolute dialog footer as a bottom bar", () => {
    const footer = desc({
      position: "absolute",
      zIndex: "auto",
      viewportHeight: 800,
      rect: { top: 600, left: 100, width: 600, height: 56, bottom: 656 },
      anchor: { x: 80, y: 100, w: 680, h: 560 },
    });
    assert.equal(chromeKind(footer), "bottombar");
  });

  it("keeps a modal shell when only pinned bars should hide", () => {
    const dialog = desc({
      position: "fixed",
      viewportHeight: 800,
      rect: { top: 40, left: 40, width: 900, height: 500 },
    });
    assert.equal(chromeKind(dialog), "fixed");
    assert.equal(shouldHide(dialog, HIDE_POLICY, { top: true, bottom: true }), true);
    assert.equal(shouldHide(dialog, HIDE_POLICY, { top: true, bottom: true, barsOnly: true }), false);
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
  const left = rect.left || 0;
  const top = rect.top || 0;
  const width = rect.width || 0;
  const height = rect.height || 0;
  const box = {
    top,
    left,
    width,
    height,
    right: rect.right == null ? left + width : rect.right,
    bottom: rect.bottom == null ? top + height : rect.bottom,
  };
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
    innerHeight: 800,
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
  globalThis.innerHeight = 800;
  delete globalThis.__longshotHide;
  installHideSession(policy);
  globalThis.__longshotHide.hide();
  return { html, body, elements };
}

afterEach(() => {
  delete globalThis.__longshotHide;
  delete globalThis.document;
  delete globalThis.innerWidth;
  delete globalThis.innerHeight;
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

  it("does not hide a full-height sidebar or a viewport backdrop", () => {
    const side = fakeEl({ position: "fixed", rect: { top: 0, left: 0, height: 800, width: 240 } });
    const backdrop = fakeEl({ position: "fixed", rect: { top: 0, left: 0, width: vw, height: 800 } });
    installDoc([side, backdrop]);
    assert.equal(side.style.getPropertyValue("visibility"), "");
    assert.equal(backdrop.style.getPropertyValue("visibility"), "");
  });

  it("hides a footer pinned to the capture crop and reveals it for the last tile", () => {
    const footer = fakeEl({
      position: "sticky",
      rect: { top: 600, left: 100, width: 600, height: 56, bottom: 656 },
    });
    installDoc([footer]);
    globalThis.__longshotHide.hide({ top: false, bottom: true });
    assert.equal(footer.style.getPropertyValue("visibility"), "");
    globalThis.__longshotHide.hide({
      top: false,
      bottom: true,
      anchor: { x: 80, y: 100, w: 680, h: 560 },
    });
    assert.equal(footer.style.getPropertyValue("visibility"), "hidden");
    globalThis.__longshotHide.hide({
      top: true,
      bottom: false,
      anchor: { x: 80, y: 100, w: 680, h: 560 },
    });
    assert.equal(footer.style.getPropertyValue("visibility"), "");
  });

  it("does not hide a modal shell when only pinned bars should hide", () => {
    const dialog = fakeEl({
      position: "fixed",
      rect: { top: 40, left: 40, width: 900, height: 500 },
    });
    installDoc([dialog]);
    assert.equal(dialog.style.getPropertyValue("visibility"), "hidden");
    globalThis.__longshotHide.hide({ top: true, bottom: true, barsOnly: true });
    assert.equal(dialog.style.getPropertyValue("visibility"), "");
  });

  it("keeps a bottom bar when the last tile asks to", () => {
    const footer = fakeEl({
      position: "fixed",
      rect: { top: 752, left: 0, height: 48, width: vw, bottom: 800 },
    });
    installDoc([footer]);
    assert.equal(footer.style.getPropertyValue("visibility"), "hidden");
    globalThis.__longshotHide.reset();
    globalThis.__longshotHide.hide({ top: true, bottom: false });
    assert.equal(footer.style.getPropertyValue("visibility"), "");
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

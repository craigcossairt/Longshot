import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { it } from "node:test";
import { launchExtension } from "./harness.mjs";

async function seed(ext) {
  const page = await ext.context.newPage();
  await page.goto(ext.extUrl("options.html"));
  const id = await page.evaluate(async () => {
    const c = document.createElement("canvas"); c.width = 360; c.height = 260;
    const ctx = c.getContext("2d"); ctx.fillStyle = "white"; ctx.fillRect(0, 0, 360, 260);
    return (await (await import("./history.js")).longshotPushHistory({id: crypto.randomUUID(),
      title: "Editor recovery", width: 360, height: 260, format: "png", dataUrl: c.toDataURL(), createdAt: Date.now()})).id;
  });
  await page.goto(ext.extUrl(`editor.html?id=${id}`));
  await page.waitForFunction(() => document.getElementById("saveStatus").textContent === "Saved on this device");
  return {page, id};
}

async function drag(page, from, to) {
  const box = await page.locator("#canvas").boundingBox();
  const size = await page.locator("#canvas").evaluate((c) => ({w: c.width, h: c.height}));
  await page.mouse.move(box.x + from[0] * box.width / size.w, box.y + from[1] * box.height / size.h);
  await page.mouse.down();
  await page.mouse.move(box.x + to[0] * box.width / size.w, box.y + to[1] * box.height / size.h, {steps: 4});
  await page.mouse.up();
}

async function saved(page, id, revision = 2) {
  const deadline = Date.now() + 20000;
  while (Date.now() < deadline) {
    const item = await page.evaluate(async (id) => {
      if (document.getElementById("saveStatus").textContent !== "Saved on this device") return null;
      return (await import("./history.js")).longshotHistoryGet(id);
    }, id);
    if (item?.revision >= revision) return item;
    await new Promise((r) => setTimeout(r, 50));
  }
  throw new Error("Save did not complete: " + await page.locator("#saveStatus").textContent());
}

it("retries an unchanged document after a temporary save failure and still rejects deletion", {timeout: 180000}, async () => {
  const ext = await launchExtension();
  try {
    const {page, id} = await seed(ext);
    await page.evaluate(() => {
      const original = IDBDatabase.prototype.transaction;
      let fail = true;
      IDBDatabase.prototype.transaction = function(stores, mode, ...rest) {
        if (fail && this.name === "longshot-history" && mode === "readwrite") {
          fail = false;
          throw new Error("Temporary storage failure");
        }
        return original.call(this, stores, mode, ...rest);
      };
    });
    await page.locator('[data-tool="rect"]').click();
    await drag(page, [40, 40], [130, 100]);
    await page.waitForFunction(() => document.getElementById("saveStatus").textContent.includes("Temporary storage failure"));
    assert.equal(await page.locator("#retrySave").isVisible(), true);
    await mkdir(resolve("screenshots"), {recursive: true});
    await page.screenshot({path: resolve("screenshots/editor-retry-desktop.png")});
    await page.setViewportSize({width: 390, height: 844});
    await page.screenshot({path: resolve("screenshots/editor-retry-mobile.png")});
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await page.locator("#retrySave").click();
    const item = await saved(page, id);
    assert.equal(item.document.annotations.length, 1);
    assert.equal(await page.locator("#retrySave").isVisible(), false);
    await page.evaluate(async (id) => (await import("./history.js")).longshotHistoryDelete([id]), id);
    await page.locator("#clearAnns").click();
    await page.waitForFunction(() => document.getElementById("saveStatus").textContent.includes("deleted"));
    await page.locator("#retrySave").click();
    await page.waitForFunction(() => document.getElementById("saveStatus").textContent.includes("deleted"));
    assert.equal(await page.evaluate(async (id) => (await import("./history.js")).longshotHistoryGet(id), id), null);
  } finally { await ext.context.close(); }
});

it("recovers save, export and navigation after a failed crop image load and Undo", {timeout: 180000}, async () => {
  const ext = await launchExtension();
  try {
    const {page, id} = await seed(ext);
    const errors = []; page.on("pageerror", (error) => errors.push(error.message));
    await page.evaluate(() => {
      const original = HTMLCanvasElement.prototype.toDataURL;
      HTMLCanvasElement.prototype.toDataURL = function(...args) {
        HTMLCanvasElement.prototype.toDataURL = original;
        return "data:image/png;base64,broken";
      };
      window.exported = 0;
      chrome.downloads.download = async ({url}) => {
        const blob = await (await fetch(url)).blob();
        if (blob.size) window.exported++;
        return window.exported;
      };
    });
    await page.locator('[data-tool="crop"]').click();
    await drag(page, [20, 20], [220, 160]);
    await page.locator("#applyCrop").click();
    await page.waitForFunction(() => document.getElementById("saveStatus").textContent.includes("Could not load the edited image"));
    await page.locator("#undo").click();
    const item = await saved(page, id);
    assert.deepEqual([item.width, item.height], [360, 260]);
    await page.locator("#download").click();
    await page.waitForFunction(() => window.exported === 1);
    await page.locator('a[href="files.html"]').click();
    await page.waitForURL(/files\.html$/);
    assert.deepEqual(errors, []);
  } finally { await ext.context.close(); }
});

it("tracks edits without serializing annotations during each drag paint", {timeout: 180000}, async () => {
  const ext = await launchExtension();
  try {
    const {page, id} = await seed(ext);
    await page.locator('[data-tool="rect"]').click();
    await drag(page, [40, 40], [130, 100]);
    const original = await saved(page, id);
    await page.locator('[data-tool="select"]').click();
    const box = await page.locator("#canvas").boundingBox();
    await page.mouse.move(box.x + 70, box.y + 70);
    await page.mouse.down();
    const calls = await page.evaluate(() => {
      const c = document.getElementById("canvas");
      const box = c.getBoundingClientRect();
      const stringify = JSON.stringify;
      let calls = 0;
      JSON.stringify = (...args) => { calls++; return stringify(...args); };
      try {
        for (let i = 1; i <= 20; i++) c.dispatchEvent(new PointerEvent("pointermove", {
          clientX: box.left + 70 + i, clientY: box.top + 70 + i, buttons: 1, pointerId: 1,
        }));
      } finally { JSON.stringify = stringify; }
      return calls;
    });
    await page.mouse.up();
    assert.ok(calls <= 1, `only the undo snapshot may serialize; got ${calls}`);
    const moved = await saved(page, id, original.revision + 1);
    assert.ok(moved.document.annotations[0].x > original.document.annotations[0].x);
    await page.locator("#undo").click();
    const undone = await saved(page, id, moved.revision + 1);
    assert.equal(undone.document.annotations[0].x, original.document.annotations[0].x);
    await page.locator("#redo").click();
    const redone = await saved(page, id, undone.revision + 1);
    assert.equal(redone.document.annotations[0].x, moved.document.annotations[0].x);
    await page.locator("#canvas").click({position: {x: 100, y: 100}});
    await page.locator(".swatches i").nth(1).click();
    const colored = await saved(page, id, redone.revision + 1);
    assert.equal(colored.document.annotations[0].color, "#e08a3c");
    await page.locator("#deleteAnn").click();
    const deleted = await saved(page, id, colored.revision + 1);
    assert.equal(deleted.document.annotations.length, 0);
    await page.locator('[data-tool="pen"]').click();
    await drag(page, [30, 30], [100, 90]);
    const pen = await saved(page, id, deleted.revision + 1);
    assert.equal(pen.document.annotations[0].type, "pen");
    assert.ok(pen.document.annotations[0].pts.length > 1);
    await page.locator("#clearAnns").click();
    const cleared = await saved(page, id, pen.revision + 1);
    assert.equal(cleared.document.annotations.length, 0);
  } finally { await ext.context.close(); }
});

it("returns lightweight history summaries with legacy thumbnail and byte-size fallbacks", {timeout: 180000}, async () => {
  const ext = await launchExtension();
  try {
    const {page, id} = await seed(ext);
    const summary = await page.evaluate(async (id) => {
      const h = await import("./history.js");
      const full = await h.longshotHistoryGet(id);
      await new Promise((resolve, reject) => {
        const req = indexedDB.open("longshot-history", 2);
        req.onsuccess = () => {
          const db = req.result;
          const tx = db.transaction("captures", "readwrite");
          const {thumbUrl, byteSize, ...legacy} = full;
          tx.objectStore("captures").put({...legacy, document: {annotations: [{type: "text", text: "large document"}]}});
          tx.oncomplete = () => {db.close(); resolve();};
          tx.onabort = () => {db.close(); reject(tx.error);};
        };
        req.onerror = () => reject(req.error);
      });
      return {item: (await h.longshotHistoryList())[0], dataUrl: full.dataUrl, size: h.longshotByteSize(full.dataUrl)};
    }, id);
    assert.equal("dataUrl" in summary.item, false);
    assert.equal("document" in summary.item, false);
    assert.equal(summary.item.thumbUrl, summary.dataUrl);
    assert.equal(summary.item.byteSize, summary.size);
    await page.goto(ext.extUrl("files.html"));
    await page.waitForFunction(() => document.querySelector("#rows img")?.naturalWidth > 0);
    assert.equal(await page.locator("#rows img").getAttribute("src"), summary.dataUrl);
  } finally { await ext.context.close(); }
});

it("reuses decoded tall-image snapshots safely and measures repeated full saves", {timeout: 180000}, async (t) => {
  const ext = await launchExtension();
  try {
    const page = await ext.context.newPage();
    await page.goto(ext.extUrl("options.html"));
    const result = await page.evaluate(async () => {
      const renderer = await import("./editor-document.js");
      const h = await import("./history.js");
      const c = document.createElement("canvas"); c.width = 800; c.height = 12001;
      const ctx = c.getContext("2d"); ctx.fillStyle = "white"; ctx.fillRect(0, 0, c.width, c.height);
      ctx.fillStyle = "#3456ab"; ctx.fillRect(0, 11900, c.width, 101);
      const baseDataUrl = c.toDataURL();
      const baseImage = await renderer.loadImage(baseDataUrl);
      c.width = c.height = 0;
      let item = await h.longshotPushHistory({id: crypto.randomUUID(), title: "Tall edit", width: 800, height: 12001,
        format: "png", dataUrl: baseDataUrl, createdAt: Date.now()});
      const results = [];
      let firstOutput;
      for (const reuse of [false, true]) {
        const samples = [];
        const heapStart = performance.memory?.usedJSHeapSize ?? null;
        for (let i = 0; i < 3; i++) {
          const start = performance.now();
          const doc = {version: 1, baseDataUrl, width: 800, height: 12001,
            annotations: [{type: "text", x: 30, y: 80, text: `Edit ${i}`, color: "#111111", fontSize: 24}]};
          const blob = await renderer.documentBlob(doc, "image/png", 0.92, reuse ? {baseImage} : undefined);
          const dataUrl = await renderer.blobDataUrl(blob);
          if (!reuse && i === 0) firstOutput = dataUrl;
          if (reuse && i === 0 && dataUrl !== firstOutput) throw new Error("Reused image changed output pixels");
          item = await h.longshotHistoryUpdate({...item, document: doc, dataUrl});
          samples.push(Math.round(performance.now() - start));
        }
        results.push({reuse, elapsedMs: samples, heapStart, heapEnd: performance.memory?.usedJSHeapSize ?? null});
      }
      const other = document.createElement("canvas"); other.width = other.height = 2;
      const wrongBase = await renderer.loadImage(other.toDataURL());
      const doc = {version: 1, baseDataUrl, width: 800, height: 12001, annotations: []};
      const fallback = await renderer.documentBlob(doc, "image/png", 0.92, {baseImage: wrongBase});
      const expected = await renderer.documentBlob(doc, "image/png", 0.92, {baseImage});
      return {results, fallbackMatches: await renderer.blobDataUrl(fallback) === await renderer.blobDataUrl(expected),
        pixels: 800 * 12001, retainedBackingBytesPerCanvas: 800 * 12001 * 4};
    });
    assert.equal(result.fallbackMatches, true);
    t.diagnostic(JSON.stringify(result));
  } finally { await ext.context.close(); }
});

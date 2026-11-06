import assert from "node:assert/strict";
import { it } from "node:test";
import { launchExtension } from "./harness.mjs";

it("migrates legacy capture bytes atomically and isolates concurrent edits and deletes", { timeout: 300000 }, async () => {
  const ext = await launchExtension();
  try {
    const page = await ext.context.newPage();
    await page.goto(ext.extUrl("options.html"));
    const result = await page.evaluate(async () => {
      const c = document.createElement("canvas"); c.width = c.height = 12;
      c.getContext("2d").fillRect(0, 0, 12, 12);
      const dataUrl = c.toDataURL();
      const original = { id: "legacy", dataUrl, title: "Kept", format: "png", width: 12, height: 12, createdAt: 10 };
      await new Promise((resolve, reject) => {
        const req = indexedDB.open("longshot-history", 1);
        req.onupgradeneeded = () => req.result.createObjectStore("items");
        req.onsuccess = () => {
          const tx = req.result.transaction("items", "readwrite");
          tx.objectStore("items").put([original], "list");
          tx.oncomplete = () => { req.result.close(); resolve(); };
          tx.onabort = () => reject(tx.error);
        };
        req.onerror = () => reject(req.error);
      });
      const h = await import("./history.js");
      const migrated = await h.longshotHistoryGet("legacy");
      const captures = await Promise.all(Array.from({ length: 8 }, (_, n) => h.longshotPushHistory({ ...original, id: `new-${n}` })));
      const count = (await h.longshotHistoryGetAll()).length;
      const doc = { version: 1, baseDataUrl: dataUrl, width: 12, height: 12, annotations: [{ id: "text", type: "text", text: "Saved" }] };
      const winner = await h.longshotHistoryUpdate({ ...captures[0], document: doc });
      const stale = await h.longshotHistoryUpdate({ ...captures[0], title: "stale" }).then(() => false, (e) => /another tab/.test(e.message));
      const preserved = await h.longshotHistoryGet(captures[0].id);
      // Thumbnail generation yields before the transaction: deletion must still win.
      const pending = h.longshotHistoryUpdate({ ...winner, title: "late write" }).then(() => true, () => false);
      await h.longshotHistoryDelete([winner.id]);
      await pending;
      const resurrected = await h.longshotPushHistory(winner).then(() => true, () => false);
      const deleted = await h.longshotHistoryGet(winner.id);
      return { migrated, original, count, stale, preserved, resurrected, deleted };
    });
    assert.equal(result.migrated.dataUrl, result.original.dataUrl);
    assert.equal(result.migrated.revision, 1);
    assert.equal(result.count, 9);
    assert.equal(result.stale, true);
    assert.equal(result.preserved.document.annotations[0].text, "Saved");
    assert.equal(result.preserved.revision, 2);
    assert.equal(result.deleted, null);
    assert.equal(result.resurrected, false);
  } finally { await ext.context.close(); }
});

it("refreshes thumbnails and bounds retention without deleting concurrent new captures", { timeout: 300000 }, async () => {
  const ext = await launchExtension();
  try {
    const page = await ext.context.newPage();
    await page.goto(ext.extUrl("options.html"));
    const result = await page.evaluate(async () => {
      const h = await import("./history.js");
      const c = document.createElement("canvas"); c.width = c.height = 10;
      const ctx = c.getContext("2d"); ctx.fillStyle = "red"; ctx.fillRect(0, 0, 10, 10);
      const record = { dataUrl: c.toDataURL(), format: "png", width: 10, height: 10, createdAt: Date.now() };
      const inserted = await h.longshotPushHistory({ ...record, id: "color" });
      ctx.fillStyle = "blue"; ctx.fillRect(0, 0, 10, 10);
      const changed = await h.longshotHistoryUpdate({ ...inserted, dataUrl: c.toDataURL() });
      await Promise.all(Array.from({ length: 55 }, (_, i) => h.longshotPushHistory({ ...record, id: `limit-${i}` })));
      return { changed: inserted.thumbUrl !== changed.thumbUrl, count: (await h.longshotHistoryGetAll()).length };
    });
    assert.equal(result.changed, true);
    assert.equal(result.count, 50);
  } finally { await ext.context.close(); }
});

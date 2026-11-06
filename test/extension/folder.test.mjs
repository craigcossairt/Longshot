import assert from "node:assert/strict";
import { it } from "node:test";
import { launchExtension } from "./harness.mjs";

it("custom folders preserve existing files and serialize concurrent exports", { timeout: 60000 }, async () => {
  const ext = await launchExtension();
  try {
    const page = await ext.context.newPage();
    await page.goto(ext.extUrl("options.html"));
    const result = await page.evaluate(async () => {
      const { longshotWriteToDir } = await import("./folder.js");
      const root = await navigator.storage.getDirectory();
      const dir = await root.getDirectoryHandle("collision-test", { create: true });
      // OPFS is already granted; wrap only the permission query that external
      // directory handles expose. File operations use the real browser API.
      const handle = { queryPermission: async () => "granted", getFileHandle: (...args) => dir.getFileHandle(...args) };
      await longshotWriteToDir(handle, "capture.png", new Blob(["original"]));
      const names = await Promise.all(["second", "third", "fourth"].map((text) =>
        longshotWriteToDir(handle, "Longshot/capture.png", new Blob([text]))));
      const contents = {};
      for await (const [name, file] of dir.entries()) contents[name] = await (await file.getFile()).text();
      await dir.getDirectoryHandle("occupied.png", { create: true });
      const directoryCollision = await longshotWriteToDir(handle, "occupied.png", new Blob(["safe"]));
      return { names, contents, directoryCollision };
    });
    assert.deepEqual(result.names, ["capture (1).png", "capture (2).png", "capture (3).png"]);
    assert.deepEqual(result.contents, { "capture.png": "original", "capture (1).png": "second", "capture (2).png": "third", "capture (3).png": "fourth" });
    assert.equal(result.directoryCollision, "occupied (1).png");
  } finally {
    await ext.context.close();
  }
});

import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { it } from "node:test";
import { launchExtension } from "./harness.mjs";

async function seed(ext, format = "png") {
  const page = await ext.context.newPage();
  await page.goto(ext.extUrl("options.html"));
  const id = await page.evaluate(async (format) => {
    const h = await import("./history.js");
    const c = document.createElement("canvas"); c.width = 360; c.height = 260;
    const ctx = c.getContext("2d"); ctx.fillStyle = "white"; ctx.fillRect(0, 0, 360, 260);
    const item = await h.longshotPushHistory({ id: crypto.randomUUID(), title: "Review capture", url: "https://example.test/",
      width: 360, height: 260, dataUrl: c.toDataURL(format === "jpeg" ? "image/jpeg" : "image/png"), format, createdAt: Date.now() });
    return item.id;
  }, format);
  await page.goto(ext.extUrl(`editor.html?id=${id}`));
  await page.waitForFunction(() => document.getElementById("saveStatus").textContent === "Saved on this device");
  return { page, id };
}

async function drag(page, from, to) {
  const box = await page.locator("#canvas").boundingBox();
  const size = await page.locator("#canvas").evaluate((c) => ({ w: c.width, h: c.height }));
  await page.mouse.move(box.x + from[0] * box.width / size.w, box.y + from[1] * box.height / size.h);
  await page.mouse.down();
  await page.mouse.move(box.x + to[0] * box.width / size.w, box.y + to[1] * box.height / size.h, { steps: 5 });
  await page.mouse.up();
}

async function saved(page, id, predicate) {
  const deadline = Date.now() + 15000;
  while (Date.now() < deadline) {
    const ready = await page.evaluate(async ({ id, predicate }) => {
      const item = await (await import("./history.js")).longshotHistoryGet(id);
      return document.getElementById("saveStatus").textContent === "Saved on this device" &&
        (predicate === "annotated" ? item.document?.annotations.length > 0 :
          predicate === "cropped" ? item.width === 200 : item.width === 360);
    }, { id, predicate });
    if (ready) return;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error("Capture did not reach saved state: " + predicate + "; " + await page.locator("#saveStatus").textContent());
}

async function interceptExports(page) {
  await page.evaluate(() => {
    window.exported = [];
    chrome.downloads.download = async ({ url, filename }) => {
      const blob = await (await fetch(url)).blob();
      const dataUrl = await (await import("./editor-document.js")).blobDataUrl(blob);
      window.exported.push({ dataUrl, filename, type: blob.type });
      return window.exported.length;
    };
  });
}

it("exports clean pixels with selected annotations and an unapplied crop", { timeout: 300000 }, async () => {
  const ext = await launchExtension();
  try {
    const { page, id } = await seed(ext);
    const errors = []; page.on("pageerror", (e) => errors.push(e.message));
    await page.locator('[data-tool="rect"]').click();
    await drag(page, [40, 40], [130, 100]);
    await saved(page, id, "annotated");
    await page.locator('[data-tool="select"]').click();
    await page.locator("#canvas").click({ position: { x: 70, y: 70 } });
    await interceptExports(page);
    await page.locator("#download").click();
    await page.waitForFunction(() => window.exported.length === 1);
    const selected = await page.evaluate(async (id) => {
      const item = await (await import("./history.js")).longshotHistoryGet(id);
      return { actual: window.exported[0].dataUrl, expected: item.dataUrl };
    }, id);
    assert.equal(selected.actual, selected.expected, "selection handles never enter export pixels");
    await page.locator('[data-tool="crop"]').click();
    await drag(page, [200, 150], [300, 230]);
    await page.locator("#download").click();
    await page.waitForFunction(() => window.exported.length === 2);
    assert.equal(await page.evaluate(() => window.exported[1].dataUrl), selected.expected, "pending crop mask is not exported");
    await mkdir(resolve("screenshots"), { recursive: true });
    await page.screenshot({ path: resolve("screenshots/editor-crop-review.png") });
    assert.deepEqual(errors, []);
  } finally { await ext.context.close(); }
});

it("persists annotations and crop undo/redo, reopens editable content, and exports Files with matching MIME", { timeout: 300000 }, async () => {
  const ext = await launchExtension();
  try {
    const { page, id } = await seed(ext, "jpeg");
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("dialog", async (dialog) => { errors.push(dialog.message()); await dialog.dismiss(); });
    await page.locator('[data-tool="text"]').click();
    await page.locator("#canvas").click({ position: { x: 45, y: 65 } });
    await page.locator("#textEdit").fill("First line\nSecond line");
    await page.locator('[data-tool="crop"]').click();
    await saved(page, id, "annotated");
    const beforeCrop = await page.evaluate(async (id) => (await import("./history.js")).longshotHistoryGet(id), id);
    await drag(page, [20, 20], [220, 160]);
    await page.locator("#applyCrop").click();
    await saved(page, id, "cropped");
    await page.locator("#undo").click();
    await saved(page, id, "original");
    await page.locator("#redo").click();
    await saved(page, id, "cropped");
    await page.reload();
    await saved(page, id, "cropped");
    const item = await page.evaluate(async (id) => (await import("./history.js")).longshotHistoryGet(id), id);
    assert.equal(item.document.annotations[0].text, "First line\nSecond line");
    assert.equal(item.document.annotations[0].x, beforeCrop.document.annotations[0].x - 20);
    assert.match(item.dataUrl, /^data:image\/jpeg/);
    assert.equal(item.format, "jpeg");
    await mkdir(resolve("screenshots"), { recursive: true });
    await page.screenshot({ path: resolve("screenshots/editor-saved-review.png") });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: resolve("screenshots/editor-mobile-review.png") });
    await page.locator('a[href="files.html"]').click();
    await page.waitForURL(/files\.html$/);
    await interceptExports(page);
    await page.locator('#rows input[type="checkbox"]').check();
    await page.locator("#downloadBtn").click();
    await page.waitForFunction(() => window.exported.length === 1);
    const exported = await page.evaluate(() => window.exported[0]);
    assert.match(exported.filename, /\.jpg$/);
    assert.equal(exported.type, "image/jpeg");
    assert.equal(exported.dataUrl, item.dataUrl, "Files includes the saved annotations");
    assert.deepEqual(errors, []);
  } finally { await ext.context.close(); }
});

it("retains a failed feedback draft and reports stale editor saves without resurrecting deleted captures", { timeout: 300000 }, async () => {
  const ext = await launchExtension();
  try {
    const { page, id } = await seed(ext);
    await page.route("**/api/feedback", (route) => route.fulfill({ status: 503, contentType: "application/json", body: '{"delivered":false}' }));
    await page.locator("#feedback").click();
    await page.locator("#feedbackBody").fill("Please keep this draft");
    await page.locator("#feedbackSubmit").click();
    await page.waitForFunction(() => document.getElementById("feedbackStatus").textContent.includes("Could not send"));
    assert.equal(await page.locator("#feedbackBody").inputValue(), "Please keep this draft");
    assert.equal(await page.locator("#feedbackPanel").isVisible(), true);
    await page.locator("#feedbackCancel").click();
    await page.evaluate(async (id) => (await import("./history.js")).longshotHistoryDelete([id]), id);
    await page.locator('[data-tool="rect"]').click();
    await drag(page, [40, 40], [130, 100]);
    await page.waitForFunction(() => document.getElementById("saveStatus").textContent.includes("deleted"));
    const item = await page.evaluate(async (id) => (await import("./history.js")).longshotHistoryGet(id), id);
    assert.equal(item, null);
  } finally { await ext.context.close(); }
});

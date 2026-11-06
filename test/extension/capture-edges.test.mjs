import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { bindOverflowCapture, OVERFLOW_POLICY } from "../../extension/core/overflow.js";
import { installHideSession, HIDE_POLICY } from "../../extension/core/suppress.js";
import { currentCapture, launchExtension, openPopup, requestCapture, samplePixels, serveFixtures } from "./harness.mjs";

let server;
before(async () => { server = await serveFixtures(); });
after(() => server?.close());

async function withPage(fixture, fn) {
  const ext = await launchExtension();
  try {
    const page = await ext.context.newPage();
    await page.goto(server.url(fixture));
    await fn(ext, page);
  } finally { await ext.context.close(); }
}

describe("capture boundary and modal classification", { timeout: 180000 }, () => {
  for (const axis of ["x", "y"]) {
    it(`includes a fifteen-pixel modal overflow on the ${axis} axis`, async () => {
      await withPage(`modal-small-overflow.html?axis=${axis}`, async (ext, page) => {
        const popup = await openPopup(ext);
        assert.deepEqual(await requestCapture(popup), {ok:true});
        const record = await currentCapture(ext.worker);
        assert.deepEqual([record.width,record.height], axis === "x" ? [815,600] : [800,615]);
        const end = await page.evaluate(async ({dataUrl, axis}) => {
          const bmp = await createImageBitmap(await (await fetch(dataUrl)).blob());
          const ctx = new OffscreenCanvas(bmp.width,bmp.height).getContext("2d");
          ctx.drawImage(bmp,0,0);
          return [...ctx.getImageData(axis === "x" ? 514 : 499, axis === "x" ? 379 : 394,1,1).data];
        }, {dataUrl:record.dataUrl,axis});
        assert.deepEqual(end,[47,111,79,255]);
      });
    });
  }

  it("retains the complete header and footer across modal tile columns", async () => {
    await withPage("modal-grid-bars.html", async (ext,page) => {
      const popup = await openPopup(ext);
      assert.deepEqual(await requestCapture(popup), {ok:true});
      const record = await currentCapture(ext.worker);
      assert.deepEqual([record.width,record.height],[1200,1000]);
      const bars = await page.evaluate(async (dataUrl) => {
        const bmp = await createImageBitmap(await (await fetch(dataUrl)).blob());
        const ctx = new OffscreenCanvas(bmp.width,bmp.height).getContext("2d");
        ctx.drawImage(bmp,0,0);
        return [110,490,510,890].flatMap((x) => [90,770].map((y) => [...ctx.getImageData(x,y,1,1).data]));
      },record.dataUrl);
      assert.deepEqual(bars,Array.from({length:4},() => [[210,75,64,255],[52,86,171,255]]).flat());
    });
  });

  it("retains every pixel of absolute page content spanning a tile boundary", async () => {
    await withPage("capture-absolute-boundary.html", async (ext, page) => {
      const popup = await openPopup(ext);
      assert.deepEqual(await requestCapture(popup), { ok: true });
      const record = await currentCapture(ext.worker);
      assert.equal(record.height, 1800);
      const pixels = await samplePixels(page, record.dataUrl, [549, 550, 599, 600, 649, 650, 1799]);
      assert.deepEqual(pixels, [
        [255,255,255,255], [220,170,30,255], [220,170,30,255], [220,170,30,255],
        [220,170,30,255], [255,255,255,255], [47,111,79,255],
      ]);
    });
  });

  for (const fallback of [false, true]) {
    it(`distinguishes a pinned absolute dialog footer from scrolling content (${fallback ? "content fallback" : "shared installer"})`, async () => {
      await withPage("capture-absolute-boundary.html", async (ext, page) => {
        await page.evaluate(() => {
          const shell = document.createElement("div");
          shell.style.cssText = "position:fixed;left:80px;top:50px;width:600px;height:500px;background:white;";
          shell.innerHTML = '<div style="position:relative;overflow:auto;width:600px;height:500px"><div style="height:1000px"></div><div id="scrolled" style="position:absolute;top:450px;width:600px;height:100px;background:green"></div></div><div id="footer" style="position:absolute;bottom:0;width:600px;height:64px;background:blue"></div>';
          document.body.append(shell);
        });
        const opts = { top: false, bottom: true, barsOnly: true, anchor: { x: 80, y: 50, w: 600, h: 500 } };
        if (fallback) {
          await ext.worker.evaluate(async ({ url, opts }) => {
            const tab = (await chrome.tabs.query({})).find((tab) => tab.url === url);
            await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ["content.js"] });
            await chrome.tabs.sendMessage(tab.id, { type: "LONGSHOT_HIDE_CHROME", ...opts });
          }, { url: page.url(), opts });
        } else {
          await page.evaluate(installHideSession, HIDE_POLICY);
          await page.evaluate((opts) => globalThis.__longshotHide.hide(opts), opts);
        }
        const visibility = await page.evaluate(() => ["content", "scrolled", "footer"].map((id) => getComputedStyle(document.getElementById(id)).visibility));
        assert.deepEqual(visibility, ["visible", "visible", "hidden"]);
      });
    });
  }

  it("captures the long page behind a non-modal cookie dialog", async () => {
    await withPage("capture-cookie-dialog.html", async (ext, page) => {
      const popup = await openPopup(ext);
      assert.deepEqual(await requestCapture(popup), { ok: true });
      const record = await currentCapture(ext.worker);
      assert.equal(record.height, 1800);
      assert.deepEqual(await samplePixels(page, record.dataUrl, [1799]), [[47,111,79,255]]);
    });
  });

  it("distinguishes a modeless native dialog from showModal and explicit aria-modal", async () => {
    await withPage("capture-cookie-dialog.html", async (ext, page) => {
      await page.evaluate(() => {
        document.querySelector("#cookie").remove();
        const dialog = document.createElement("dialog");
        dialog.id = "native";
        dialog.textContent = "Dialog";
        document.body.append(dialog);
        dialog.show();
      });
      await page.evaluate(bindOverflowCapture, OVERFLOW_POLICY);
      assert.equal(await page.evaluate(() => globalThis.__longshotOverflow.find()), null);
      await page.evaluate(() => { const d = document.querySelector("#native"); d.close(); d.showModal(); });
      assert.deepEqual(await page.evaluate(() => globalThis.__longshotOverflow.find()), { kind: "modal", fits: true });
      await page.evaluate(() => { const d = document.querySelector("#native"); d.close(); d.show(); d.setAttribute("aria-modal", "true"); });
      assert.deepEqual(await page.evaluate(() => globalThis.__longshotOverflow.find()), { kind: "modal", fits: true });
    });
  });
});

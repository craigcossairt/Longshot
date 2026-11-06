import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { currentCapture, launchExtension, openPopup, requestCapture, samplePixels, serveFixtures, setSettings } from "./harness.mjs";
let server;
before(async () => { server = await serveFixtures(); });
after(() => server?.close());
async function withCapture(fixture, fn) {
  const ext = await launchExtension();
  try {
    const page = await ext.context.newPage();
    await page.goto(server.url(fixture));
    const popup = await openPopup(ext);
    await fn(ext, page, popup);
  } finally { await ext.context.close(); }
}
describe("capture safety and output correctness", { timeout: 180000 }, () => {
  for (const change of ["switch", "navigate", "switch-back"]) {
    it(`discards a capture if the tab changes during the screenshot (${change})`, async () => {
      await withCapture("capture-near-footer.html", async (ext, page, popup) => {
        await ext.worker.evaluate(({ change, url }) => {
          const original = chrome.tabs.captureVisibleTab.bind(chrome.tabs);
          let changed = false;
          chrome.tabs.captureVisibleTab = async (windowId, options) => {
            const data = await original(windowId, options);
            if (!changed) {
              changed = true;
              const [tab] = await chrome.tabs.query({active: true, windowId});
              if (change === "navigate") await chrome.tabs.update(tab.id, {url});
              else {
                await chrome.tabs.create({windowId, url, active: true});
                if (change === "switch-back") await chrome.tabs.update(tab.id, {active: true});
              }
            }
            return data;
          };
        }, {change, url: server.url("capture-backgrounds.html")});
        const result = await requestCapture(popup, "full");
        assert.equal(result.ok, false);
        assert.match(result.error, /cancelled.*changed/i);
        assert.equal(await currentCapture(ext.worker), null, "interrupted capture is never saved");
        if (change !== "navigate") assert.equal(await page.locator("#longshot-capture-style").count(), 0);
      });
    });
  }
  it("does not resume scrolling after an interrupted frame wait", async () => {
    await withCapture("capture-backgrounds.html", async (ext, page, popup) => {
      await page.evaluate(() => scrollTo(0, 250));
      await ext.worker.evaluate(async () => {
        const [tab] = await chrome.tabs.query({active:true,currentWindow:true});
        await chrome.scripting.executeScript({target:{tabId:tab.id}, func: () => {
          const original = requestAnimationFrame;
          globalThis.requestAnimationFrame = (callback) => setTimeout(() => original(callback), 150);
        }});
      });
      const pending = requestCapture(popup);
      await page.waitForFunction(() => scrollY === 0);
      await ext.worker.evaluate((url) => chrome.tabs.create({url, active:true}), server.url("capture-near-footer.html"));
      assert.equal((await pending).ok, false);
      await page.bringToFront();
      await page.waitForTimeout(1400);
      assert.equal(await page.evaluate(() => scrollY), 250, "cancelled scroll must not resume after reset");
      assert.equal(await currentCapture(ext.worker), null);
    });
  });
  it("removes an unfinished region overlay when switching tabs", async () => {
    await withCapture("capture-near-footer.html", async (ext, page, popup) => {
      const pending = requestCapture(popup, "region");
      await page.locator("#longshot-region-root").waitFor({state:"attached"});
      await ext.worker.evaluate((url) => chrome.tabs.create({url, active:true}), server.url("capture-backgrounds.html"));
      const result = await pending;
      assert.equal(result.ok, false);
      assert.match(result.error, /cancelled.*changed/i);
      assert.equal(await page.locator("#longshot-region-root").count(), 0);
      assert.equal(await currentCapture(ext.worker), null);
    });
  });
  it("captures past decorative and hidden full-screen elements", async () => {
    await withCapture("capture-backgrounds.html", async (ext, page, popup) => {
      assert.deepEqual(await requestCapture(popup), {ok: true});
      const record = await currentCapture(ext.worker);
      assert.equal(record.height, 1800);
      const [last] = await samplePixels(page, record.dataUrl, [-2]);
      assert.ok(last[2] > 240 && last[0] < 10, `last pixel ${last}`);
    });
  });
  it("keeps header and full footer when the document exceeds the viewport by one pixel", async () => {
    await withCapture("capture-near-footer.html", async (ext, page, popup) => {
      assert.deepEqual(await requestCapture(popup), {ok: true});
      const record = await currentCapture(ext.worker);
      assert.equal(record.height, 601);
      const [header, content, footerTop, footerBottom] = await samplePixels(page, record.dataUrl, [1, 540, 541, 600]);
      assert.deepEqual(header, [210,0,0,255]);
      assert.deepEqual(content, [255,255,255,255]);
      assert.deepEqual(footerTop, [0,0,210,255]);
      assert.deepEqual(footerBottom, [0,0,210,255]);
    });
  });
  it("applies 50 percent scaling once to tiled captures", async () => {
    await withCapture("capture-backgrounds.html", async (ext, page, popup) => {
      await setSettings(ext.worker, {scalePercent: 50});
      assert.deepEqual(await requestCapture(popup), {ok: true});
      const record = await currentCapture(ext.worker);
      assert.deepEqual([record.width,record.height], [400,900]);
    });
  });
  it("applies 50 percent scaling once to an extended modal including its backdrop", async () => {
    await withCapture("modal.html", async (ext, page, popup) => {
      const expected = await page.evaluate(() => innerHeight + document.querySelector("#dialog").scrollHeight - document.querySelector("#dialog").clientHeight);
      await setSettings(ext.worker, {scalePercent: 50});
      assert.deepEqual(await requestCapture(popup), {ok: true});
      const record = await currentCapture(ext.worker);
      assert.deepEqual([record.width,record.height], [400,Math.round(expected / 2)]);
    });
  });
  it("saves the actual JPEG encoding that satisfies the byte budget", async () => {
    await withCapture("capture-near-footer.html", async (ext, page, popup) => {
      await page.evaluate(() => {
        document.body.innerHTML = '<canvas width="800" height="600"></canvas>';
        const ctx = document.querySelector("canvas").getContext("2d");
        const pixels = ctx.createImageData(800,600);
        let state = 42;
        for (let i=0;i<pixels.data.length;i+=4) {
          state = (Math.imul(state,1664525)+1013904223) >>> 0;
          pixels.data[i]=state & 255; pixels.data[i+1]=(state>>>8)&255; pixels.data[i+2]=(state>>>16)&255; pixels.data[i+3]=255;
        }
        ctx.putImageData(pixels,0,0);
      });
      await setSettings(ext.worker, {format:"jpeg",quality:0.95});
      assert.deepEqual(await requestCapture(popup,"visible"), {ok:true});
      const initial = await currentCapture(ext.worker);
      const budget = Math.floor(initial.byteSize * 0.7);
      await page.bringToFront();
      await setSettings(ext.worker, {maxFileMB: budget / (1024*1024)});
      assert.deepEqual(await requestCapture(popup,"visible"), {ok:true});
      const result = await currentCapture(ext.worker);
      assert.ok(result.byteSize <= budget, `${result.byteSize} > ${budget}`);
      assert.deepEqual([result.width,result.height],[800,600], "quality reduction needs no resizing");
      const actualBytes = await page.evaluate(async (data) => (await (await fetch(data)).blob()).size, result.dataUrl);
      assert.equal(result.byteSize, actualBytes);
    });
  });
});

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
  for (const browserBar of [false, true]) {
    for (const limit of ["percentage", "maxWidth"]) {
      it(`scales ${browserBar ? "browser" : "URL"} bar text and controls with ${limit}`, async () => {
        await withCapture("capture-backgrounds.html", async (ext, page, popup) => {
          await setSettings(ext.worker, {
            includeBrowserBar: browserBar, includeUrlBar: !browserBar,
            ...(limit === "percentage" ? {scalePercent: 50} : {maxWidth: 400}),
          });
          assert.deepEqual(await requestCapture(popup), {ok: true});
          const record = await currentCapture(ext.worker);
          assert.deepEqual([record.width, record.height], [400, 900 + (browserBar ? 43 : 18)]);
          const rendered = await page.evaluate(async ({dataUrl, browserBar}) => {
            const bmp = await createImageBitmap(await (await fetch(dataUrl)).blob());
            const canvas = new OffscreenCanvas(bmp.width, bmp.height);
            const ctx = canvas.getContext("2d");
            ctx.drawImage(bmp, 0, 0);
            const text = ctx.getImageData(10, browserBar ? 27 : 5, 300, 10).data;
            let dark = 0;
            for (let i = 0; i < text.length; i += 4) if (text[i] < 140 && text[i+1] < 140 && text[i+2] < 140) dark++;
            return {dark, control: [...ctx.getImageData(11, 10, 1, 1).data]};
          }, {dataUrl: record.dataUrl, browserBar});
          assert.ok(rendered.dark > 30, `URL text must be visible inside its scaled bar: ${rendered.dark} dark pixels`);
          if (browserBar) assert.deepEqual(rendered.control, [225, 90, 74, 255], "window control scales to half size");
        });
      });
    }
  }
  for (const tall of [false, true]) {
    it(`captures horizontal modal overflow${tall ? " on both axes at 50 percent" : " without vertical overflow"}`, async () => {
      await withCapture(`modal-horizontal.html${tall ? "?tall=1" : ""}`, async (ext, page, popup) => {
        const scale = tall ? 0.5 : 1;
        await setSettings(ext.worker, {scalePercent: scale * 100});
        assert.deepEqual(await requestCapture(popup), {ok: true});
        const record = await currentCapture(ext.worker);
        assert.deepEqual([record.width, record.height], [1200 * scale, (tall ? 1000 : 600) * scale]);
        const pixels = await page.evaluate(async ({dataUrl, scale, tall}) => {
          const bmp = await createImageBitmap(await (await fetch(dataUrl)).blob());
          const ctx = new OffscreenCanvas(bmp.width, bmp.height).getContext("2d");
          ctx.drawImage(bmp, 0, 0);
          return [[890, tall ? 770 : 370], [1190, 10], [10, tall ? 990 : 590], [1190, tall ? 990 : 590]]
            .map(([x, y]) => [...ctx.getImageData(x * scale, y * scale, 1, 1).data]);
        }, {dataUrl: record.dataUrl, scale, tall});
        assert.deepEqual(pixels, [[47,111,79,255], [155,35,202,255], [207,171,34,255], [32,48,64,255]]);
      });
    });
  }

  it("keeps capturing when an iframe navigates without changing the main document", async () => {
    await withCapture("capture-near-footer.html", async (ext, page, popup) => {
      await page.evaluate(() => new Promise((resolve) => {
        const frame = document.createElement("iframe");
        frame.id = "refreshing-frame";
        frame.style.display = "none";
        frame.onload = resolve;
        frame.src = "capture-backgrounds.html";
        document.body.append(frame);
      }));
      await ext.worker.evaluate(() => {
        globalThis.frameLoadingUpdates = 0;
        chrome.tabs.onUpdated.addListener((id, change) => {
          if (change.status === "loading") globalThis.frameLoadingUpdates++;
        });
        const original = chrome.tabs.captureVisibleTab.bind(chrome.tabs);
        let changed = false;
        chrome.tabs.captureVisibleTab = async (windowId, options) => {
          const data = await original(windowId, options);
          if (!changed) {
            changed = true;
            const [tab] = await chrome.tabs.query({active: true, windowId});
            await chrome.scripting.executeScript({target: {tabId: tab.id}, func: () => new Promise((resolve) => {
              const frame = document.querySelector("#refreshing-frame");
              frame.onload = resolve;
              frame.src = "capture-backgrounds.html?refresh=1";
            })});
          }
          return data;
        };
      });
      assert.deepEqual(await requestCapture(popup), {ok: true});
      assert.ok(await ext.worker.evaluate(() => globalThis.frameLoadingUpdates > 0), "iframe emits tab loading updates");
      assert.equal((await currentCapture(ext.worker)).height, 601);
    });
  });
  for (const change of ["switch", "navigate", "switch-back", "reload"]) {
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
              if (change === "reload") await chrome.tabs.reload(tab.id);
              else if (change === "navigate") await chrome.tabs.update(tab.id, {url});
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
        if (change !== "navigate" && change !== "reload") assert.equal(await page.locator("#longshot-capture-style").count(), 0);
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

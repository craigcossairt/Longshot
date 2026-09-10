#!/usr/bin/env node
import { createServer } from "node:http";
import { existsSync, readFileSync } from "node:fs";
import { extname, join, resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright";
import { capture } from "../cli/playwright-adapter.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const extPath = resolve(root, "extension");
const demo = resolve(root, "docs/demo-page.html");
const outPng = resolve(root, "docs/editor.png");
const capturePng = resolve(root, "artifacts/readme-subject.png");

const shot = await capture({
  url: pathToFileURL(demo).href,
  fullPage: false,
  engine: "tiled",
  overflow: false,
  device: "desktop",
  width: 1280,
  height: 800,
  scale: 1,
  format: "png",
  maxBytes: 0,
  out: capturePng,
  channel: "chrome",
  headed: false,
  selector: null,
  region: null,
  wait: 400,
  cdp: null,
  viewport: { width: 1280, height: 800, scale: 1 },
});

const dataUrl = `data:image/png;base64,${readFileSync(shot.path).toString("base64")}`;
const record = {
  id: "readme",
  title: "Q3 launch briefing",
  url: "https://example.local/briefing",
  dataUrl,
  width: shot.width,
  height: shot.height,
  format: "png",
  createdAt: Date.now(),
  byteSize: shot.bytes,
};

const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".json": "application/json",
};

const server = createServer((req, res) => {
  const rel = decodeURIComponent(new URL(req.url, "http://longshot.local").pathname).replace(/^\/+/, "") || "editor.html";
  const file = resolve(extPath, rel);
  if (!file.startsWith(extPath) || !existsSync(file)) {
    res.statusCode = 404;
    res.end("missing");
    return;
  }
  res.setHeader("content-type", mime[extname(file)] || "application/octet-stream");
  res.end(readFileSync(file));
});
await new Promise((resolveListen) => server.listen(0, "127.0.0.1", resolveListen));
const port = server.address().port;

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.addInitScript((next) => {
  const store = { longshotCurrent: next };
  globalThis.chrome = {
    storage: {
      local: {
        get: (key, cb) => {
          const value = typeof key === "string" ? { [key]: store[key] } : store;
          if (typeof cb === "function") cb(value);
          return Promise.resolve(value);
        },
        set: (obj, cb) => {
          Object.assign(store, obj);
          if (typeof cb === "function") cb();
          return Promise.resolve();
        },
      },
    },
    runtime: {
      getURL: (path) => path,
      sendMessage: () => Promise.resolve({ ok: true }),
      lastError: undefined,
    },
  };
}, record);

try {
  await page.goto(`http://127.0.0.1:${port}/editor.html`, { waitUntil: "networkidle" });
  await page.waitForFunction(() => {
    const canvas = document.getElementById("canvas");
    const title = document.getElementById("title")?.textContent || "";
    return canvas && canvas.width > 100 && title !== "No capture";
  });
  await page.waitForTimeout(300);

  async function at(imageX, imageY) {
    const box = await page.locator("#canvas").boundingBox();
    const dim = await page.evaluate(() => ({ w: canvas.width, h: canvas.height }));
    return {
      x: box.x + (imageX / dim.w) * box.width,
      y: box.y + (imageY / dim.h) * box.height,
    };
  }

  async function drag(tool, x1, y1, x2, y2) {
    await page.click(`[data-tool="${tool}"]`);
    const a = await at(x1, y1);
    const b = await at(x2, y2);
    await page.mouse.move(a.x, a.y);
    await page.mouse.down();
    await page.mouse.move(b.x, b.y, { steps: 16 });
    await page.mouse.up();
  }

  await page.locator("#swatches i").nth(0).click();
  await drag("ellipse", 640, 210, 1060, 375);
  await drag("arrow", 980, 575, 900, 310);
  await page.click('[data-tool="text"]');
  const textAt = await at(200, 455);
  await page.mouse.click(textAt.x, textAt.y);
  await page.waitForSelector("#textEdit:not([hidden])");
  await page.fill("#textEdit", "This is the gap");
  await page.click("header strong");
  await page.click('[data-tool="emoji"]');
  await page.getByRole("button", { name: "📌", exact: true }).click();
  const pin = await at(1025, 230);
  await page.mouse.click(pin.x, pin.y);
  await page.click('[data-tool="select"]');
  await page.waitForTimeout(200);
  await page.screenshot({ path: outPng, type: "png" });
  console.log(JSON.stringify({ ok: true, path: outPng, subject: shot.path }));
} finally {
  await browser.close();
  server.close();
}

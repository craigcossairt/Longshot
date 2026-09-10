import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { chromium } from "playwright";
import {
  CAPTURE_DELAYS,
  DEFAULTS,
  HIDE_POLICY,
  OVERFLOW_POLICY,
  bindOverflowCapture,
  filename,
  fitFileSize,
  installHideSession,
  jpegToPdfBlob,
  mimeFor,
  runTiledCapture,
  uniquePath,
  usesQuality,
} from "../extension/core/index.js";
import { EXIT } from "./args.mjs";

const CAPTURE_CSS = `
  html { scroll-behavior: auto !important; scrollbar-width: none !important; overflow-anchor: none !important; }
  body { scroll-behavior: auto !important; overflow-anchor: none !important; }
  * { scroll-behavior: auto !important; }
  html::-webkit-scrollbar, body::-webkit-scrollbar, *::-webkit-scrollbar {
    width: 0 !important;
    height: 0 !important;
    display: none !important;
  }
`;

function progress(message) {
  process.stderr.write(`${message}\n`);
}

function bufToDataUrl(buf) {
  return `data:image/png;base64,${Buffer.from(buf).toString("base64")}`;
}

async function withBrowser(options, fn) {
  let browser;
  try {
    if (options.cdp) {
      progress(`Connecting over CDP`);
      browser = await chromium.connectOverCDP(options.cdp);
    } else {
      const launchOpts = {
        headless: !options.headed,
      };
      if (options.channel !== "chromium") launchOpts.channel = options.channel;
      progress(`Launching ${options.channel}`);
      browser = await chromium.launch(launchOpts);
    }
  } catch (error) {
    const err = new Error(String(error?.message || error));
    err.code = EXIT.BROWSER;
    throw err;
  }

  try {
    return await fn(browser);
  } finally {
    if (!options.cdp) await browser.close().catch(() => {});
  }
}

async function preparePage(browser, options) {
  const context = options.cdp
    ? browser.contexts()[0] || (await browser.newContext())
    : await browser.newContext({
        viewport: { width: options.viewport.width, height: options.viewport.height },
        deviceScaleFactor: options.viewport.scale,
        bypassCSP: true,
      });
  const page = options.cdp ? context.pages()[0] || (await context.newPage()) : await context.newPage();
  if (options.cdp) {
    await page.setViewportSize({ width: options.viewport.width, height: options.viewport.height });
  }
  progress(`Opening ${options.url}`);
  await page.goto(options.url, { waitUntil: "domcontentloaded", timeout: 60000 });
  if (options.wait) {
    const ms = Number(options.wait);
    if (Number.isFinite(ms)) await page.waitForTimeout(ms);
    else await page.waitForSelector(options.wait, { timeout: 60000 });
  }
  await page.addStyleTag({ content: CAPTURE_CSS });
  await page.evaluate(installHideSession, HIDE_POLICY);
  await page.evaluate(bindOverflowCapture, OVERFLOW_POLICY);
  return { context, page };
}

async function measure(page) {
  return page.evaluate(() => {
    const el = document.documentElement;
    const body = document.body;
    return {
      scrollX: window.scrollX,
      scrollY: window.scrollY,
      scrollWidth: Math.max(el.scrollWidth, body?.scrollWidth || 0),
      scrollHeight: Math.max(el.scrollHeight, body?.scrollHeight || 0),
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio || 1,
      title: document.title || "Page",
      url: location.href,
    };
  });
}

async function captureViewportPng(page) {
  const buf = await page.screenshot({ type: "png", fullPage: false, animations: "disabled" });
  return bufToDataUrl(buf);
}

async function encodeInPage(page, shots, { fullW, fullH, dpr }, settings) {
  return page.evaluate(
    async ({ shots, geom, settings, mime, quality }) => {
      async function decode(dataUrl) {
        const blob = await (await fetch(dataUrl)).blob();
        return createImageBitmap(blob);
      }
      const canvas = new OffscreenCanvas(
        Math.max(1, Math.round(geom.fullW * geom.dpr)),
        Math.max(1, Math.round(geom.fullH * geom.dpr)),
      );
      const ctx = canvas.getContext("2d");
      for (const shot of shots) {
        const bmp = await decode(shot.dataUrl);
        ctx.drawImage(bmp, Math.round(shot.x * geom.dpr), Math.round(shot.y * geom.dpr));
      }
      let out = canvas;
      let w = out.width * (settings.scalePercent / 100);
      let h = out.height * (settings.scalePercent / 100);
      const scale = Math.min(1, (settings.maxWidth || w) / w, (settings.maxHeight || h) / h);
      w = Math.max(1, Math.round(w * scale));
      h = Math.max(1, Math.round(h * scale));
      if (w !== out.width || h !== out.height) {
        const next = new OffscreenCanvas(w, h);
        const nctx = next.getContext("2d");
        nctx.imageSmoothingEnabled = true;
        nctx.drawImage(out, 0, 0, w, h);
        out = next;
      }
      const blob = await out.convertToBlob({ type: mime, quality });
      const bytes = new Uint8Array(await blob.arrayBuffer());
      let binary = "";
      const chunk = 0x8000;
      for (let i = 0; i < bytes.length; i += chunk) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
      }
      return {
        base64: btoa(binary),
        width: out.width,
        height: out.height,
        bytes: bytes.byteLength,
      };
    },
    {
      shots,
      geom: { fullW, fullH, dpr },
      settings,
      mime: settings.format === "pdf" ? "image/jpeg" : mimeFor(settings.format),
      quality: usesQuality(settings.format === "pdf" ? "jpeg" : settings.format) ? settings.quality : 1,
    },
  );
}

async function reencodeEncoded(page, encoded, { width, height, mime, quality }) {
  return page.evaluate(
    async ({ encoded, width, height, mime, quality }) => {
      const blob = await (await fetch(`data:${mime};base64,${encoded.base64}`)).blob();
      const bmp = await createImageBitmap(blob);
      const w = width || bmp.width;
      const h = height || bmp.height;
      const canvas = new OffscreenCanvas(w, h);
      const ctx = canvas.getContext("2d");
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(bmp, 0, 0, w, h);
      const out = await canvas.convertToBlob({ type: mime, quality });
      const bytes = new Uint8Array(await out.arrayBuffer());
      let binary = "";
      const chunk = 0x8000;
      for (let i = 0; i < bytes.length; i += chunk) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
      }
      return { base64: btoa(binary), width: w, height: h, bytes: bytes.byteLength };
    },
    { encoded, width, height, mime, quality },
  );
}

async function applyByteBudget(page, encoded, settings) {
  if (!settings.maxFileMB) return encoded;
  const mime = settings.format === "pdf" ? "image/jpeg" : mimeFor(settings.format);
  const useQ = usesQuality(settings.format === "pdf" ? "jpeg" : settings.format);
  const cache = new Map();
  let last = encoded;
  const fake = {
    width: encoded.width,
    height: encoded.height,
    getContext() {
      return { imageSmoothingEnabled: true, drawImage() {} };
    },
  };
  await fitFileSize(fake, settings, {
    createCanvas: (w, h) => ({
      width: w,
      height: h,
      getContext() {
        return { imageSmoothingEnabled: true, drawImage() {} };
      },
    }),
    encode: async (canvas, { type, quality }) => {
      const q = useQ ? quality : 1;
      const key = `${canvas.width}x${canvas.height}:${q}:${type}`;
      if (cache.has(key)) {
        last = cache.get(key);
        return { size: last.bytes };
      }
      const next = await reencodeEncoded(page, encoded, {
        width: canvas.width,
        height: canvas.height,
        mime: type,
        quality: q,
      });
      cache.set(key, next);
      last = next;
      return { size: next.bytes };
    },
  });
  return last;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function tiledFullPage(page, settings, options) {
  const dim = await measure(page);
  const overflow =
    options.overflow !== false ? await page.evaluate(() => globalThis.__longshotOverflow?.find() || null) : null;
  const captureDim = overflow
    ? {
        ...dim,
        scrollX: overflow.scrollLeft,
        scrollY: overflow.scrollTop,
        scrollWidth: overflow.scrollWidth,
        scrollHeight: overflow.scrollHeight,
        viewportWidth: overflow.clientWidth,
        viewportHeight: overflow.clientHeight,
      }
    : dim;
  let lastCrop = overflow?.crop || null;
  if (overflow) {
    progress(`Overflow pane ${overflow.scrollWidth}×${overflow.scrollHeight}`);
  } else {
    progress(`Page ${dim.scrollWidth}×${dim.scrollHeight} @ ${dim.devicePixelRatio}x`);
  }
  const result = await runTiledCapture({
    mode: "full",
    dim: captureDim,
    delays: CAPTURE_DELAYS,
    delay,
    scroll: async (x, y) => {
      if (overflow) {
        const pos = await page.evaluate(async ({ x, y }) => globalThis.__longshotOverflow.scroll(x, y), { x, y });
        if (pos?.crop) lastCrop = pos.crop;
        return pos;
      }
      return page.evaluate(async ({ x, y }) => {
        const root = document.scrollingElement || document.documentElement;
        const maxX = Math.max(0, root.scrollWidth - window.innerWidth);
        const maxY = Math.max(0, root.scrollHeight - window.innerHeight);
        const tx = Math.min(Math.max(0, x), maxX);
        const ty = Math.min(Math.max(0, y), maxY);
        try {
          window.scrollTo({ left: tx, top: ty, behavior: "instant" });
        } catch {
          window.scrollTo(tx, ty);
        }
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
        return { x: window.scrollX, y: window.scrollY };
      }, { x, y });
    },
    hideChrome: async () => {
      await page.evaluate(() => globalThis.__longshotHide?.hide());
    },
    reset: async (orig) => {
      await page.evaluate(({ x, y, usedOverflow }) => {
        if (usedOverflow) globalThis.__longshotOverflow?.reset();
        else {
          try {
            window.scrollTo({ left: x, top: y, behavior: "instant" });
          } catch {
            window.scrollTo(x, y);
          }
        }
        globalThis.__longshotHide?.reset();
      }, { x: orig.x, y: orig.y, usedOverflow: Boolean(overflow) });
    },
    captureTile: async () => {
      if (lastCrop?.w && lastCrop?.h) {
        const buf = await page.screenshot({
          type: "png",
          animations: "disabled",
          clip: { x: lastCrop.x, y: lastCrop.y, width: lastCrop.w, height: lastCrop.h },
        });
        return bufToDataUrl(buf);
      }
      return captureViewportPng(page);
    },
    onProgress: ({ text }) => progress(text),
  });
  progress("Stitching");
  const dpr = dim.devicePixelRatio || 1;
  let encoded = await encodeInPage(page, result.shots, { fullW: result.fullW, fullH: result.fullH, dpr }, settings);
  encoded = await applyByteBudget(page, encoded, settings);
  return { encoded, dim: captureDim, tiles: result.tiles };
}

async function reencodePng(page, buf, settings) {
  const dataUrl = bufToDataUrl(buf);
  const encoded = await page.evaluate(
    async ({ dataUrl, mime, quality }) => {
      const blob = await (await fetch(dataUrl)).blob();
      const bmp = await createImageBitmap(blob);
      const canvas = new OffscreenCanvas(bmp.width, bmp.height);
      canvas.getContext("2d").drawImage(bmp, 0, 0);
      const out = await canvas.convertToBlob({ type: mime, quality });
      const bytes = new Uint8Array(await out.arrayBuffer());
      let binary = "";
      const chunk = 0x8000;
      for (let i = 0; i < bytes.length; i += chunk) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
      }
      return { base64: btoa(binary), width: bmp.width, height: bmp.height, bytes: bytes.byteLength };
    },
    {
      dataUrl,
      mime: settings.format === "pdf" ? "image/jpeg" : mimeFor(settings.format),
      quality: usesQuality(settings.format === "pdf" ? "jpeg" : settings.format) ? settings.quality : 1,
    },
  );
  return applyByteBudget(page, encoded, settings);
}

async function visibleCapture(page, settings) {
  const dim = await measure(page);
  const buf = await page.screenshot({ type: "png", fullPage: false, animations: "disabled" });
  return { encoded: await reencodePng(page, buf, settings), dim, tiles: 1 };
}

async function nativeFullPage(page, settings) {
  progress("Native full-page screenshot (sticky chrome is not suppressed)");
  const dim = await measure(page);
  const buf = await page.screenshot({ type: "png", fullPage: true, animations: "disabled" });
  return { encoded: await reencodePng(page, buf, settings), dim, tiles: 1 };
}

async function selectorCapture(page, options, settings) {
  const loc = page.locator(options.selector).first();
  const count = await page.locator(options.selector).count();
  if (!count) {
    const err = new Error(`Selector not found: ${options.selector}`);
    err.code = EXIT.TARGET;
    throw err;
  }
  const dim = await measure(page);
  const buf = await loc.screenshot({ type: "png", animations: "disabled" });
  return { encoded: await reencodePng(page, buf, settings), dim, tiles: 1 };
}

async function regionCapture(page, options, settings) {
  const dim = await measure(page);
  const buf = await page.screenshot({
    type: "png",
    animations: "disabled",
    clip: {
      x: options.region.x,
      y: options.region.y,
      width: options.region.w,
      height: options.region.h,
    },
  });
  return { encoded: await reencodePng(page, buf, settings), dim, tiles: 1 };
}

function settingsFromOptions(options) {
  const format = options.format === "pdf" ? "jpeg" : options.format;
  return {
    ...DEFAULTS,
    format,
    quality: DEFAULTS.quality,
    maxFileMB: options.maxBytes ? options.maxBytes / (1024 * 1024) : 0,
    downloadDirectory: "Longshot",
    filenameTemplate: "{title}-{date}",
  };
}

async function writeOutput(options, encoded, dim, settings) {
  const record = {
    title: dim.title,
    url: dim.url,
    width: encoded.width,
    height: encoded.height,
    format: options.format === "pdf" ? "pdf" : settings.format,
    createdAt: Date.now(),
  };
  const leaf = filename(record, settings).split("/").pop();
  const target = uniquePath(resolve(options.out || leaf), existsSync);
  mkdirSync(dirname(target), { recursive: true });
  let body = Buffer.from(encoded.base64, "base64");
  if (options.format === "pdf") {
    const pdf = jpegToPdfBlob(body, encoded.width, encoded.height, dim.title);
    body = Buffer.from(await pdf.arrayBuffer());
  }
  writeFileSync(target, body);
  return { path: target, bytes: body.length };
}

export async function capture(options) {
  const settings = settingsFromOptions(options);
  return withBrowser(options, async (browser) => {
    const { page } = await preparePage(browser, options);
    let result;
    if (options.selector) result = await selectorCapture(page, options, settings);
    else if (options.region) result = await regionCapture(page, options, settings);
    else if (options.fullPage && options.engine === "native") result = await nativeFullPage(page, settings);
    else if (options.fullPage) result = await tiledFullPage(page, settings, options);
    else result = await visibleCapture(page, settings);
    const written = await writeOutput(options, result.encoded, result.dim, settings);
    return {
      path: written.path,
      width: result.encoded.width,
      height: result.encoded.height,
      format: options.format,
      bytes: written.bytes,
      engine: options.fullPage ? options.engine : "viewport",
      tiles: result.tiles,
    };
  });
}

import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { chromium } from "playwright";
import { REGION_GRID, sha256 } from "./verdict.mjs";
import {
  CANVAS_MAX_SIDE,
  CAPTURE_DELAYS,
  DEFAULTS,
  HIDE_POLICY,
  OVERFLOW_POLICY,
  bindOverflowCapture,
  filename,
  fitFileSize,
  installHideSession,
  jpegToPdfBlob,
  limitScale,
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

function dataUrlToBytes(dataUrl) {
  const comma = String(dataUrl).indexOf(",");
  return new Uint8Array(Buffer.from(String(dataUrl).slice(comma + 1), "base64"));
}

function asUint8(value) {
  if (value instanceof Uint8Array) return value;
  return new Uint8Array(value);
}

// convertToBlob falls back to PNG for types it cannot encode instead of throwing.
function encodedResult(raw, mime) {
  if (raw.type !== mime) throw new Error(`This browser cannot encode ${mime}`);
  return { data: asUint8(raw.data), width: raw.width, height: raw.height };
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

async function openPage(browser, options) {
  const context = options.cdp
    ? browser.contexts()[0] || (await browser.newContext())
    : await browser.newContext({
        viewport: { width: options.viewport.width, height: options.viewport.height },
        deviceScaleFactor: options.viewport.scale,
        bypassCSP: true,
      });
  // Over --cdp, open a fresh tab rather than navigating one the user already has open.
  const page = await context.newPage();
  if (options.cdp) {
    await page.setViewportSize({ width: options.viewport.width, height: options.viewport.height });
  }
  return page;
}

async function preparePage(page, options) {
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
  const payload = shots.map((shot) => ({
    x: shot.x,
    y: shot.y,
    bytes: dataUrlToBytes(shot.dataUrl),
  }));
  const mime = settings.format === "pdf" ? "image/jpeg" : mimeFor(settings.format);
  const raw = await page.evaluate(
    async ({ shots, geom, mime, quality }) => {
      // Same scaling as extension/core/stitch.js: never allocate the full-size canvas.
      const k = geom.dpr * geom.scale;
      const out = new OffscreenCanvas(
        Math.max(1, Math.round(geom.fullW * k)),
        Math.max(1, Math.round(geom.fullH * k)),
      );
      const ctx = out.getContext("2d");
      if (geom.scale !== 1) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
      }
      for (const shot of shots) {
        const bmp = await createImageBitmap(new Blob([shot.bytes], { type: "image/png" }));
        if (geom.scale === 1) {
          ctx.drawImage(bmp, Math.round(shot.x * geom.dpr), Math.round(shot.y * geom.dpr));
          continue;
        }
        const x0 = Math.round(shot.x * k);
        const y0 = Math.round(shot.y * k);
        const x1 = Math.round((shot.x * geom.dpr + bmp.width) * geom.scale);
        const y1 = Math.round((shot.y * geom.dpr + bmp.height) * geom.scale);
        ctx.drawImage(bmp, x0, y0, Math.max(1, x1 - x0), Math.max(1, y1 - y0));
      }
      const blob = await out.convertToBlob({ type: mime, quality });
      return {
        data: new Uint8Array(await blob.arrayBuffer()),
        type: blob.type,
        width: out.width,
        height: out.height,
      };
    },
    {
      shots: payload,
      geom: { fullW, fullH, dpr, scale: limitScale(fullW * dpr, fullH * dpr, settings) },
      mime,
      quality: usesQuality(settings.format === "pdf" ? "jpeg" : settings.format) ? settings.quality : 1,
    },
  );
  return encodedResult(raw, mime);
}

async function reencodeEncoded(page, encoded, { width, height, mime, quality }) {
  const raw = await page.evaluate(
    async ({ data, width, height, mime, quality }) => {
      const bmp = await createImageBitmap(new Blob([data], { type: mime }));
      const w = width || bmp.width;
      const h = height || bmp.height;
      const canvas = new OffscreenCanvas(w, h);
      const ctx = canvas.getContext("2d");
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(bmp, 0, 0, w, h);
      const out = await canvas.convertToBlob({ type: mime, quality });
      return {
        data: new Uint8Array(await out.arrayBuffer()),
        type: out.type,
        width: w,
        height: h,
      };
    },
    { data: encoded.data, width, height, mime, quality },
  );
  return encodedResult(raw, mime);
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
        return { size: last.data.byteLength };
      }
      const next = await reencodeEncoded(page, encoded, {
        width: canvas.width,
        height: canvas.height,
        mime: type,
        quality: q,
      });
      cache.set(key, next);
      last = next;
      return { size: next.data.byteLength };
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
  // PNG IHDR: width and height are big-endian at bytes 16 and 20.
  const png = Buffer.from(buf);
  const srcW = png.readUInt32BE(16);
  const srcH = png.readUInt32BE(20);
  const scale = limitScale(srcW, srcH, settings);
  const encoded = await reencodeEncoded(
    page,
    { data: new Uint8Array(buf) },
    {
      width: Math.max(1, Math.round(srcW * scale)),
      height: Math.max(1, Math.round(srcH * scale)),
      mime: settings.format === "pdf" ? "image/jpeg" : mimeFor(settings.format),
      quality: usesQuality(settings.format === "pdf" ? "jpeg" : settings.format) ? settings.quality : 1,
    },
  );
  return applyByteBudget(page, encoded, settings);
}

async function regionHashesInPage(page, data, mime) {
  return page.evaluate(
    async ({ data, mime, grid }) => {
      const bmp = await createImageBitmap(new Blob([data], { type: mime }));
      const canvas = new OffscreenCanvas(bmp.width, bmp.height);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(bmp, 0, 0);
      const img = ctx.getImageData(0, 0, bmp.width, bmp.height);
      const hashes = [];
      const cellW = Math.max(1, Math.floor(bmp.width / grid));
      const cellH = Math.max(1, Math.floor(bmp.height / grid));
      for (let gy = 0; gy < grid; gy++) {
        for (let gx = 0; gx < grid; gx++) {
          const x0 = gx * cellW;
          const y0 = gy * cellH;
          const x1 = gx === grid - 1 ? bmp.width : x0 + cellW;
          const y1 = gy === grid - 1 ? bmp.height : y0 + cellH;
          let h = 2166136261;
          for (let y = y0; y < y1; y++) {
            for (let x = x0; x < x1; x++) {
              const i = (y * bmp.width + x) * 4;
              h ^= img.data[i];
              h = Math.imul(h, 16777619);
              h ^= img.data[i + 1];
              h = Math.imul(h, 16777619);
              h ^= img.data[i + 2];
              h = Math.imul(h, 16777619);
            }
          }
          hashes.push((h >>> 0).toString(16).padStart(8, "0"));
        }
      }
      return hashes;
    },
    { data, mime, grid: REGION_GRID },
  );
}

async function visibleCapture(page, settings) {
  const dim = await measure(page);
  const buf = await page.screenshot({ type: "png", fullPage: false, animations: "disabled" });
  return { encoded: await reencodePng(page, buf, settings), dim, tiles: 1 };
}

async function nativeFullPage(page, settings) {
  progress("Native full-page screenshot (sticky chrome is not suppressed)");
  const dim = await measure(page);
  const dpr = dim.devicePixelRatio || 1;
  // A bitmap taller than the canvas limit cannot be decoded whole in the page, so
  // tall pages are shot in slices and stitched (scaled) like tiled captures.
  const sliceH = Math.floor(CANVAS_MAX_SIDE / 2 / dpr);
  if (dim.scrollHeight <= sliceH) {
    const buf = await page.screenshot({ type: "png", fullPage: true, animations: "disabled" });
    return { encoded: await reencodePng(page, buf, settings), dim, tiles: 1 };
  }
  const shots = [];
  for (let y = 0; y < dim.scrollHeight; y += sliceH) {
    const buf = await page.screenshot({
      type: "png",
      fullPage: true,
      animations: "disabled",
      clip: { x: 0, y, width: dim.scrollWidth, height: Math.min(sliceH, dim.scrollHeight - y) },
    });
    shots.push({ x: 0, y, dataUrl: bufToDataUrl(buf) });
  }
  progress("Stitching");
  let encoded = await encodeInPage(page, shots, { fullW: dim.scrollWidth, fullH: dim.scrollHeight, dpr }, settings);
  encoded = await applyByteBudget(page, encoded, settings);
  return { encoded, dim, tiles: shots.length };
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
  let body = Buffer.from(encoded.data);
  if (options.format === "pdf") {
    const pdf = jpegToPdfBlob(body, encoded.width, encoded.height, dim.title);
    body = Buffer.from(await pdf.arrayBuffer());
  }
  writeFileSync(target, body);
  return {
    path: target,
    bytes: body.length,
    fileBody: body,
    mime: settings.format === "pdf" ? "image/jpeg" : mimeFor(settings.format),
  };
}

export async function capture(options) {
  const settings = settingsFromOptions(options);
  return withBrowser(options, async (browser) => {
    const page = await openPage(browser, options);
    try {
      await preparePage(page, options);
      return await captureOnPage(page, options, settings);
    } finally {
      if (options.cdp) await page.close().catch(() => {});
    }
  });
}

async function captureOnPage(page, options, settings) {
  let result;
  if (options.selector) result = await selectorCapture(page, options, settings);
  else if (options.region) result = await regionCapture(page, options, settings);
  else if (options.fullPage && options.engine === "native") result = await nativeFullPage(page, settings);
  else if (options.fullPage) result = await tiledFullPage(page, settings, options);
  else result = await visibleCapture(page, settings);
  const written = await writeOutput(options, result.encoded, result.dim, settings);
  const regions = await regionHashesInPage(page, result.encoded.data, written.mime);
  return {
    path: written.path,
    width: result.encoded.width,
    height: result.encoded.height,
    format: options.format,
    bytes: written.bytes,
    engine: options.fullPage ? options.engine : "viewport",
    tiles: result.tiles,
    url: result.dim.url,
    sha256: sha256(written.fileBody),
    regions,
  };
}

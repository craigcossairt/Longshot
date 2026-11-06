import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { chromium } from "playwright";
import { REGION_GRID, assertBaselineSafeOutput, sha256 } from "./verdict.mjs";
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
    // For connectOverCDP, close releases the connection; the external browser stays open.
    await browser.close().catch(() => {});
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
  try {
    if (options.cdp) {
      await page.setViewportSize({ width: options.viewport.width, height: options.viewport.height });
    }
    return page;
  } catch (error) {
    await page.close().catch(() => {});
    throw error;
  }
}

async function preparePage(page, options) {
  progress(`Opening ${options.url}`);
  await page.goto(options.url, { waitUntil: "domcontentloaded", timeout: 60000 });
  if (options.wait) {
    const ms = Number(options.wait);
    if (Number.isFinite(ms)) await page.waitForTimeout(ms);
    else await page.waitForSelector(options.wait, { timeout: 60000 });
  }
  // Inspector styles work with strict page CSP without disabling that CSP.
  const session = await page.context().newCDPSession(page);
  try {
    await session.send("DOM.enable");
    await session.send("CSS.enable");
    const { frameTree } = await session.send("Page.getFrameTree");
    const { styleSheetId } = await session.send("CSS.createStyleSheet", { frameId: frameTree.frame.id });
    await session.send("CSS.setStyleSheetText", { styleSheetId, text: CAPTURE_CSS });
  } finally {
    await session.detach();
  }
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

async function encodeInPage(page, shots, { fullW, fullH, dpr }, settings, place = null) {
  const payload = shots.map((shot) => ({
    x: shot.x,
    y: shot.y,
    bottomRects: shot.bottomRects || [],
    bytes: dataUrlToBytes(shot.dataUrl),
  }));
  const mime = settings.format === "pdf" ? "image/jpeg" : mimeFor(settings.format);
  const outputW = place ? place.width + Math.max(0, fullW * dpr - place.crop.w * dpr) : fullW * dpr;
  const outputH = place ? place.height + Math.max(0, fullH * dpr - place.crop.h * dpr) : fullH * dpr;
  const scale = limitScale(outputW, outputH, settings, place ? (s) => {
    const k = dpr * s;
    return {
      width: Math.max(1, Math.round(place.width * s)) + Math.max(0, Math.max(1, Math.round(fullW * k)) - Math.round(place.crop.w * k)),
      height: Math.max(1, Math.round(place.height * s)) + Math.max(0, Math.max(1, Math.round(fullH * k)) - Math.round(place.crop.h * k)),
    };
  } : undefined);
  const raw = await page.evaluate(
    async ({ shots, geom, mime, quality, place }) => {
      // Scale before allocating, including the surrounding viewport of a modal.
      const k = geom.dpr * geom.scale;
      const canvas = new OffscreenCanvas(
        Math.max(1, Math.round(geom.fullW * k)),
        Math.max(1, Math.round(geom.fullH * k)),
      );
      const ctx = canvas.getContext("2d");
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      for (let i = shots.length - 1; i >= 0; i--) {
        const shot = shots[i];
        const bmp = await createImageBitmap(new Blob([shot.bytes], { type: "image/png" }));
        const x0 = Math.round(shot.x * k);
        const y0 = Math.round(shot.y * k);
        const x1 = Math.round((shot.x * geom.dpr + bmp.width) * geom.scale);
        const y1 = Math.round((shot.y * geom.dpr + bmp.height) * geom.scale);
        ctx.drawImage(bmp, x0, y0, Math.max(1, x1 - x0), Math.max(1, y1 - y0));
        bmp.close();
      }
      // The last tile's footer must paint over the preceding tile's overlap.
      for (const shot of shots) {
        if (!shot.bottomRects.length) continue;
        const bmp = await createImageBitmap(new Blob([shot.bytes], { type: "image/png" }));
        for (const rect of shot.bottomRects) {
          const sx = Math.max(0, Math.round(rect.x * geom.dpr));
          const sy = Math.max(0, Math.round(rect.y * geom.dpr));
          const right = Math.min(bmp.width, Math.round((rect.x + rect.w) * geom.dpr));
          const bottom = Math.min(bmp.height, Math.round((rect.y + rect.h) * geom.dpr));
          if (right <= sx || bottom <= sy) continue;
          const x0 = Math.round((shot.x * geom.dpr + sx) * geom.scale);
          const y0 = Math.round((shot.y * geom.dpr + sy) * geom.scale);
          const x1 = Math.round((shot.x * geom.dpr + right) * geom.scale);
          const y1 = Math.round((shot.y * geom.dpr + bottom) * geom.scale);
          if (x1 > x0 && y1 > y0) ctx.drawImage(bmp, sx, sy, right - sx, bottom - sy,
            x0, y0, x1 - x0, y1 - y0);
        }
        bmp.close();
      }
      let out = canvas;
      if (place?.base && place.crop) {
        const baseBmp = await createImageBitmap(new Blob([place.base], { type: "image/png" }));
        let baseW = Math.max(1, Math.round(baseBmp.width * geom.scale));
        const baseH = Math.max(1, Math.round(baseBmp.height * geom.scale));
        const extraW = Math.max(0, canvas.width - Math.round(place.crop.w * k));
        const base = new OffscreenCanvas(baseW + extraW, baseH);
        const bctx = base.getContext("2d");
        bctx.drawImage(baseBmp, 0, 0, baseW, baseH);
        if (extraW > 0) {
          const cut = Math.min(baseW, Math.max(0, Math.round((place.crop.x + place.crop.w) * k)));
          const sampleY = Math.max(0, Math.min(baseH - 1, Math.round(place.crop.y * k) + 2));
          const left = Math.round(place.crop.x * k) - 2;
          const right = Math.round((place.crop.x + place.crop.w) * k) + 2;
          const pixel = bctx.getImageData(left >= 0 ? left : right < baseW ? right : 0, sampleY, 1, 1).data;
          bctx.fillStyle = `rgba(${pixel[0]}, ${pixel[1]}, ${pixel[2]}, ${pixel[3] / 255})`;
          bctx.fillRect(cut, 0, extraW, baseH);
          if (baseW > cut) bctx.drawImage(baseBmp, cut / geom.scale, 0, (baseW - cut) / geom.scale, baseBmp.height,
            cut + extraW, 0, baseW - cut, baseH);
          baseW += extraW;
        }
        const extra = Math.max(0, canvas.height - Math.round(place.crop.h * k));
        const merged = new OffscreenCanvas(baseW, baseH + extra);
        const mctx = merged.getContext("2d");
        mctx.drawImage(base, 0, 0);
        if (extra > 0) {
          const cut = Math.min(baseH, Math.max(0, Math.round((place.crop.y + place.crop.h) * k)));
          const sampleY = Math.max(0, Math.min(baseH - 1, Math.round(place.crop.y * k) + 2));
          const left = Math.round(place.crop.x * k) - 2;
          const right = Math.round((place.crop.x + place.crop.w) * k) + 2;
          const sampleX = left >= 0 ? left : right < baseW ? right : 0;
          const pixel = mctx.getImageData(sampleX, sampleY, 1, 1).data;
          mctx.fillStyle = `rgba(${pixel[0]}, ${pixel[1]}, ${pixel[2]}, ${pixel[3] / 255})`;
          mctx.fillRect(0, cut, merged.width, extra);
          const below = baseH - cut;
          if (below > 0) {
            mctx.drawImage(base, 0, cut, baseW, below,
              0, cut + extra, baseW, below);
          }
        }
        mctx.drawImage(canvas, Math.round(place.crop.x * k), Math.round(place.crop.y * k));
        baseBmp.close();
        out = merged;
      }
      const blob = await out.convertToBlob({ type: mime, quality });
      return { data: new Uint8Array(await blob.arrayBuffer()), type: blob.type, width: out.width, height: out.height };
    },
    {
      shots: payload,
      geom: { fullW, fullH, dpr, scale },
      mime,
      quality: usesQuality(settings.format === "pdf" ? "jpeg" : settings.format) ? settings.quality : 1,
      place,
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
  const outputSize = (image) => settings.outputIsPdf
    ? jpegToPdfBlob(image.data, image.width, image.height, settings.pdfTitle).size
    : image.data.byteLength;
  if (outputSize(encoded) <= settings.maxFileMB * 1024 * 1024) return encoded;
  const useQ = usesQuality(settings.format === "pdf" ? "jpeg" : settings.format);
  const cache = new Map();
  const fakeCanvas = (width, height) => ({
    width, height,
    getContext: () => ({ imageSmoothingEnabled: true, drawImage() {} }),
  });
  const fitted = await fitFileSize(fakeCanvas(encoded.width, encoded.height), settings, {
    createCanvas: fakeCanvas,
    encode: async (canvas, { type, quality }) => {
      const q = useQ ? quality : 1;
      const key = `${canvas.width}x${canvas.height}:${q}:${type}`;
      if (!cache.has(key)) {
        const next = await reencodeEncoded(page, encoded, {
          width: canvas.width, height: canvas.height, mime: type, quality: q,
        });
        cache.set(key, { ...next, size: outputSize(next) });
      }
      return cache.get(key);
    },
  });
  if (!fitted.fits) {
    throw new Error(`Cannot meet --max-bytes (${Math.floor(settings.maxFileMB * 1024 * 1024)}); smallest encoded ${settings.outputIsPdf ? "PDF" : "image"} is ${fitted.encoded.size} bytes`);
  }
  return fitted.encoded;
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
  if (overflow?.kind === "modal" && overflow.fits) {
    progress("Modal fits the viewport");
    try {
      const buf = await page.screenshot({ type: "png", fullPage: false, animations: "disabled" });
      const encoded = await reencodePng(page, buf, settings);
      return { encoded, dim, tiles: 1 };
    } finally {
      await page.evaluate(() => globalThis.__longshotOverflow?.reset());
    }
  }
  let modalBase = null;
  if (overflow?.kind === "modal") {
    progress(`Modal ${overflow.clientWidth}×${overflow.scrollHeight}`);
    modalBase = await page.screenshot({ type: "png", fullPage: false, animations: "disabled" });
  } else if (overflow) {
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
    hideChrome: async (opts) => {
      const anchor = lastCrop?.w ? { x: lastCrop.x, y: lastCrop.y, w: lastCrop.w, h: lastCrop.h } : null;
      const hidden = await page.evaluate(
        (payload) => globalThis.__longshotHide?.hide(payload),
        {
          top: opts?.top !== false,
          bottom: opts?.bottom !== false,
          barsOnly: overflow?.kind === "modal",
          anchor,
        },
      );
      if (!lastCrop) return hidden;
      return { bottomRects: (hidden?.bottomRects || []).map((rect) => {
        const x = Math.max(0, rect.x - lastCrop.x);
        const y = Math.max(0, rect.y - lastCrop.y);
        return { x, y, w: Math.min(lastCrop.w, rect.x + rect.w - lastCrop.x) - x,
          h: Math.min(lastCrop.h, rect.y + rect.h - lastCrop.y) - y };
      }).filter((rect) => rect.w > 0 && rect.h > 0) };
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
  const place = modalBase
    ? { base: new Uint8Array(modalBase), crop: overflow.crop, dpr,
        width: modalBase.readUInt32BE(16), height: modalBase.readUInt32BE(20) }
    : null;
  let encoded = await encodeInPage(page, result.shots, { fullW: result.fullW, fullH: result.fullH, dpr }, settings, place);
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
    outputIsPdf: options.format === "pdf",
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
  assertBaselineSafeOutput(target, options.baseline);
  let body = Buffer.from(encoded.data);
  if (options.format === "pdf") {
    const pdf = jpegToPdfBlob(body, encoded.width, encoded.height, dim.title);
    body = Buffer.from(await pdf.arrayBuffer());
  }
  if (options.maxBytes && body.length > options.maxBytes) {
    throw new Error(`Cannot meet --max-bytes (${options.maxBytes}); final ${record.format} is ${body.length} bytes`);
  }
  mkdirSync(dirname(target), { recursive: true });
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
  if (settings.outputIsPdf) settings = { ...settings, pdfTitle: await page.title() || "Page" };
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

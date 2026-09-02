import { toCanvas } from "html-to-image";
import type { CaptureRecord } from "@/lib/types";
import { getSettings } from "@/lib/settings";
import { compositeBrowserChrome } from "@/lib/chrome-composite";
import { blobToDataUrl, constrainCanvas } from "@/lib/image-io";
import { uid } from "@/lib/utils";

export type CaptureMeta = {
  title: string;
  url: string;
};

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function waitFrame() {
  return new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}

async function waitForFrames(root: HTMLElement) {
  const frames = [...root.querySelectorAll("iframe")];
  await Promise.all(
    frames.map(
      (frame) =>
        new Promise<void>((resolve) => {
          if (frame.contentDocument?.readyState === "complete" && frame.contentDocument.body) {
            resolve();
            return;
          }
          const done = () => resolve();
          frame.addEventListener("load", done, { once: true });
          setTimeout(done, 1800);
        }),
    ),
  );
}

function materializeFrames(root: HTMLElement, expand: boolean) {
  const restores: Array<() => void> = [];
  root.querySelectorAll("iframe, frame").forEach((node) => {
    const frame = node as HTMLIFrameElement;
    try {
      const doc = frame.contentDocument;
      if (!doc?.body) return;
      const replacement = document.createElement("div");
      replacement.setAttribute("data-frame-clone", "1");
      replacement.style.width = "100%";
      replacement.style.boxSizing = "border-box";
      replacement.style.background = getComputedStyle(doc.body).backgroundColor || "#fff";
      if (expand) {
        replacement.style.height = "auto";
        replacement.style.overflow = "visible";
      } else {
        replacement.style.height = `${frame.clientHeight || 320}px`;
        replacement.style.overflow = "hidden";
      }
      replacement.innerHTML = doc.body.innerHTML;
      frame.style.display = "none";
      frame.parentElement?.insertBefore(replacement, frame);
      restores.push(() => {
        replacement.remove();
        frame.style.display = "";
      });
    } catch {
      // Cross-origin — leave the frame as painted.
    }
  });
  return () => restores.forEach((fn) => fn());
}

function prepareSvgs(root: HTMLElement) {
  const restores: Array<() => void> = [];
  root.querySelectorAll("svg").forEach((svg) => {
    const box = svg.getBoundingClientRect();
    const w = Math.max(1, Math.round(svg.clientWidth || box.width || svg.viewBox.baseVal.width || 1));
    const h = Math.max(1, Math.round(svg.clientHeight || box.height || svg.viewBox.baseVal.height || 1));
    const prevW = svg.getAttribute("width");
    const prevH = svg.getAttribute("height");
    svg.setAttribute("width", String(w));
    svg.setAttribute("height", String(h));
    restores.push(() => {
      if (prevW === null) svg.removeAttribute("width");
      else svg.setAttribute("width", prevW);
      if (prevH === null) svg.removeAttribute("height");
      else svg.setAttribute("height", prevH);
    });
  });
  return () => restores.forEach((fn) => fn());
}

async function waitForLayout(node: HTMLElement) {
  if (document.fonts?.ready) {
    await Promise.race([document.fonts.ready, wait(800)]);
  }
  for (let i = 0; i < 24; i++) {
    await waitFrame();
    const w = Math.max(node.scrollWidth, node.clientWidth, node.offsetWidth);
    const h = Math.max(node.scrollHeight, node.clientHeight, node.offsetHeight);
    if (w > 8 && h > 8) {
      await waitFrame();
      return { width: w, height: h };
    }
    await wait(50);
  }
  throw new Error("Page had no size to capture. Open the sample and try again.");
}

function clonePaintStyle(): Partial<CSSStyleDeclaration> {
  return {
    position: "static",
    left: "0px",
    top: "0px",
    right: "auto",
    bottom: "auto",
    transform: "none",
    margin: "0px",
    maxWidth: "none",
    maxHeight: "none",
    overflow: "visible",
    opacity: "1",
    visibility: "visible",
    clip: "auto",
    clipPath: "none",
    filter: "none",
  };
}

function isMostlyBlank(canvas: HTMLCanvasElement) {
  if (canvas.width < 1 || canvas.height < 1) return true;
  const ctx = canvas.getContext("2d");
  if (!ctx) return true;
  const w = canvas.width;
  const h = canvas.height;
  const stepX = Math.max(1, Math.floor(w / 24));
  const stepY = Math.max(1, Math.floor(h / 24));
  let colored = 0;
  for (let y = 0; y < h; y += stepY) {
    const row = ctx.getImageData(0, y, w, 1).data;
    for (let x = 0; x < w; x += stepX) {
      const i = x * 4;
      if (row[i + 3] > 8 && (row[i] < 248 || row[i + 1] < 248 || row[i + 2] < 248)) colored += 1;
    }
  }
  return colored < 6;
}

async function rasterizeNode(node: HTMLElement, width: number, height: number) {
  const bg = getComputedStyle(node).backgroundColor;
  const backgroundColor =
    bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent" ? bg : "#ffffff";
  const ratio = Math.min(2, window.devicePixelRatio || 1);
  const base = {
    width,
    height,
    backgroundColor,
    cacheBust: true,
    pixelRatio: ratio,
    skipFonts: true,
    style: {
      ...clonePaintStyle(),
      width: `${width}px`,
      height: `${height}px`,
    },
  };

  let raw: HTMLCanvasElement;
  try {
    raw = await toCanvas(node, base);
  } catch {
    raw = await toCanvas(node, { ...base, pixelRatio: 1 });
  }

  if (raw.width < 1 || raw.height < 1 || isMostlyBlank(raw)) {
    raw = await toCanvas(node, { ...base, pixelRatio: 1, skipFonts: true });
  }

  if (raw.width < 1 || raw.height < 1) {
    throw new Error("Capture produced an empty image. Try again.");
  }
  if (isMostlyBlank(raw)) {
    throw new Error("Capture came out blank. Open the sample page and capture from there.");
  }
  return raw;
}

export async function captureElement(node: HTMLElement, meta: CaptureMeta): Promise<CaptureRecord> {
  const settings = getSettings();
  await waitForFrames(node);
  const restoreFrames = materializeFrames(node, settings.captureIframes);
  await wait(80);
  const restoreSvgs = prepareSvgs(node);
  try {
    const size = await waitForLayout(node);
    const raw = await rasterizeNode(node, size.width, size.height);
    const withChrome = compositeBrowserChrome(raw, meta, settings);
    const { canvas: sized, blob } = await constrainCanvas(withChrome, settings);
    const dataUrl = await blobToDataUrl(blob);
    return {
      id: uid(),
      createdAt: Date.now(),
      title: meta.title,
      url: meta.url,
      dataUrl,
      width: sized.width,
      height: sized.height,
      format: settings.format,
    };
  } finally {
    restoreSvgs();
    restoreFrames();
  }
}

export async function captureFromFile(file: File): Promise<CaptureRecord> {
  const settings = getSettings();
  const dataUrl = await blobToDataUrl(file);
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not read that image"));
    image.src = dataUrl;
  });
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, img.naturalWidth);
  canvas.height = Math.max(1, img.naturalHeight);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unsupported");
  ctx.drawImage(img, 0, 0);
  const { canvas: sized, blob } = await constrainCanvas(canvas, settings);
  return {
    id: uid(),
    createdAt: Date.now(),
    title: file.name.replace(/\.[^.]+$/, "") || "Upload",
    url: "upload://local",
    dataUrl: await blobToDataUrl(blob),
    width: sized.width,
    height: sized.height,
    format: settings.format,
  };
}

export async function captureFromDataUrl(dataUrl: string, title = "Pasted capture"): Promise<CaptureRecord> {
  const settings = getSettings();
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not read clipboard image"));
    image.src = dataUrl;
  });
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, img.naturalWidth);
  canvas.height = Math.max(1, img.naturalHeight);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unsupported");
  ctx.drawImage(img, 0, 0);
  const { canvas: sized, blob } = await constrainCanvas(canvas, settings);
  return {
    id: uid(),
    createdAt: Date.now(),
    title,
    url: "clipboard://image",
    dataUrl: await blobToDataUrl(blob),
    width: sized.width,
    height: sized.height,
    format: settings.format,
  };
}

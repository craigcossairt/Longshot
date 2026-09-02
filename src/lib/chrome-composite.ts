import type { AppSettings } from "@/lib/types";

export function chromeHeight(settings: Pick<AppSettings, "includeBrowserBar" | "includeUrlBar">) {
  if (settings.includeBrowserBar) return 86;
  if (settings.includeUrlBar) return 36;
  return 0;
}

export function compositeBrowserChrome(
  source: HTMLCanvasElement,
  meta: { title: string; url: string },
  settings: Pick<AppSettings, "includeBrowserBar" | "includeUrlBar">,
) {
  if (source.width < 1 || source.height < 1) {
    throw new Error("Capture produced an empty image. Try again.");
  }
  const extra = chromeHeight(settings);
  if (!extra) return source;
  const canvas = document.createElement("canvas");
  canvas.width = source.width;
  canvas.height = source.height + extra;
  const ctx = canvas.getContext("2d");
  if (!ctx) return source;

  ctx.fillStyle = "#e8e6e1";
  ctx.fillRect(0, 0, canvas.width, extra);

  if (settings.includeBrowserBar) {
    ctx.fillStyle = "#d4d1cb";
    ctx.fillRect(0, 0, canvas.width, 40);

    const lights = ["#e15a4a", "#e0b84e", "#5e9a7a"];
    lights.forEach((color, i) => {
      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.arc(22 + i * 18, 20, 6, 0, Math.PI * 2);
      ctx.fill();
    });

    const tabX = 92;
    const tabW = Math.min(280, canvas.width * 0.38);
    roundRect(ctx, tabX, 8, tabW, 32, 10);
    ctx.fillStyle = "#eceae4";
    ctx.fill();
    ctx.fillStyle = "#3a3834";
    ctx.font = `500 16px Outfit, system-ui, sans-serif`;
    ctx.fillText(truncate(ctx, meta.title || "Page", tabW - 28), tabX + 14, 30);

    roundRect(ctx, 16, 50, canvas.width - 32, 28, 8);
    ctx.fillStyle = "#f6f3ec";
    ctx.fill();
    ctx.fillStyle = "#5c5850";
    ctx.font = `500 14px Outfit, system-ui, sans-serif`;
    ctx.fillText(truncate(ctx, meta.url, canvas.width - 64), 28, 69);
  } else if (settings.includeUrlBar) {
    ctx.fillStyle = "#5c5850";
    ctx.font = `500 14px Outfit, system-ui, sans-serif`;
    ctx.fillText(truncate(ctx, meta.url, canvas.width - 32), 16, 24);
  }

  ctx.drawImage(source, 0, extra);
  return canvas;
}

function truncate(ctx: CanvasRenderingContext2D, text: string, max: number) {
  if (ctx.measureText(text).width <= max) return text;
  let value = text;
  while (value.length > 1 && ctx.measureText(`${value}…`).width > max) {
    value = value.slice(0, -1);
  }
  return `${value}…`;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

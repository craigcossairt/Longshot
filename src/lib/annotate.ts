import type { Annotation, Point } from "@/lib/types";

export const DRAW_COLORS = [
  "#e15a4a",
  "#e08a3c",
  "#d2d6d0",
  "#3d9a6a",
  "#4a7ec4",
  "#f7f7f2",
  "#111111",
];

export const STAMP_EMOJI = [
  "⭐",
  "✅",
  "❌",
  "❗",
  "❓",
  "➡️",
  "⬅️",
  "⬆️",
  "⬇️",
  "⭕",
  "📌",
  "👀",
  "💡",
  "🔥",
  "👍",
  "👎",
  "❤️",
  "🎯",
  "💬",
  "📝",
];

export function normRect(ann: { x: number; y: number; w: number; h: number }) {
  const x = ann.w < 0 ? ann.x + ann.w : ann.x;
  const y = ann.h < 0 ? ann.y + ann.h : ann.y;
  return { x, y, w: Math.abs(ann.w), h: Math.abs(ann.h) };
}

function distToSeg(p: Point, a: Point, b: Point) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = dx * dx + dy * dy || 1;
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / len));
  const x = a.x + t * dx;
  const y = a.y + t * dy;
  return Math.hypot(p.x - x, p.y - y);
}

export function arrowPolygon(x1: number, y1: number, x2: number, y2: number, strokeWidth: number): Point[] {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.hypot(dx, dy);
  if (length < 0.5) {
    const s = Math.max(6, strokeWidth);
    return [
      { x: x2, y: y2 - s * 1.2 },
      { x: x2 + s, y: y2 + s * 0.7 },
      { x: x2 - s, y: y2 + s * 0.7 },
    ];
  }
  const ux = dx / length;
  const uy = dy / length;
  const px = -uy;
  const py = ux;
  const shaft = Math.max(1.5, strokeWidth);
  const headLen = Math.min(length * 0.5, Math.max(shaft * 4.2, 24));
  const headHalf = Math.max(shaft * 1.5 + 3, headLen * 0.48);
  const half = shaft / 2;
  const neck = Math.max(0, length - headLen);
  const nx = x1 + ux * neck;
  const ny = y1 + uy * neck;
  return [
    { x: x1 + px * half, y: y1 + py * half },
    { x: nx + px * half, y: ny + py * half },
    { x: nx + px * headHalf, y: ny + py * headHalf },
    { x: x2, y: y2 },
    { x: nx - px * headHalf, y: ny - py * headHalf },
    { x: nx - px * half, y: ny - py * half },
    { x: x1 - px * half, y: y1 - py * half },
  ];
}

export function arrowPointsAttr(x1: number, y1: number, x2: number, y2: number, strokeWidth: number) {
  return arrowPolygon(x1, y1, x2, y2, strokeWidth)
    .map((p) => `${p.x},${p.y}`)
    .join(" ");
}

export function fillArrow(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  strokeWidth: number,
) {
  const pts = arrowPolygon(x1, y1, x2, y2, strokeWidth);
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.closePath();
  ctx.lineJoin = "miter";
  ctx.miterLimit = 3;
  ctx.fill();
}

export function hitTest(ann: Annotation, p: Point): boolean {
  if (ann.type === "pen" || ann.type === "highlight") {
    const tol = Math.max(10, ann.strokeWidth);
    return ann.points.some((pt, i) => i > 0 && distToSeg(p, ann.points[i - 1], pt) < tol);
  }
  if (ann.type === "line" || ann.type === "arrow") {
    const pad = ann.type === "arrow" ? Math.max(16, ann.strokeWidth * 3) : 12;
    return distToSeg(p, { x: ann.x, y: ann.y }, { x: ann.x + ann.w, y: ann.y + ann.h }) < pad;
  }
  if (ann.type === "text") {
    return p.x >= ann.x && p.x <= ann.x + ann.w && p.y >= ann.y && p.y <= ann.y + ann.fontSize * 3.2;
  }
  if (ann.type === "emoji") {
    return p.x >= ann.x && p.x <= ann.x + ann.size && p.y >= ann.y && p.y <= ann.y + ann.size;
  }
  if (ann.type === "image" || ann.type === "rect" || ann.type === "ellipse" || ann.type === "blur") {
    const { x, y, w, h } = normRect(ann);
    return p.x >= x && p.x <= x + w && p.y >= y && p.y <= y + h;
  }
  return false;
}

export function moveAnnotation(ann: Annotation, dx: number, dy: number): Annotation {
  switch (ann.type) {
    case "pen":
    case "highlight":
      return { ...ann, points: ann.points.map((pt) => ({ x: pt.x + dx, y: pt.y + dy })) };
    case "emoji":
    case "text":
    case "image":
    case "rect":
    case "ellipse":
    case "arrow":
    case "line":
    case "blur":
      return { ...ann, x: ann.x + dx, y: ann.y + dy };
  }
}

export function offsetAll(annotations: Annotation[], dx: number, dy: number): Annotation[] {
  return annotations.map((ann) => moveAnnotation(ann, dx, dy));
}

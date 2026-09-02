import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  ArrowUpRight,
  Camera,
  Circle,
  Copy,
  Crop,
  Download,
  Eraser,
  FileText,
  Highlighter,
  ImagePlus,
  Minus,
  MousePointer2,
  Pencil,
  Redo2,
  Settings,
  Smile,
  Square,
  Trash2,
  Type,
  Undo2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { hydrateCaptureFromSession, useCapture } from "@/lib/capture-store";
import { getSettings } from "@/lib/settings";
import { rasterize } from "@/lib/rasterize";
import { canvasToBlob, blobToDataUrl, copyPng, exportCaptureFile } from "@/lib/image-io";
import { DRAW_COLORS, STAMP_EMOJI, arrowPointsAttr, hitTest, moveAnnotation, offsetAll } from "@/lib/annotate";
import { uid } from "@/lib/utils";
import { HiddenFileInput } from "@/components/hidden-file-input";
import type { Annotation, CropRect, Point, ShapeAnn, StrokeAnn, Tool } from "@/lib/types";

const TOOLS: { id: Tool; label: string; icon: typeof MousePointer2 }[] = [
  { id: "select", label: "Select", icon: MousePointer2 },
  { id: "crop", label: "Crop", icon: Crop },
  { id: "pen", label: "Pen", icon: Pencil },
  { id: "highlight", label: "Highlight", icon: Highlighter },
  { id: "rect", label: "Rectangle", icon: Square },
  { id: "ellipse", label: "Ellipse", icon: Circle },
  { id: "arrow", label: "Arrow", icon: ArrowUpRight },
  { id: "line", label: "Line", icon: Minus },
  { id: "text", label: "Text", icon: Type },
  { id: "emoji", label: "Stamp", icon: Smile },
  { id: "image", label: "Image", icon: ImagePlus },
  { id: "blur", label: "Redact", icon: Eraser },
];

export function EditorView() {
  const current = useCapture((s) => s.current);
  const annotations = useCapture((s) => s.annotations);
  const crop = useCapture((s) => s.crop);
  const commit = useCapture((s) => s.commit);
  const undo = useCapture((s) => s.undo);
  const redo = useCapture((s) => s.redo);
  const setCrop = useCapture((s) => s.setCrop);
  const replaceImage = useCapture((s) => s.replaceImage);
  const setAnnotations = useCapture((s) => s.setAnnotations);

  const [tool, setTool] = useState<Tool>("select");
  const [color, setColor] = useState(DRAW_COLORS[0]);
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [zoom, setZoom] = useState(0.45);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [emoji, setEmoji] = useState("⭐");
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const draftRef = useRef<Annotation | null>(null);
  const [, force] = useState(0);
  const dragRef = useRef<{ id: string; last: Point } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const pendingImage = useRef<string | null>(null);

  useEffect(() => {
    void hydrateCaptureFromSession();
  }, []);

  useEffect(() => {
    if (!current) return;
    const available = Math.max(280, window.innerWidth - 48);
    setZoom(Math.min(0.9, available / current.width));
  }, [current?.id, current?.width]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (meta && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if (meta && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void exportNow("image");
      } else if (meta && e.key.toLowerCase() === "c" && !window.getSelection()?.toString()) {
        e.preventDefault();
        void exportNow("copy");
      } else if (e.key === "Escape") {
        setTool("select");
        setSelectedId(null);
        setMenu(null);
        setCrop(null);
      } else if ((e.key === "Backspace" || e.key === "Delete") && selectedId) {
        e.preventDefault();
        commit(annotations.filter((a) => a.id !== selectedId));
        setSelectedId(null);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const size = useMemo(
    () => (current ? { w: current.width, h: current.height } : { w: 1200, h: 800 }),
    [current],
  );

  function pointFromEvent(e: React.PointerEvent): Point {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * size.w,
      y: ((e.clientY - rect.top) / rect.height) * size.h,
    };
  }

  function onPointerDown(e: React.PointerEvent) {
    if (!current || e.button !== 0) return;
    try {
      (e.currentTarget as Element).setPointerCapture(e.pointerId);
    } catch {
      // Synthetic events (tests) may not allow capture.
    }
    const p = pointFromEvent(e);
    if (tool === "select") {
      const hit = [...annotations].reverse().find((a) => hitTest(a, p));
      setSelectedId(hit?.id ?? null);
      if (hit) dragRef.current = { id: hit.id, last: p };
      return;
    }
    if (tool === "crop") {
      setCrop({ x: p.x, y: p.y, w: 0, h: 0 });
      return;
    }
    if (tool === "emoji") {
      const stamp: Annotation = {
        id: uid(),
        type: "emoji",
        x: p.x,
        y: p.y,
        size: 48,
        emoji,
        color,
        strokeWidth,
      };
      commit([...annotations, stamp]);
      return;
    }
    if (tool === "image") {
      if (!pendingImage.current) {
        fileRef.current?.click();
        return;
      }
      const stamp: Annotation = {
        id: uid(),
        type: "image",
        x: p.x,
        y: p.y,
        w: 240,
        h: 160,
        src: pendingImage.current,
        color,
        strokeWidth,
      };
      commit([...annotations, stamp]);
      pendingImage.current = null;
      return;
    }
    if (tool === "text") {
      const text: Annotation = {
        id: uid(),
        type: "text",
        x: p.x,
        y: p.y,
        w: 280,
        fontSize: 28,
        text: "Type here",
        color,
        strokeWidth,
      };
      commit([...annotations, text]);
      setSelectedId(text.id);
      setTool("select");
      return;
    }
    if (tool === "pen" || tool === "highlight") {
      const stroke: StrokeAnn = {
        id: uid(),
        type: tool,
        points: [p],
        color,
        strokeWidth,
      };
      draftRef.current = stroke;
      force((n) => n + 1);
      return;
    }
    const shape: ShapeAnn = {
      id: uid(),
      type: tool,
      x: p.x,
      y: p.y,
      w: 0,
      h: 0,
      color,
      strokeWidth,
      filled: tool === "rect" || tool === "ellipse",
    };
    draftRef.current = shape;
    force((n) => n + 1);
  }

  function onPointerMove(e: React.PointerEvent) {
    const p = pointFromEvent(e);
    if (tool === "crop" && e.buttons === 1 && crop) {
      setCrop({ ...crop, w: p.x - crop.x, h: p.y - crop.y });
      return;
    }
    if (dragRef.current && e.buttons === 1) {
      const { id, last } = dragRef.current;
      const dx = p.x - last.x;
      const dy = p.y - last.y;
      setAnnotations((prev) => prev.map((a) => (a.id === id ? moveAnnotation(a, dx, dy) : a)));
      dragRef.current = { id, last: p };
      return;
    }
    const draft = draftRef.current;
    if (!draft || e.buttons !== 1) return;
    if (draft.type === "pen" || draft.type === "highlight") {
      draft.points = [...draft.points, p];
    } else if (
      draft.type === "rect" ||
      draft.type === "ellipse" ||
      draft.type === "arrow" ||
      draft.type === "line" ||
      draft.type === "blur"
    ) {
      draft.w = p.x - draft.x;
      draft.h = p.y - draft.y;
    }
    force((n) => n + 1);
  }

  function onPointerUp() {
    if (dragRef.current) {
      dragRef.current = null;
      commit(useCapture.getState().annotations);
      return;
    }
    const draft = draftRef.current;
    if (draft) {
      draftRef.current = null;
      commit([...annotations, draft]);
    }
  }

  async function exportNow(kind: "image" | "pdf" | "copy") {
    if (!current) return;
    setBusy(true);
    try {
      const canvas = await rasterize(current.dataUrl, annotations, normalizeCrop(crop, size.w, size.h));
      if (kind === "copy") {
        await copyPng(canvas);
        toast.success("Copied image");
      } else {
        await exportCaptureFile(canvas, current, getSettings(), kind);
        toast.success(kind === "pdf" ? "PDF saved" : "Downloaded");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Export failed");
    } finally {
      setBusy(false);
      setMenu(null);
    }
  }

  async function applyCrop() {
    if (!current || !crop) return;
    const n = normalizeCrop(crop, current.width, current.height);
    if (!n || n.w < 8 || n.h < 8) return;
    setBusy(true);
    try {
      const canvas = await rasterize(current.dataUrl, [], n);
      const settings = getSettings();
      const blob = await canvasToBlob(canvas, current.format, settings.quality);
      replaceImage({
        ...current,
        dataUrl: await blobToDataUrl(blob),
        width: canvas.width,
        height: canvas.height,
      });
      commit(offsetAll(annotations, -n.x, -n.y));
      toast.success("Crop applied");
    } finally {
      setBusy(false);
    }
  }

  const draft = draftRef.current;
  const allAnns = draft ? [...annotations, draft] : annotations;
  const cropN = crop ? normalizeCrop(crop, size.w, size.h) : null;

  if (!current) {
    return (
      <div className="flex min-h-[70dvh] flex-col items-center justify-center px-6 text-center">
        <Camera className="size-8 text-muted" />
        <h1 className="font-display mt-4 text-3xl">No capture yet</h1>
        <p className="mt-2 max-w-md text-muted">
          Capture a sample page, upload a screenshot, or paste an image to open it here.
        </p>
        <Button asChild className="mt-6">
          <Link to="/">Go to studio</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <header className="flex flex-wrap items-center gap-2 border-b border-border bg-bg px-3 py-2">
        <Link to="/" className="mr-1 flex items-center gap-2 px-1 text-fg">
          <Camera className="size-4" />
          <span className="font-display hidden text-lg sm:inline">Longshot</span>
        </Link>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm">{current.title}</p>
          <p className="truncate text-xs text-muted tabular-nums">
            {current.width} × {current.height} · {current.format.toUpperCase()}
          </p>
        </div>
        <Button variant="ghost" size="icon-sm" onClick={undo} aria-label="Undo">
          <Undo2 />
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={redo} aria-label="Redo">
          <Redo2 />
        </Button>
        <Button variant="secondary" size="sm" onClick={() => void exportNow("copy")} disabled={busy}>
          <Copy /> Copy
        </Button>
        <Button variant="secondary" size="sm" onClick={() => void exportNow("image")} disabled={busy}>
          <Download /> Download
        </Button>
        <Button size="sm" onClick={() => void exportNow("pdf")} disabled={busy}>
          <FileText /> PDF
        </Button>
        <Button variant="ghost" size="icon-sm" asChild aria-label="Settings">
          <Link to="/settings">
            <Settings />
          </Link>
        </Button>
      </header>

      <div className="flex flex-wrap items-center gap-1 border-b border-border bg-surface px-2 py-2">
        {TOOLS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              title={t.label}
              onClick={() => {
                setTool(t.id);
                if (t.id === "image") fileRef.current?.click();
              }}
              className={`inline-flex size-11 items-center justify-center rounded-md transition-colors ${
                tool === t.id ? "bg-primary text-primary-fg" : "text-muted hover:bg-surface-2 hover:text-fg"
              }`}
            >
              <Icon className="size-4" />
              <span className="sr-only">{t.label}</span>
            </button>
          );
        })}
        <div className="mx-2 hidden h-6 w-px bg-border sm:block" />
        <div className="flex items-center gap-1">
          {DRAW_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={`Color ${c}`}
              onClick={() => setColor(c)}
              className="size-7 rounded-full border border-border"
              style={{
                background: c,
                outline: color === c ? "2px solid var(--color-primary)" : undefined,
                outlineOffset: 2,
              }}
            />
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2 px-2">
          <span className="hidden text-xs text-muted sm:inline">Stroke</span>
          <div className="w-24">
            <Slider min={1} max={16} step={1} value={[strokeWidth]} onValueChange={([v]) => setStrokeWidth(v)} />
          </div>
          {tool === "emoji" && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="secondary" size="sm">
                  {emoji} Stamp
                </Button>
              </PopoverTrigger>
              <PopoverContent className="grid w-64 grid-cols-5 gap-1">
                {STAMP_EMOJI.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className="flex size-11 items-center justify-center rounded-md text-xl hover:bg-surface-2"
                    onClick={() => setEmoji(item)}
                  >
                    {item}
                  </button>
                ))}
              </PopoverContent>
            </Popover>
          )}
          {tool === "crop" && crop && (
            <Button size="sm" onClick={() => void applyCrop()}>
              Apply crop
            </Button>
          )}
          {selectedId && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                commit(annotations.filter((a) => a.id !== selectedId));
                setSelectedId(null);
              }}
            >
              <Trash2 /> Delete
            </Button>
          )}
        </div>
      </div>

      <div className="relative flex-1 overflow-auto checkerboard">
        <div className="flex min-h-full justify-center p-6 md:p-10">
          <div
            className="relative shadow-soft"
            style={{ width: size.w * zoom, height: size.h * zoom }}
            onContextMenu={(e) => {
              e.preventDefault();
              setMenu({ x: e.clientX, y: e.clientY });
            }}
          >
            <img
              src={current.dataUrl}
              alt={current.title}
              className="pointer-events-none absolute inset-0 h-full w-full select-none"
              draggable={false}
            />
            <svg
              ref={svgRef}
              viewBox={`0 0 ${size.w} ${size.h}`}
              className="absolute inset-0 h-full w-full touch-none"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
            >
              {allAnns.map((ann) => (
                <AnnotationNode key={ann.id} ann={ann} selected={ann.id === selectedId} />
              ))}
              {cropN && (
                <g>
                  <path
                    d={`M0 0 H${size.w} V${size.h} H0 Z M${cropN.x} ${cropN.y} H${cropN.x + cropN.w} V${cropN.y + cropN.h} H${cropN.x} Z`}
                    fill="rgba(14,14,16,0.55)"
                    fillRule="evenodd"
                  />
                  <rect
                    x={cropN.x}
                    y={cropN.y}
                    width={cropN.w}
                    height={cropN.h}
                    fill="none"
                    stroke="#d2d6d0"
                    strokeWidth="2"
                    strokeDasharray="6 4"
                  />
                </g>
              )}
            </svg>
            {annotations
              .filter((a) => a.type === "text")
              .map((ann) =>
                ann.type === "text" && selectedId === ann.id ? (
                  <textarea
                    key={ann.id}
                    value={ann.text}
                    onChange={(e) =>
                      setAnnotations((prev) =>
                        prev.map((item) => (item.id === ann.id && item.type === "text" ? { ...item, text: e.target.value } : item)),
                      )
                    }
                    className="absolute resize-none bg-transparent p-0 font-sans outline-none"
                    style={{
                      left: ann.x * zoom,
                      top: ann.y * zoom,
                      width: ann.w * zoom,
                      height: ann.fontSize * 3.2 * zoom,
                      color: ann.color,
                      fontSize: ann.fontSize * zoom,
                      lineHeight: 1.3,
                    }}
                  />
                ) : null,
              )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 border-t border-border bg-bg px-3 py-2">
        <Button variant="ghost" size="icon-sm" onClick={() => setZoom((z) => Math.max(0.15, z - 0.1))} aria-label="Zoom out">
          <ZoomOut />
        </Button>
        <span className="w-14 text-center text-xs tabular-nums text-muted">{Math.round(zoom * 100)}%</span>
        <Button variant="ghost" size="icon-sm" onClick={() => setZoom((z) => Math.min(2, z + 0.1))} aria-label="Zoom in">
          <ZoomIn />
        </Button>
      </div>

      {menu && (
        <div
          className="fixed z-50 min-w-48 rounded-lg border border-border bg-surface p-1 shadow-soft"
          style={{ left: menu.x, top: menu.y }}
          onMouseLeave={() => setMenu(null)}
        >
          <MenuRow icon={<Copy className="size-4" />} label="Copy image" onClick={() => void exportNow("copy")} />
          <MenuRow icon={<Download className="size-4" />} label="Download" onClick={() => void exportNow("image")} />
          <MenuRow icon={<FileText className="size-4" />} label="Save as PDF" onClick={() => void exportNow("pdf")} />
        </div>
      )}

      <HiddenFileInput
        ref={fileRef}
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          const reader = new FileReader();
          reader.onload = () => {
            pendingImage.current = String(reader.result);
            setTool("image");
            toast.message("Click the screenshot to place the image");
          };
          reader.readAsDataURL(file);
        }}
      />
    </div>
  );
}

function MenuRow({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-10 w-full items-center gap-2 rounded-md px-3 text-sm hover:bg-surface-2"
    >
      {icon}
      {label}
    </button>
  );
}

function normalizeCrop(crop: CropRect | null, maxW: number, maxH: number): CropRect | null {
  if (!crop) return null;
  const x = crop.w < 0 ? crop.x + crop.w : crop.x;
  const y = crop.h < 0 ? crop.y + crop.h : crop.y;
  const w = Math.abs(crop.w);
  const h = Math.abs(crop.h);
  const nx = Math.max(0, x);
  const ny = Math.max(0, y);
  return {
    x: nx,
    y: ny,
    w: Math.min(maxW - nx, w),
    h: Math.min(maxH - ny, h),
  };
}

function AnnotationNode({ ann, selected }: { ann: Annotation; selected: boolean }) {
  const stroke = selected ? "#d2d6d0" : ann.color;
  if (ann.type === "pen" || ann.type === "highlight") {
    const d = ann.points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x} ${p.y}`).join(" ");
    return (
      <path
        d={d}
        fill="none"
        stroke={ann.color}
        strokeWidth={ann.type === "highlight" ? Math.max(12, ann.strokeWidth * 3) : ann.strokeWidth}
        strokeOpacity={ann.type === "highlight" ? 0.35 : 1}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    );
  }
  if (ann.type === "rect" || ann.type === "blur") {
    const x = ann.w < 0 ? ann.x + ann.w : ann.x;
    const y = ann.h < 0 ? ann.y + ann.h : ann.y;
    return (
      <rect
        x={x}
        y={y}
        width={Math.abs(ann.w)}
        height={Math.abs(ann.h)}
        fill={ann.type === "blur" ? "rgba(20,20,22,0.35)" : ann.filled ? ann.color : "none"}
        fillOpacity={ann.type === "rect" && ann.filled ? 0.2 : ann.type === "blur" ? 1 : 0}
        stroke={stroke}
        strokeWidth={ann.strokeWidth}
      />
    );
  }
  if (ann.type === "ellipse") {
    return (
      <ellipse
        cx={ann.x + ann.w / 2}
        cy={ann.y + ann.h / 2}
        rx={Math.abs(ann.w / 2)}
        ry={Math.abs(ann.h / 2)}
        fill={ann.filled ? ann.color : "none"}
        fillOpacity={ann.filled ? 0.2 : 0}
        stroke={stroke}
        strokeWidth={ann.strokeWidth}
      />
    );
  }
  if (ann.type === "line") {
    return (
      <line
        x1={ann.x}
        y1={ann.y}
        x2={ann.x + ann.w}
        y2={ann.y + ann.h}
        stroke={stroke}
        strokeWidth={ann.strokeWidth}
        strokeLinecap="round"
      />
    );
  }
  if (ann.type === "arrow") {
    return (
      <polygon
        points={arrowPointsAttr(ann.x, ann.y, ann.x + ann.w, ann.y + ann.h, ann.strokeWidth)}
        fill={ann.color}
        stroke={selected ? "#d2d6d0" : ann.color}
        strokeWidth={selected ? Math.max(1, ann.strokeWidth * 0.25) : 0.5}
        strokeLinejoin="miter"
        strokeLinecap="butt"
      />
    );
  }
  if (ann.type === "emoji") {
    return (
      <text x={ann.x} y={ann.y + ann.size * 0.85} fontSize={ann.size}>
        {ann.emoji}
      </text>
    );
  }
  if (ann.type === "image") {
    return (
      <g>
        <image href={ann.src} x={ann.x} y={ann.y} width={ann.w} height={ann.h} />
        {selected && (
          <rect x={ann.x} y={ann.y} width={ann.w} height={ann.h} fill="none" stroke="#d2d6d0" strokeWidth="2" />
        )}
      </g>
    );
  }
  if (ann.type === "text") {
    return selected ? null : (
      <text x={ann.x} y={ann.y + ann.fontSize} fill={ann.color} fontSize={ann.fontSize} fontFamily="Outfit, sans-serif">
        {ann.text}
      </text>
    );
  }
  return null;
}

import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { i as uid, n as cn, t as Button } from "./button-CnapSl3a.mjs";
import { i as Trigger, n as Portal, r as Root2, t as Content2 } from "../_libs/@radix-ui/react-popover+[...].mjs";
import { t as Slider } from "./slider-A_M9W9vT.mjs";
import { a as canvasToBlob, c as exportCaptureFile, d as moveAnnotation, f as offsetAll, i as blobToDataUrl, l as hitTest, m as useCapture, n as STAMP_EMOJI, p as rasterize, r as arrowPointsAttr, s as copyPng, t as DRAW_COLORS, u as hydrateCaptureFromSession } from "./rasterize-BPFgz4DC.mjs";
import { t as getSettings } from "./settings-4FbQ754E.mjs";
import { t as HiddenFileInput } from "./hidden-file-input-e6k7Mq9B.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { A as Camera, C as Download, D as Circle, S as Eraser, T as Copy, _ as ImagePlus, a as Type, c as Square, d as Settings, f as Redo2, g as Minus, h as MousePointer2, i as Undo2, j as ArrowUpRight, l as Smile, m as Pencil, n as ZoomOut, s as Trash2, t as ZoomIn, v as Highlighter, w as Crop, x as FileText } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/editor-DAtrG4A4.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Popover(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root2, { ...props });
}
function PopoverTrigger(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trigger, { ...props });
}
function PopoverContent({ className, align = "center", sideOffset = 8, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
		align,
		sideOffset,
		className: cn("z-50 w-72 rounded-lg border border-border bg-surface p-3 shadow-soft", className),
		...props
	}) });
}
var TOOLS = [
	{
		id: "select",
		label: "Select",
		icon: MousePointer2
	},
	{
		id: "crop",
		label: "Crop",
		icon: Crop
	},
	{
		id: "pen",
		label: "Pen",
		icon: Pencil
	},
	{
		id: "highlight",
		label: "Highlight",
		icon: Highlighter
	},
	{
		id: "rect",
		label: "Rectangle",
		icon: Square
	},
	{
		id: "ellipse",
		label: "Ellipse",
		icon: Circle
	},
	{
		id: "arrow",
		label: "Arrow",
		icon: ArrowUpRight
	},
	{
		id: "line",
		label: "Line",
		icon: Minus
	},
	{
		id: "text",
		label: "Text",
		icon: Type
	},
	{
		id: "emoji",
		label: "Stamp",
		icon: Smile
	},
	{
		id: "image",
		label: "Image",
		icon: ImagePlus
	},
	{
		id: "blur",
		label: "Redact",
		icon: Eraser
	}
];
function EditorView() {
	const current = useCapture((s) => s.current);
	const annotations = useCapture((s) => s.annotations);
	const crop = useCapture((s) => s.crop);
	const commit = useCapture((s) => s.commit);
	const undo = useCapture((s) => s.undo);
	const redo = useCapture((s) => s.redo);
	const setCrop = useCapture((s) => s.setCrop);
	const replaceImage = useCapture((s) => s.replaceImage);
	const setAnnotations = useCapture((s) => s.setAnnotations);
	const [tool, setTool] = (0, import_react.useState)("select");
	const [color, setColor] = (0, import_react.useState)(DRAW_COLORS[0]);
	const [strokeWidth, setStrokeWidth] = (0, import_react.useState)(4);
	const [zoom, setZoom] = (0, import_react.useState)(.45);
	const [selectedId, setSelectedId] = (0, import_react.useState)(null);
	const [emoji, setEmoji] = (0, import_react.useState)("⭐");
	const [menu, setMenu] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const draftRef = (0, import_react.useRef)(null);
	const [, force] = (0, import_react.useState)(0);
	const dragRef = (0, import_react.useRef)(null);
	const svgRef = (0, import_react.useRef)(null);
	const fileRef = (0, import_react.useRef)(null);
	const pendingImage = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		hydrateCaptureFromSession();
	}, []);
	(0, import_react.useEffect)(() => {
		if (!current) return;
		const available = Math.max(280, window.innerWidth - 48);
		setZoom(Math.min(.9, available / current.width));
	}, [current?.id, current?.width]);
	(0, import_react.useEffect)(() => {
		function onKey(e) {
			const meta = e.metaKey || e.ctrlKey;
			if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
			if (meta && e.key.toLowerCase() === "z") {
				e.preventDefault();
				if (e.shiftKey) redo();
				else undo();
			} else if (meta && e.key.toLowerCase() === "s") {
				e.preventDefault();
				exportNow("image");
			} else if (meta && e.key.toLowerCase() === "c" && !window.getSelection()?.toString()) {
				e.preventDefault();
				exportNow("copy");
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
	const size = (0, import_react.useMemo)(() => current ? {
		w: current.width,
		h: current.height
	} : {
		w: 1200,
		h: 800
	}, [current]);
	function pointFromEvent(e) {
		const svg = svgRef.current;
		if (!svg) return {
			x: 0,
			y: 0
		};
		const rect = svg.getBoundingClientRect();
		return {
			x: (e.clientX - rect.left) / rect.width * size.w,
			y: (e.clientY - rect.top) / rect.height * size.h
		};
	}
	function onPointerDown(e) {
		if (!current || e.button !== 0) return;
		try {
			e.currentTarget.setPointerCapture(e.pointerId);
		} catch {}
		const p = pointFromEvent(e);
		if (tool === "select") {
			const hit = [...annotations].reverse().find((a) => hitTest(a, p));
			setSelectedId(hit?.id ?? null);
			if (hit) dragRef.current = {
				id: hit.id,
				last: p
			};
			return;
		}
		if (tool === "crop") {
			setCrop({
				x: p.x,
				y: p.y,
				w: 0,
				h: 0
			});
			return;
		}
		if (tool === "emoji") {
			const stamp = {
				id: uid(),
				type: "emoji",
				x: p.x,
				y: p.y,
				size: 48,
				emoji,
				color,
				strokeWidth
			};
			commit([...annotations, stamp]);
			return;
		}
		if (tool === "image") {
			if (!pendingImage.current) {
				fileRef.current?.click();
				return;
			}
			const stamp = {
				id: uid(),
				type: "image",
				x: p.x,
				y: p.y,
				w: 240,
				h: 160,
				src: pendingImage.current,
				color,
				strokeWidth
			};
			commit([...annotations, stamp]);
			pendingImage.current = null;
			return;
		}
		if (tool === "text") {
			const text = {
				id: uid(),
				type: "text",
				x: p.x,
				y: p.y,
				w: 280,
				fontSize: 28,
				text: "Type here",
				color,
				strokeWidth
			};
			commit([...annotations, text]);
			setSelectedId(text.id);
			setTool("select");
			return;
		}
		if (tool === "pen" || tool === "highlight") {
			const stroke = {
				id: uid(),
				type: tool,
				points: [p],
				color,
				strokeWidth
			};
			draftRef.current = stroke;
			force((n) => n + 1);
			return;
		}
		const shape = {
			id: uid(),
			type: tool,
			x: p.x,
			y: p.y,
			w: 0,
			h: 0,
			color,
			strokeWidth,
			filled: tool === "rect" || tool === "ellipse"
		};
		draftRef.current = shape;
		force((n) => n + 1);
	}
	function onPointerMove(e) {
		const p = pointFromEvent(e);
		if (tool === "crop" && e.buttons === 1 && crop) {
			setCrop({
				...crop,
				w: p.x - crop.x,
				h: p.y - crop.y
			});
			return;
		}
		if (dragRef.current && e.buttons === 1) {
			const { id, last } = dragRef.current;
			const dx = p.x - last.x;
			const dy = p.y - last.y;
			setAnnotations((prev) => prev.map((a) => a.id === id ? moveAnnotation(a, dx, dy) : a));
			dragRef.current = {
				id,
				last: p
			};
			return;
		}
		const draft = draftRef.current;
		if (!draft || e.buttons !== 1) return;
		if (draft.type === "pen" || draft.type === "highlight") draft.points = [...draft.points, p];
		else if (draft.type === "rect" || draft.type === "ellipse" || draft.type === "arrow" || draft.type === "line" || draft.type === "blur") {
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
	async function exportNow(kind) {
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
				height: canvas.height
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
	if (!current) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-[70dvh] flex-col items-center justify-center px-6 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { className: "size-8 text-muted" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display mt-4 text-3xl",
				children: "No capture yet"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 max-w-md text-muted",
				children: "Capture a sample page, upload a screenshot, or paste an image to open it here."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				className: "mt-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					children: "Go to studio"
				})
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh flex-col bg-canvas",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-wrap items-center gap-2 border-b border-border bg-bg px-3 py-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/",
						className: "mr-1 flex items-center gap-2 px-1 text-fg",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-display hidden text-lg sm:inline",
							children: "Longshot"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-sm",
							children: current.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "truncate text-xs text-muted tabular-nums",
							children: [
								current.width,
								" × ",
								current.height,
								" · ",
								current.format.toUpperCase()
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon-sm",
						onClick: undo,
						"aria-label": "Undo",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Undo2, {})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon-sm",
						onClick: redo,
						"aria-label": "Redo",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Redo2, {})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "secondary",
						size: "sm",
						onClick: () => void exportNow("copy"),
						disabled: busy,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, {}), " Copy"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "secondary",
						size: "sm",
						onClick: () => void exportNow("image"),
						disabled: busy,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {}), " Download"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						onClick: () => void exportNow("pdf"),
						disabled: busy,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, {}), " PDF"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon-sm",
						asChild: true,
						"aria-label": "Settings",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/settings",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, {})
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-1 border-b border-border bg-surface px-2 py-2",
				children: [
					TOOLS.map((t) => {
						const Icon = t.icon;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							title: t.label,
							onClick: () => {
								setTool(t.id);
								if (t.id === "image") fileRef.current?.click();
							},
							className: `inline-flex size-11 items-center justify-center rounded-md transition-colors ${tool === t.id ? "bg-primary text-primary-fg" : "text-muted hover:bg-surface-2 hover:text-fg"}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "sr-only",
								children: t.label
							})]
						}, t.id);
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mx-2 hidden h-6 w-px bg-border sm:block" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex items-center gap-1",
						children: DRAW_COLORS.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-label": `Color ${c}`,
							onClick: () => setColor(c),
							className: "size-7 rounded-full border border-border",
							style: {
								background: c,
								outline: color === c ? "2px solid var(--color-primary)" : void 0,
								outlineOffset: 2
							}
						}, c))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "ml-auto flex items-center gap-2 px-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "hidden text-xs text-muted sm:inline",
								children: "Stroke"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "w-24",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
									min: 1,
									max: 16,
									step: 1,
									value: [strokeWidth],
									onValueChange: ([v]) => setStrokeWidth(v)
								})
							}),
							tool === "emoji" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "secondary",
									size: "sm",
									children: [emoji, " Stamp"]
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverContent, {
								className: "grid w-64 grid-cols-5 gap-1",
								children: STAMP_EMOJI.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "flex size-11 items-center justify-center rounded-md text-xl hover:bg-surface-2",
									onClick: () => setEmoji(item),
									children: item
								}, item))
							})] }),
							tool === "crop" && crop && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								onClick: () => void applyCrop(),
								children: "Apply crop"
							}),
							selectedId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "danger",
								size: "sm",
								onClick: () => {
									commit(annotations.filter((a) => a.id !== selectedId));
									setSelectedId(null);
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {}), " Delete"]
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative flex-1 overflow-auto checkerboard",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex min-h-full justify-center p-6 md:p-10",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative shadow-soft",
						style: {
							width: size.w * zoom,
							height: size.h * zoom
						},
						onContextMenu: (e) => {
							e.preventDefault();
							setMenu({
								x: e.clientX,
								y: e.clientY
							});
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: current.dataUrl,
								alt: current.title,
								className: "pointer-events-none absolute inset-0 h-full w-full select-none",
								draggable: false
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
								ref: svgRef,
								viewBox: `0 0 ${size.w} ${size.h}`,
								className: "absolute inset-0 h-full w-full touch-none",
								onPointerDown,
								onPointerMove,
								onPointerUp,
								children: [allAnns.map((ann) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnnotationNode, {
									ann,
									selected: ann.id === selectedId
								}, ann.id)), cropN && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
									d: `M0 0 H${size.w} V${size.h} H0 Z M${cropN.x} ${cropN.y} H${cropN.x + cropN.w} V${cropN.y + cropN.h} H${cropN.x} Z`,
									fill: "rgba(14,14,16,0.55)",
									fillRule: "evenodd"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
									x: cropN.x,
									y: cropN.y,
									width: cropN.w,
									height: cropN.h,
									fill: "none",
									stroke: "#d2d6d0",
									strokeWidth: "2",
									strokeDasharray: "6 4"
								})] })]
							}),
							annotations.filter((a) => a.type === "text").map((ann) => ann.type === "text" && selectedId === ann.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								value: ann.text,
								onChange: (e) => setAnnotations((prev) => prev.map((item) => item.id === ann.id && item.type === "text" ? {
									...item,
									text: e.target.value
								} : item)),
								className: "absolute resize-none bg-transparent p-0 font-sans outline-none",
								style: {
									left: ann.x * zoom,
									top: ann.y * zoom,
									width: ann.w * zoom,
									height: ann.fontSize * 3.2 * zoom,
									color: ann.color,
									fontSize: ann.fontSize * zoom,
									lineHeight: 1.3
								}
							}, ann.id) : null)
						]
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-center gap-2 border-t border-border bg-bg px-3 py-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon-sm",
						onClick: () => setZoom((z) => Math.max(.15, z - .1)),
						"aria-label": "Zoom out",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZoomOut, {})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "w-14 text-center text-xs tabular-nums text-muted",
						children: [Math.round(zoom * 100), "%"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon-sm",
						onClick: () => setZoom((z) => Math.min(2, z + .1)),
						"aria-label": "Zoom in",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZoomIn, {})
					})
				]
			}),
			menu && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "fixed z-50 min-w-48 rounded-lg border border-border bg-surface p-1 shadow-soft",
				style: {
					left: menu.x,
					top: menu.y
				},
				onMouseLeave: () => setMenu(null),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MenuRow, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-4" }),
						label: "Copy image",
						onClick: () => void exportNow("copy")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MenuRow, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }),
						label: "Download",
						onClick: () => void exportNow("image")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MenuRow, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-4" }),
						label: "Save as PDF",
						onClick: () => void exportNow("pdf")
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HiddenFileInput, {
				ref: fileRef,
				accept: "image/*",
				onChange: (e) => {
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
				}
			})
		]
	});
}
function MenuRow({ icon, label, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick,
		className: "flex h-10 w-full items-center gap-2 rounded-md px-3 text-sm hover:bg-surface-2",
		children: [icon, label]
	});
}
function normalizeCrop(crop, maxW, maxH) {
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
		h: Math.min(maxH - ny, h)
	};
}
function AnnotationNode({ ann, selected }) {
	const stroke = selected ? "#d2d6d0" : ann.color;
	if (ann.type === "pen" || ann.type === "highlight") {
		const d = ann.points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x} ${p.y}`).join(" ");
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d,
			fill: "none",
			stroke: ann.color,
			strokeWidth: ann.type === "highlight" ? Math.max(12, ann.strokeWidth * 3) : ann.strokeWidth,
			strokeOpacity: ann.type === "highlight" ? .35 : 1,
			strokeLinecap: "round",
			strokeLinejoin: "round"
		});
	}
	if (ann.type === "rect" || ann.type === "blur") {
		const x = ann.w < 0 ? ann.x + ann.w : ann.x;
		const y = ann.h < 0 ? ann.y + ann.h : ann.y;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
			x,
			y,
			width: Math.abs(ann.w),
			height: Math.abs(ann.h),
			fill: ann.type === "blur" ? "rgba(20,20,22,0.35)" : ann.filled ? ann.color : "none",
			fillOpacity: ann.type === "rect" && ann.filled ? .2 : ann.type === "blur" ? 1 : 0,
			stroke,
			strokeWidth: ann.strokeWidth
		});
	}
	if (ann.type === "ellipse") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
		cx: ann.x + ann.w / 2,
		cy: ann.y + ann.h / 2,
		rx: Math.abs(ann.w / 2),
		ry: Math.abs(ann.h / 2),
		fill: ann.filled ? ann.color : "none",
		fillOpacity: ann.filled ? .2 : 0,
		stroke,
		strokeWidth: ann.strokeWidth
	});
	if (ann.type === "line") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
		x1: ann.x,
		y1: ann.y,
		x2: ann.x + ann.w,
		y2: ann.y + ann.h,
		stroke,
		strokeWidth: ann.strokeWidth,
		strokeLinecap: "round"
	});
	if (ann.type === "arrow") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", {
		points: arrowPointsAttr(ann.x, ann.y, ann.x + ann.w, ann.y + ann.h, ann.strokeWidth),
		fill: ann.color,
		stroke: selected ? "#d2d6d0" : ann.color,
		strokeWidth: selected ? Math.max(1, ann.strokeWidth * .25) : .5,
		strokeLinejoin: "miter",
		strokeLinecap: "butt"
	});
	if (ann.type === "emoji") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
		x: ann.x,
		y: ann.y + ann.size * .85,
		fontSize: ann.size,
		children: ann.emoji
	});
	if (ann.type === "image") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("image", {
		href: ann.src,
		x: ann.x,
		y: ann.y,
		width: ann.w,
		height: ann.h
	}), selected && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
		x: ann.x,
		y: ann.y,
		width: ann.w,
		height: ann.h,
		fill: "none",
		stroke: "#d2d6d0",
		strokeWidth: "2"
	})] });
	if (ann.type === "text") return selected ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
		x: ann.x,
		y: ann.y + ann.fontSize,
		fill: ann.color,
		fontSize: ann.fontSize,
		fontFamily: "Outfit, sans-serif",
		children: ann.text
	});
	return null;
}
function EditorPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditorView, {});
}
//#endregion
export { EditorPage as component };

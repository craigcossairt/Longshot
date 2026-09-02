import { r as slugify } from "./button-CnapSl3a.mjs";
import { n as create } from "../_libs/zustand.mjs";
import { t as require_jspdf_node_min } from "../_libs/jspdf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/rasterize-BPFgz4DC.js
var import_jspdf_node_min = require_jspdf_node_min();
var DB_NAME = "longshot";
var STORE = "captures";
function openDb() {
	return new Promise((resolve, reject) => {
		const req = indexedDB.open(DB_NAME, 1);
		req.onupgradeneeded = () => {
			if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE);
		};
		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error);
	});
}
async function persistCapture(record) {
	if (typeof indexedDB === "undefined") return;
	try {
		const db = await openDb();
		await new Promise((resolve, reject) => {
			const tx = db.transaction(STORE, "readwrite");
			const store = tx.objectStore(STORE);
			if (record) store.put(record, "current");
			else store.delete("current");
			tx.oncomplete = () => resolve();
			tx.onerror = () => reject(tx.error);
		});
	} catch {}
}
async function readPersistedCapture() {
	if (typeof indexedDB === "undefined") return null;
	try {
		const db = await openDb();
		return await new Promise((resolve, reject) => {
			const req = db.transaction(STORE, "readonly").objectStore(STORE).get("current");
			req.onsuccess = () => resolve(req.result ?? null);
			req.onerror = () => reject(req.error);
		});
	} catch {
		return null;
	}
}
var useCapture = create((set, get) => ({
	current: null,
	annotations: [],
	crop: null,
	history: [],
	future: [],
	setCapture: (capture) => {
		persistCapture(capture);
		set({
			current: capture,
			annotations: [],
			crop: null,
			history: [],
			future: []
		});
	},
	replaceImage: (capture) => {
		persistCapture(capture);
		set({
			current: capture,
			crop: null
		});
	},
	setAnnotations: (next) => {
		set({ annotations: typeof next === "function" ? next(get().annotations) : next });
	},
	commit: (next) => {
		const { annotations, history } = get();
		set({
			annotations: next,
			history: [...history, annotations].slice(-80),
			future: []
		});
	},
	undo: () => {
		const { history, annotations, future } = get();
		const prev = history[history.length - 1];
		if (!prev) return;
		set({
			annotations: prev,
			history: history.slice(0, -1),
			future: [annotations, ...future].slice(0, 80)
		});
	},
	redo: () => {
		const { future, annotations, history } = get();
		const nxt = future[0];
		if (!nxt) return;
		set({
			annotations: nxt,
			future: future.slice(1),
			history: [...history, annotations].slice(-80)
		});
	},
	setCrop: (crop) => set({ crop }),
	resetEdits: () => set({
		annotations: [],
		crop: null,
		history: [],
		future: []
	})
}));
async function hydrateCaptureFromSession() {
	if (useCapture.getState().current) return;
	const stored = await readPersistedCapture();
	if (stored) useCapture.setState({ current: stored });
}
var DRAW_COLORS = [
	"#e15a4a",
	"#e08a3c",
	"#d2d6d0",
	"#3d9a6a",
	"#4a7ec4",
	"#f7f7f2",
	"#111111"
];
var STAMP_EMOJI = [
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
	"📝"
];
function normRect(ann) {
	return {
		x: ann.w < 0 ? ann.x + ann.w : ann.x,
		y: ann.h < 0 ? ann.y + ann.h : ann.y,
		w: Math.abs(ann.w),
		h: Math.abs(ann.h)
	};
}
function distToSeg(p, a, b) {
	const dx = b.x - a.x;
	const dy = b.y - a.y;
	const len = dx * dx + dy * dy || 1;
	const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / len));
	const x = a.x + t * dx;
	const y = a.y + t * dy;
	return Math.hypot(p.x - x, p.y - y);
}
function arrowPolygon(x1, y1, x2, y2, strokeWidth) {
	const dx = x2 - x1;
	const dy = y2 - y1;
	const length = Math.hypot(dx, dy);
	if (length < .5) {
		const s = Math.max(6, strokeWidth);
		return [
			{
				x: x2,
				y: y2 - s * 1.2
			},
			{
				x: x2 + s,
				y: y2 + s * .7
			},
			{
				x: x2 - s,
				y: y2 + s * .7
			}
		];
	}
	const ux = dx / length;
	const uy = dy / length;
	const px = -uy;
	const py = ux;
	const shaft = Math.max(1.5, strokeWidth);
	const headLen = Math.min(length * .5, Math.max(shaft * 4.2, 24));
	const headHalf = Math.max(shaft * 1.5 + 3, headLen * .48);
	const half = shaft / 2;
	const neck = Math.max(0, length - headLen);
	const nx = x1 + ux * neck;
	const ny = y1 + uy * neck;
	return [
		{
			x: x1 + px * half,
			y: y1 + py * half
		},
		{
			x: nx + px * half,
			y: ny + py * half
		},
		{
			x: nx + px * headHalf,
			y: ny + py * headHalf
		},
		{
			x: x2,
			y: y2
		},
		{
			x: nx - px * headHalf,
			y: ny - py * headHalf
		},
		{
			x: nx - px * half,
			y: ny - py * half
		},
		{
			x: x1 - px * half,
			y: y1 - py * half
		}
	];
}
function arrowPointsAttr(x1, y1, x2, y2, strokeWidth) {
	return arrowPolygon(x1, y1, x2, y2, strokeWidth).map((p) => `${p.x},${p.y}`).join(" ");
}
function fillArrow(ctx, x1, y1, x2, y2, strokeWidth) {
	const pts = arrowPolygon(x1, y1, x2, y2, strokeWidth);
	ctx.beginPath();
	ctx.moveTo(pts[0].x, pts[0].y);
	for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
	ctx.closePath();
	ctx.lineJoin = "miter";
	ctx.miterLimit = 3;
	ctx.fill();
}
function hitTest(ann, p) {
	if (ann.type === "pen" || ann.type === "highlight") {
		const tol = Math.max(10, ann.strokeWidth);
		return ann.points.some((pt, i) => i > 0 && distToSeg(p, ann.points[i - 1], pt) < tol);
	}
	if (ann.type === "line" || ann.type === "arrow") {
		const pad = ann.type === "arrow" ? Math.max(16, ann.strokeWidth * 3) : 12;
		return distToSeg(p, {
			x: ann.x,
			y: ann.y
		}, {
			x: ann.x + ann.w,
			y: ann.y + ann.h
		}) < pad;
	}
	if (ann.type === "text") return p.x >= ann.x && p.x <= ann.x + ann.w && p.y >= ann.y && p.y <= ann.y + ann.fontSize * 3.2;
	if (ann.type === "emoji") return p.x >= ann.x && p.x <= ann.x + ann.size && p.y >= ann.y && p.y <= ann.y + ann.size;
	if (ann.type === "image" || ann.type === "rect" || ann.type === "ellipse" || ann.type === "blur") {
		const { x, y, w, h } = normRect(ann);
		return p.x >= x && p.x <= x + w && p.y >= y && p.y <= y + h;
	}
	return false;
}
function moveAnnotation(ann, dx, dy) {
	switch (ann.type) {
		case "pen":
		case "highlight": return {
			...ann,
			points: ann.points.map((pt) => ({
				x: pt.x + dx,
				y: pt.y + dy
			}))
		};
		case "emoji":
		case "text":
		case "image":
		case "rect":
		case "ellipse":
		case "arrow":
		case "line":
		case "blur": return {
			...ann,
			x: ann.x + dx,
			y: ann.y + dy
		};
	}
}
function offsetAll(annotations, dx, dy) {
	return annotations.map((ann) => moveAnnotation(ann, dx, dy));
}
function extensionFor(format) {
	return format === "jpeg" ? "jpg" : format;
}
function buildFilename(capture, settings) {
	const date = new Date(capture.createdAt);
	const yyyy = date.getFullYear();
	const mm = String(date.getMonth() + 1).padStart(2, "0");
	const dd = String(date.getDate()).padStart(2, "0");
	const hh = String(date.getHours()).padStart(2, "0");
	const mi = String(date.getMinutes()).padStart(2, "0");
	const tokens = {
		"{title}": slugify(capture.title) || "capture",
		"{url}": slugify(capture.url.replace(/^https?:\/\//, "")) || "page",
		"{date}": `${yyyy}-${mm}-${dd}`,
		"{datetime}": `${yyyy}-${mm}-${dd}-${hh}${mi}`,
		"{width}": String(capture.width),
		"{height}": String(capture.height)
	};
	let name = settings.filenameTemplate || "{title}-{date}";
	for (const [token, value] of Object.entries(tokens)) name = name.split(token).join(value);
	name = slugify(name) || "capture";
	const folder = settings.downloadDirectory.replace(/^\/+|\/+$/g, "").replace(/\.\./g, "");
	const file = `${name}.${extensionFor(capture.format)}`;
	return folder ? `${folder}/${file}` : file;
}
function leafName(path) {
	return path.split("/").pop() ?? path;
}
function loadImage(src) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = () => reject(/* @__PURE__ */ new Error("Could not load image"));
		img.src = src;
	});
}
function canvasToBlob(canvas, format, quality) {
	if (canvas.width < 1 || canvas.height < 1) return Promise.reject(/* @__PURE__ */ new Error("Capture produced an empty image. Try again."));
	const mime = format === "jpeg" ? "image/jpeg" : format === "webp" ? "image/webp" : "image/png";
	return new Promise((resolve, reject) => {
		canvas.toBlob((blob) => {
			if (!blob) reject(/* @__PURE__ */ new Error("Could not encode image"));
			else resolve(blob);
		}, mime, quality);
	});
}
async function blobToDataUrl(blob) {
	return await new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(String(reader.result));
		reader.onerror = () => reject(/* @__PURE__ */ new Error("Could not read file"));
		reader.readAsDataURL(blob);
	});
}
function fitWithinLimits(width, height, settings) {
	let w = width * (settings.scalePercent / 100);
	let h = height * (settings.scalePercent / 100);
	const maxW = settings.maxWidth > 0 ? settings.maxWidth : Infinity;
	const maxH = settings.maxHeight > 0 ? settings.maxHeight : Infinity;
	const scale = Math.min(1, maxW / w, maxH / h);
	w = Math.max(1, Math.round(w * scale));
	h = Math.max(1, Math.round(h * scale));
	return {
		width: w,
		height: h
	};
}
function scaleCanvas(source, width, height) {
	const sw = source.width;
	const sh = source.height;
	if (sw < 1 || sh < 1) throw new Error("Capture produced an empty image. Try again.");
	const w = Math.max(1, Math.round(width));
	const h = Math.max(1, Math.round(height));
	if (sw === w && sh === h) return source;
	const canvas = document.createElement("canvas");
	canvas.width = w;
	canvas.height = h;
	const ctx = canvas.getContext("2d");
	if (!ctx) return source;
	ctx.imageSmoothingEnabled = true;
	ctx.imageSmoothingQuality = "high";
	ctx.drawImage(source, 0, 0, w, h);
	return canvas;
}
async function constrainCanvas(source, settings) {
	const fitted = fitWithinLimits(source.width, source.height, settings);
	let canvas = scaleCanvas(source, fitted.width, fitted.height);
	const maxBytes = settings.maxFileMB > 0 ? settings.maxFileMB * 1024 * 1024 : 0;
	let quality = settings.quality;
	let blob = await canvasToBlob(canvas, settings.format, quality);
	if (!maxBytes || blob.size <= maxBytes) return {
		canvas,
		blob
	};
	if (settings.format !== "png") for (const q of [
		.82,
		.7,
		.58,
		.45,
		.32
	]) {
		quality = Math.min(quality, q);
		blob = await canvasToBlob(canvas, settings.format, quality);
		if (blob.size <= maxBytes) return {
			canvas,
			blob
		};
	}
	for (let i = 0; i < 8; i++) {
		const factor = Math.sqrt(maxBytes / blob.size) * .9;
		if (!Number.isFinite(factor) || factor >= .99) break;
		const w = Math.max(256, Math.round(canvas.width * factor));
		const h = Math.max(256, Math.round(canvas.height * factor));
		if (w === canvas.width && h === canvas.height) break;
		canvas = scaleCanvas(canvas, w, h);
		blob = await canvasToBlob(canvas, settings.format, settings.format === "png" ? 1 : quality);
		if (blob.size <= maxBytes) return {
			canvas,
			blob
		};
		if (w <= 256 || h <= 256) break;
	}
	return {
		canvas,
		blob
	};
}
async function saveBlob(blob, filename, saveAsDialog) {
	const picker = window.showSaveFilePicker;
	if (saveAsDialog && picker) try {
		const writable = await (await picker({
			suggestedName: leafName(filename),
			types: [{
				description: blob.type || "File",
				accept: { [blob.type || "application/octet-stream"]: [`.${leafName(filename).split(".").pop()}`] }
			}]
		})).createWritable();
		await writable.write(blob);
		await writable.close();
		return;
	} catch (error) {
		if (error instanceof DOMException && error.name === "AbortError") return;
	}
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = leafName(filename);
	document.body.appendChild(a);
	a.click();
	a.remove();
	URL.revokeObjectURL(url);
}
async function copyPng(canvas) {
	const blob = await canvasToBlob(canvas, "png", 1);
	await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
}
async function canvasToPdfBlob(canvas, title) {
	const dataUrl = await blobToDataUrl(await canvasToBlob(canvas, "jpeg", .92));
	const pxWidth = canvas.width;
	const pxHeight = canvas.height;
	const pdf = new import_jspdf_node_min.jsPDF({
		orientation: pxWidth >= pxHeight ? "landscape" : "portrait",
		unit: "px",
		format: [pxWidth, pxHeight],
		compress: true
	});
	pdf.setProperties({ title });
	pdf.addImage(dataUrl, "JPEG", 0, 0, pxWidth, pxHeight, void 0, "FAST");
	return pdf.output("blob");
}
async function exportCaptureFile(canvas, capture, settings, kind) {
	if (kind === "pdf") {
		await saveBlob(await canvasToPdfBlob((await constrainCanvas(canvas, {
			...settings,
			format: "jpeg",
			quality: .92
		})).canvas, capture.title), buildFilename({
			...capture,
			format: "png"
		}, settings).replace(/\.[^.]+$/, ".pdf"), settings.saveAsDialog);
		return;
	}
	const limited = await constrainCanvas(canvas, settings);
	await saveBlob(limited.blob, buildFilename({
		...capture,
		width: limited.canvas.width,
		height: limited.canvas.height
	}, settings), settings.saveAsDialog);
}
async function rasterize(dataUrl, annotations, crop) {
	const img = await loadImage(dataUrl);
	const sx = crop?.x ?? 0;
	const sy = crop?.y ?? 0;
	const sw = crop?.w ?? img.naturalWidth;
	const sh = crop?.h ?? img.naturalHeight;
	const canvas = document.createElement("canvas");
	canvas.width = Math.max(1, Math.round(sw));
	canvas.height = Math.max(1, Math.round(sh));
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("Canvas unsupported");
	ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
	ctx.save();
	ctx.translate(-sx, -sy);
	for (const ann of annotations) await drawAnnotation(ctx, ann, img);
	ctx.restore();
	return canvas;
}
async function drawAnnotation(ctx, ann, img) {
	ctx.save();
	ctx.strokeStyle = ann.color;
	ctx.fillStyle = ann.color;
	ctx.lineCap = "round";
	ctx.lineJoin = "round";
	ctx.lineWidth = ann.strokeWidth;
	if (ann.type === "pen" || ann.type === "highlight") {
		if (ann.points.length >= 2) {
			ctx.globalAlpha = ann.type === "highlight" ? .35 : 1;
			ctx.lineWidth = ann.type === "highlight" ? Math.max(12, ann.strokeWidth * 3) : ann.strokeWidth;
			ctx.beginPath();
			ctx.moveTo(ann.points[0].x, ann.points[0].y);
			for (let i = 1; i < ann.points.length; i++) ctx.lineTo(ann.points[i].x, ann.points[i].y);
			ctx.stroke();
		}
	} else if (ann.type === "rect") {
		const { x, y, w, h } = norm(ann);
		if (ann.filled) {
			ctx.globalAlpha = .2;
			ctx.fillRect(x, y, w, h);
			ctx.globalAlpha = 1;
		}
		ctx.strokeRect(x, y, w, h);
	} else if (ann.type === "ellipse") {
		const { x, y, w, h } = norm(ann);
		ctx.beginPath();
		ctx.ellipse(x + w / 2, y + h / 2, Math.abs(w / 2), Math.abs(h / 2), 0, 0, Math.PI * 2);
		if (ann.filled) {
			ctx.globalAlpha = .2;
			ctx.fill();
			ctx.globalAlpha = 1;
		}
		ctx.stroke();
	} else if (ann.type === "line") {
		ctx.beginPath();
		ctx.moveTo(ann.x, ann.y);
		ctx.lineTo(ann.x + ann.w, ann.y + ann.h);
		ctx.stroke();
	} else if (ann.type === "arrow") fillArrow(ctx, ann.x, ann.y, ann.x + ann.w, ann.y + ann.h, ann.strokeWidth);
	else if (ann.type === "blur") {
		const { x, y, w, h } = norm(ann);
		ctx.save();
		ctx.beginPath();
		ctx.rect(x, y, w, h);
		ctx.clip();
		ctx.filter = "blur(12px)";
		ctx.drawImage(img, 0, 0);
		ctx.restore();
		ctx.strokeStyle = "rgba(0,0,0,0.25)";
		ctx.lineWidth = 1;
		ctx.strokeRect(x, y, w, h);
	} else if (ann.type === "text") {
		ctx.font = `${ann.fontSize}px Outfit, system-ui, sans-serif`;
		ctx.textBaseline = "top";
		wrapText(ctx, ann.text, ann.x, ann.y, ann.w, ann.fontSize * 1.3);
	} else if (ann.type === "emoji") {
		ctx.font = `${ann.size}px "Apple Color Emoji", "Segoe UI Emoji", sans-serif`;
		ctx.textBaseline = "top";
		ctx.fillText(ann.emoji, ann.x, ann.y);
	} else if (ann.type === "image") try {
		const overlay = await loadImage(ann.src);
		ctx.drawImage(overlay, ann.x, ann.y, ann.w, ann.h);
	} catch {}
	ctx.restore();
}
function norm(ann) {
	return {
		x: ann.w < 0 ? ann.x + ann.w : ann.x,
		y: ann.h < 0 ? ann.y + ann.h : ann.y,
		w: Math.abs(ann.w),
		h: Math.abs(ann.h)
	};
}
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
	const words = text.split(/\s+/);
	let line = "";
	let yy = y;
	for (const word of words) {
		const test = line ? `${line} ${word}` : word;
		if (ctx.measureText(test).width > maxWidth && line) {
			ctx.fillText(line, x, yy);
			line = word;
			yy += lineHeight;
		} else line = test;
	}
	if (line) ctx.fillText(line, x, yy);
}
//#endregion
export { canvasToBlob as a, exportCaptureFile as c, moveAnnotation as d, offsetAll as f, blobToDataUrl as i, hitTest as l, useCapture as m, STAMP_EMOJI as n, constrainCanvas as o, rasterize as p, arrowPointsAttr as r, copyPng as s, DRAW_COLORS as t, hydrateCaptureFromSession as u };

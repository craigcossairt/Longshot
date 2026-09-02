import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { i as uid } from "./button-CnapSl3a.mjs";
import { c as exportCaptureFile, i as blobToDataUrl, m as useCapture, o as constrainCanvas, p as rasterize } from "./rasterize-BPFgz4DC.mjs";
import { t as getSettings } from "./settings-4FbQ754E.mjs";
import { v as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as ThreadPage } from "./thread-B38kd3DY.mjs";
import { t as toCanvas } from "../_libs/html-to-image.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/samples-D6drEPfq.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function chromeHeight(settings) {
	if (settings.includeBrowserBar) return 86;
	if (settings.includeUrlBar) return 36;
	return 0;
}
function compositeBrowserChrome(source, meta, settings) {
	if (source.width < 1 || source.height < 1) throw new Error("Capture produced an empty image. Try again.");
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
		[
			"#e15a4a",
			"#e0b84e",
			"#5e9a7a"
		].forEach((color, i) => {
			ctx.beginPath();
			ctx.fillStyle = color;
			ctx.arc(22 + i * 18, 20, 6, 0, Math.PI * 2);
			ctx.fill();
		});
		const tabX = 92;
		const tabW = Math.min(280, canvas.width * .38);
		roundRect(ctx, tabX, 8, tabW, 32, 10);
		ctx.fillStyle = "#eceae4";
		ctx.fill();
		ctx.fillStyle = "#3a3834";
		ctx.font = `500 16px Outfit, system-ui, sans-serif`;
		ctx.fillText(truncate(ctx, meta.title || "Page", tabW - 28), 106, 30);
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
function truncate(ctx, text, max) {
	if (ctx.measureText(text).width <= max) return text;
	let value = text;
	while (value.length > 1 && ctx.measureText(`${value}…`).width > max) value = value.slice(0, -1);
	return `${value}…`;
}
function roundRect(ctx, x, y, w, h, r) {
	const radius = Math.min(r, w / 2, h / 2);
	ctx.beginPath();
	ctx.moveTo(x + radius, y);
	ctx.arcTo(x + w, y, x + w, y + h, radius);
	ctx.arcTo(x + w, y + h, x, y + h, radius);
	ctx.arcTo(x, y + h, x, y, radius);
	ctx.arcTo(x, y, x + w, y, radius);
	ctx.closePath();
}
function wait(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
function waitFrame() {
	return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}
async function waitForFrames(root) {
	const frames = [...root.querySelectorAll("iframe")];
	await Promise.all(frames.map((frame) => new Promise((resolve) => {
		if (frame.contentDocument?.readyState === "complete" && frame.contentDocument.body) {
			resolve();
			return;
		}
		const done = () => resolve();
		frame.addEventListener("load", done, { once: true });
		setTimeout(done, 1800);
	})));
}
function materializeFrames(root, expand) {
	const restores = [];
	root.querySelectorAll("iframe, frame").forEach((node) => {
		const frame = node;
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
		} catch {}
	});
	return () => restores.forEach((fn) => fn());
}
function prepareSvgs(root) {
	const restores = [];
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
async function waitForLayout(node) {
	if (document.fonts?.ready) await Promise.race([document.fonts.ready, wait(800)]);
	for (let i = 0; i < 24; i++) {
		await waitFrame();
		const w = Math.max(node.scrollWidth, node.clientWidth, node.offsetWidth);
		const h = Math.max(node.scrollHeight, node.clientHeight, node.offsetHeight);
		if (w > 8 && h > 8) {
			await waitFrame();
			return {
				width: w,
				height: h
			};
		}
		await wait(50);
	}
	throw new Error("Page had no size to capture. Open the sample and try again.");
}
function clonePaintStyle() {
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
		filter: "none"
	};
}
function isMostlyBlank(canvas) {
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
async function rasterizeNode(node, width, height) {
	const bg = getComputedStyle(node).backgroundColor;
	const base = {
		width,
		height,
		backgroundColor: bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent" ? bg : "#ffffff",
		cacheBust: true,
		pixelRatio: Math.min(2, window.devicePixelRatio || 1),
		skipFonts: true,
		style: {
			...clonePaintStyle(),
			width: `${width}px`,
			height: `${height}px`
		}
	};
	let raw;
	try {
		raw = await toCanvas(node, base);
	} catch {
		raw = await toCanvas(node, {
			...base,
			pixelRatio: 1
		});
	}
	if (raw.width < 1 || raw.height < 1 || isMostlyBlank(raw)) raw = await toCanvas(node, {
		...base,
		pixelRatio: 1,
		skipFonts: true
	});
	if (raw.width < 1 || raw.height < 1) throw new Error("Capture produced an empty image. Try again.");
	if (isMostlyBlank(raw)) throw new Error("Capture came out blank. Open the sample page and capture from there.");
	return raw;
}
async function captureElement(node, meta) {
	const settings = getSettings();
	await waitForFrames(node);
	const restoreFrames = materializeFrames(node, settings.captureIframes);
	await wait(80);
	const restoreSvgs = prepareSvgs(node);
	try {
		const size = await waitForLayout(node);
		const withChrome = compositeBrowserChrome(await rasterizeNode(node, size.width, size.height), meta, settings);
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
			format: settings.format
		};
	} finally {
		restoreSvgs();
		restoreFrames();
	}
}
async function captureFromFile(file) {
	const settings = getSettings();
	const dataUrl = await blobToDataUrl(file);
	const img = await new Promise((resolve, reject) => {
		const image = new Image();
		image.onload = () => resolve(image);
		image.onerror = () => reject(/* @__PURE__ */ new Error("Could not read that image"));
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
		format: settings.format
	};
}
async function captureFromDataUrl(dataUrl, title = "Pasted capture") {
	const settings = getSettings();
	const img = await new Promise((resolve, reject) => {
		const image = new Image();
		image.onload = () => resolve(image);
		image.onerror = () => reject(/* @__PURE__ */ new Error("Could not read clipboard image"));
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
		format: settings.format
	};
}
function openEditor(navigate) {
	navigate({ to: "/editor" });
}
function useCaptureFlow() {
	const navigate = useNavigate();
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [status, setStatus] = (0, import_react.useState)("Capturing");
	const finish = (0, import_react.useCallback)(async (record) => {
		useCapture.getState().setCapture(record);
		const settings = getSettings();
		if (settings.autoDownload) {
			setStatus("Saving");
			const canvas = await rasterize(record.dataUrl, [], null);
			await exportCaptureFile(canvas, record, settings, "image");
		}
		setStatus("Opening");
		openEditor(navigate);
	}, [navigate]);
	return {
		busy,
		status,
		captureNode: (0, import_react.useCallback)(async (node, meta) => {
			setBusy(true);
			setStatus("Scrolling page");
			try {
				await new Promise((r) => setTimeout(r, 280));
				setStatus("Stitching frames");
				const record = await captureElement(node, meta);
				await finish(record);
				toast.success("Capture ready");
			} catch (error) {
				toast.error(error instanceof Error ? error.message : "Capture failed");
			} finally {
				setBusy(false);
			}
		}, [finish]),
		importFile: (0, import_react.useCallback)(async (file) => {
			setBusy(true);
			setStatus("Reading image");
			try {
				const record = await captureFromFile(file);
				await finish(record);
				toast.success("Image opened");
			} catch (error) {
				toast.error(error instanceof Error ? error.message : "Could not open file");
			} finally {
				setBusy(false);
			}
		}, [finish]),
		importDataUrl: (0, import_react.useCallback)(async (dataUrl) => {
			setBusy(true);
			setStatus("Reading clipboard");
			try {
				const record = await captureFromDataUrl(dataUrl);
				await finish(record);
				toast.success("Pasted into editor");
			} catch (error) {
				toast.error(error instanceof Error ? error.message : "Nothing to paste");
			} finally {
				setBusy(false);
			}
		}, [finish])
	};
}
function CaptureOverlay({ busy, status }) {
	if (!busy) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 flex items-center justify-center bg-bg/80 px-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-sm rounded-xl border border-border bg-surface p-6 shadow-soft",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs tracking-[0.18em] text-muted uppercase",
					children: "Longshot"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display mt-2 text-2xl",
					children: status
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "relative mt-5 h-1.5 overflow-hidden rounded-full bg-surface-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-y-0 w-1/3 rounded-full bg-primary" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-muted",
					children: "Scrolling inner frames, then stitching the page."
				})
			]
		})
	});
}
var PRODUCTS = [
	{
		name: "Field 35",
		spec: "35mm · f/2.0 · 240g",
		price: "$1,280",
		note: "The walking lens"
	},
	{
		name: "Ridge 50",
		spec: "50mm · f/1.4 · 310g",
		price: "$1,640",
		note: "Mid-plane standard"
	},
	{
		name: "Haze 85",
		spec: "85mm · f/1.8 · 380g",
		price: "$1,490",
		note: "Compression without drama"
	},
	{
		name: "Plate 24",
		spec: "24mm · f/2.8 · 210g",
		price: "$980",
		note: "Near plane, honest"
	},
	{
		name: "Scroll Body",
		spec: "Full-frame · 42MP",
		price: "$3,200",
		note: "Tall files, quiet shutter"
	},
	{
		name: "Notebook Kit",
		spec: "Body + 35 + 85",
		price: "$5,400",
		note: "The actual assignment bag"
	}
];
function AtelierPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "bg-[#f3efe6] text-ink",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "px-6 py-10 md:px-12",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs tracking-[0.22em] text-ink-muted uppercase",
						children: "Atelier"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display mt-3 max-w-2xl text-4xl md:text-6xl",
						children: "Glass for the long page"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 max-w-xl text-ink-muted",
						children: "Lenses chosen for vertical work — assignment kits that keep a ridgeline readable from fence to weather to far wall."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-6 px-6 pb-16 md:grid-cols-2 md:px-12 xl:grid-cols-3",
				children: PRODUCTS.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "rounded-xl border border-ink/10 bg-[#faf7f1] p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LensMark, { index: i }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display mt-4 text-2xl",
							children: p.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-ink-muted",
							children: p.spec
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 text-sm",
							children: p.note
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-6 font-medium tabular-nums",
							children: p.price
						})
					]
				}, p.name))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "border-t border-ink/10 px-6 py-12 md:px-12",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-3xl",
					children: "Notes from the bench"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 max-w-2xl space-y-4 text-sm leading-7",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "We do not sell “landscape lenses.” We sell glass that does not panic when the file is 8,000 pixels tall. Coatings are tuned for haze, not for brochure contrast. Helicoids are damped so you can focus with gloves on a windy berm." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Every kit is collared and measured against a 1,280-pixel-wide scroll at 150% zoom. If the mid plane turns to mush, it does not ship." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Shipping from West Valley City. Repair turnaround is nine days, not because we are slow — because we recollimate against a 10-meter rail, not a projector chart." })
					]
				})]
			})
		]
	});
}
function LensMark({ index }) {
	const r = 36 + index % 3 * 6;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 240 140",
		className: "h-auto w-full rounded-lg bg-[#e7e1d4]",
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "120",
				cy: "70",
				r: r + 18,
				fill: "none",
				stroke: "#1a1916",
				strokeWidth: "2"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "120",
				cy: "70",
				r,
				fill: "#1a1916"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "120",
				cy: "70",
				r: r - 14,
				fill: "#8aa0a8"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "120",
				cy: "70",
				r: "8",
				fill: "#1a1916"
			})
		]
	});
}
function FieldNotesPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "bg-paper text-ink",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "border-b border-ink/10 px-6 py-8 md:px-16 md:py-12",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-3xl items-center justify-between text-xs tracking-[0.18em] text-ink-muted uppercase",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Field Notes" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Vol. 12 · Late Light" })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto mt-10 max-w-3xl",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium tracking-wide text-ink-muted",
							children: "Essay · 14 min read"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-display mt-4 text-4xl leading-tight md:text-6xl",
							children: "How to read a ridgeline"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-6 max-w-2xl text-lg leading-relaxed text-ink-muted",
							children: "A working method for photographing long country: wait for the fold in the land, not the peak. The picture lives in the overlap."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-8 text-sm text-ink-muted",
							children: "Mara Ellison · 12 August 2026 · Wasatch Range"
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RidgelineFigure, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto max-w-3xl space-y-6 px-6 py-12 text-base leading-7 md:px-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Most people photograph mountains as objects. They stand at the overlook, zoom until the summit fills the frame, and leave with a postcard. The ridgeline is treated as a logo. That is a missed picture." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "A ridgeline is a sentence. It has clauses — the near slope, the mid fold, the far wall that goes blue. If you crop to the peak you cut the grammar. Full-page seeing, the kind you do with your feet as much as the lens, is about keeping those clauses in order." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("blockquote", {
						className: "border-l-2 border-ink/20 pl-5 font-display text-2xl leading-snug text-ink",
						children: "“The long picture is not more landscape. It is the same landscape, allowed to finish.”"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "I started doing this on assignment in the Oquirrhs, walking a service road that never quite crested. Every 200 meters the ridge rewrote itself. A notch became a shoulder. A shoulder became a second skyline. The photograph that survived the edit was 3,200 pixels tall and almost nothing happened in it — except the land changing its mind." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display pt-4 text-3xl",
						children: "Three planes, one exposure"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Work in planes, not subjects. Near: grass, fence, the thing you could touch. Mid: the first true rise, usually where weather sits. Far: the wall that will print as a single tone if you are careless with haze." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Expose for the mid. The near can go dark; it still reads as weight. The far can go pale; it still reads as air. If you expose for the snow on the summit you will lose the sentence in the middle, which is the only part that is actually the photograph." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContourFigure, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display pt-4 text-3xl",
						children: "Why the scroll matters"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Screens taught us to crop at the fold. A phone will show you a square of ridge and call it done. Printing a full page — or capturing one — puts the reader back in the walk. You do not glance a ridgeline. You travel it." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "When I send a contact sheet now I send the whole scroll. Editors complain, then they read it. The picture that gets published is rarely the hero frame. It is the one where the fence line, the weather, and the far wall finally agree." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
						className: "list-decimal space-y-3 pl-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Arrive two hours before the light you want. Ridges heat from the back." }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Do not change focal length between frames if you plan to stitch a vertical." }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Leave the sky a thin lid. It is a margin, not a subject." }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Caption the weather, not the peak name. Weather is what the print will show." })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "The last useful picture I made this year was from a rest-stop. Semi trucks, a vending machine, and behind them a line of hills doing something quiet and complete. I did not crop the trucks out. They are the near plane. The ridge is the rest of the sentence." })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
				className: "border-t border-ink/10 px-6 py-12 md:px-16",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto grid max-w-3xl gap-8 md:grid-cols-3",
					children: [
						["Further reading", "Haze as a drawing tool"],
						["Field kit", "One body, two primes, a notebook"],
						["Next essay", "Night work without a tripod myth"]
					].map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs tracking-[0.16em] text-ink-muted uppercase",
						children: k
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 font-display text-xl",
						children: v
					})] }, k))
				})
			})
		]
	});
}
function RidgelineFigure() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", {
		className: "bg-[#cfc6b4]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			viewBox: "0 0 1200 420",
			className: "h-auto w-full",
			"aria-hidden": "true",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					width: "1200",
					height: "420",
					fill: "#cfc6b4"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					width: "1200",
					height: "180",
					fill: "#b9c4c2"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M0 260 L140 210 L260 240 L420 160 L580 220 L760 120 L940 190 L1200 90 L1200 420 L0 420 Z",
					fill: "#8d7f68"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M0 300 L180 250 L340 280 L520 210 L700 260 L900 180 L1200 220 L1200 420 L0 420 Z",
					fill: "#6f6352"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M0 350 L220 320 L480 340 L720 300 L1200 330 L1200 420 L0 420 Z",
					fill: "#4f463c"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "920",
					cy: "88",
					r: "18",
					fill: "#f1efe6"
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("figcaption", {
			className: "px-6 py-3 text-center text-xs tracking-wide text-ink-muted uppercase",
			children: "Figure 1 · West slope, two hours before sundown"
		})]
	});
}
function ContourFigure() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", {
		className: "border border-ink/10 bg-[#efeae0] p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			viewBox: "0 0 640 280",
			className: "h-auto w-full",
			"aria-hidden": "true",
			children: [[
				40,
				70,
				100,
				130,
				160,
				190,
				220
			].map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
				cx: "320",
				cy: "150",
				rx: r * 1.4,
				ry: r * .55,
				fill: "none",
				stroke: "#1a1916",
				strokeOpacity: "0.45",
				strokeWidth: "1"
			}, r)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "338",
				cy: "132",
				r: "3",
				fill: "#1a1916"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("figcaption", {
			className: "mt-2 text-center text-xs text-ink-muted",
			children: "Contour of the mid plane — expose here, let the rest fall"
		})]
	});
}
var STATS = [
	{
		label: "Captures today",
		value: "1,284",
		delta: "+12%"
	},
	{
		label: "Avg. page height",
		value: "6,420 px",
		delta: "+3%"
	},
	{
		label: "PDF exports",
		value: "318",
		delta: "+9%"
	},
	{
		label: "Stitch failures",
		value: "4",
		delta: "−2"
	}
];
var ROWS = [
	[
		"north-ridge",
		"fieldnotes.example",
		"4,102 × 8,440",
		"PNG",
		"2.1 MB"
	],
	[
		"dash-north",
		"observatory.example",
		"1,440 × 5,120",
		"WebP",
		"640 KB"
	],
	[
		"catalog-p2",
		"atelier.example",
		"1,280 × 9,600",
		"JPEG",
		"1.4 MB"
	],
	[
		"thread-418",
		"frames.example",
		"1,280 × 7,200",
		"PNG",
		"3.0 MB"
	],
	[
		"invoice-88",
		"ledger.example",
		"1,024 × 4,800",
		"PDF",
		"890 KB"
	],
	[
		"press-kit",
		"studio.example",
		"1,600 × 6,200",
		"PNG",
		"2.8 MB"
	]
];
function ObservatoryPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-full bg-[#101114] text-[#ecece8]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-center justify-between border-b border-white/10 px-6 py-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs tracking-[0.2em] text-white/50 uppercase",
					children: "Observatory"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-2xl",
					children: "North desk"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-white/50",
					children: "Tuesday 1 Sep · live"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 p-6 md:grid-cols-4",
				children: STATS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg border border-white/10 bg-[#17181c] p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-white/50",
							children: s.label
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 font-display text-3xl tabular-nums",
							children: s.value
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs text-[#7dba96]",
							children: s.delta
						})
					]
				}, s.label))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 px-6 pb-6 lg:grid-cols-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-lg border border-white/10 bg-[#17181c] p-5 lg:col-span-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm text-white/70",
						children: "Capture volume · 14 days"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LineChart, {})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-lg border border-white/10 bg-[#17181c] p-5 lg:col-span-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm text-white/70",
						children: "Format mix"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 space-y-3",
						children: [
							[
								"PNG",
								52,
								"#d2d6d0"
							],
							[
								"JPEG",
								28,
								"#8c8b86"
							],
							[
								"WebP",
								14,
								"#4a7ec4"
							],
							[
								"PDF",
								6,
								"#5e9a7a"
							]
						].map(([name, pct, color]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-1 flex justify-between text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: name }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "tabular-nums text-white/50",
								children: [pct, "%"]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-2 overflow-hidden rounded-full bg-white/10",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-full rounded-full",
								style: {
									width: `${pct}%`,
									background: String(color)
								}
							})
						})] }, String(name)))
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "px-6 pb-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-hidden rounded-lg border border-white/10",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-left text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
							className: "bg-white/5 text-xs tracking-wide text-white/50 uppercase",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: [
								"Job",
								"Source",
								"Size",
								"Format",
								"Weight"
							].map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 font-medium",
								children: h
							}, h)) })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: ROWS.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
							className: "border-t border-white/10",
							children: row.map((cell) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3 tabular-nums",
								children: cell
							}, cell))
						}, row[0])) })]
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "px-6 pb-16",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-4 text-sm text-white/70",
					children: "Activity"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
					className: "space-y-3",
					children: [
						"Stitched 18 viewports on fieldnotes.example/essays/ridgeline",
						"Expanded iframe on frames.example/thread/418 (comments, 2,400 px)",
						"Auto-downloaded catalog-p2.jpg to Longshot/",
						"PDF export of invoice-88 at 150 dpi",
						"Crop applied: 1,280 × 9,600 → 1,280 × 7,140",
						"Annotation set: 4 arrows, 1 blur, 2 captions",
						"Retry after lazy-load on press-kit hero"
					].map((item, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex gap-3 rounded-md border border-white/10 bg-[#17181c] px-4 py-3 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "tabular-nums text-white/30",
							children: String(i + 1).padStart(2, "0")
						}), item]
					}, item))
				})]
			})
		]
	});
}
function LineChart() {
	const points = [
		40,
		55,
		48,
		62,
		70,
		66,
		80,
		92,
		78,
		88,
		96,
		90,
		110,
		124
	];
	const w = 560;
	const h = 180;
	const max = 140;
	const d = points.map((p, i) => {
		const x = i / (points.length - 1) * w;
		const y = h - p / max * h;
		return `${i === 0 ? "M" : "L"}${x} ${y}`;
	}).join(" ");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: `0 0 ${w} ${h}`,
		className: "mt-4 h-auto w-full",
		"aria-hidden": "true",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d,
			fill: "none",
			stroke: "#d2d6d0",
			strokeWidth: "2"
		}), points.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: i / (points.length - 1) * w,
			cy: h - p / max * h,
			r: "3",
			fill: "#d2d6d0"
		}, i))]
	});
}
function SampleDocument({ slug }) {
	if (slug === "observatory") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ObservatoryPage, {});
	if (slug === "atelier") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AtelierPage, {});
	if (slug === "thread") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThreadPage, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldNotesPage, {});
}
var SAMPLES = [
	{
		slug: "field-notes",
		title: "Field Notes",
		kicker: "Essay",
		description: "A long illustrated article — the classic full-page capture.",
		url: "https://fieldnotes.example/essays/ridgeline",
		heightLabel: "~4 screens",
		hasFrames: false
	},
	{
		slug: "observatory",
		title: "Observatory",
		kicker: "Dashboard",
		description: "Dense analytics layout with charts, tables, and a long activity feed.",
		url: "https://observatory.example/dash/north",
		heightLabel: "~3 screens",
		hasFrames: false
	},
	{
		slug: "atelier",
		title: "Atelier",
		kicker: "Catalog",
		description: "A product grid that runs well past the fold.",
		url: "https://atelier.example/catalog",
		heightLabel: "~5 screens",
		hasFrames: false
	},
	{
		slug: "thread",
		title: "The Thread",
		kicker: "Frames",
		description: "Article with a nested comments iframe — tests inner-frame scrolling.",
		url: "https://frames.example/thread/418",
		heightLabel: "Page + iframe",
		hasFrames: true
	}
];
function getSample(slug) {
	return SAMPLES.find((s) => s.slug === slug);
}
//#endregion
export { useCaptureFlow as a, getSample as i, SAMPLES as n, SampleDocument as r, CaptureOverlay as t };

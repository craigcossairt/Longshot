import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { t as Button } from "./button-CnapSl3a.mjs";
import { t as HiddenFileInput } from "./hidden-file-input-e6k7Mq9B.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { A as Camera, C as Download, E as ClipboardPaste, r as Upload, w as Crop, y as Frame } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as AppHeader } from "./app-header-BYeomKdh.mjs";
import { a as useCaptureFlow, n as SAMPLES, r as SampleDocument, t as CaptureOverlay } from "./samples-D6drEPfq.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BmbTYb4r.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Home() {
	const { busy, status, captureNode, importFile, importDataUrl } = useCaptureFlow();
	const [pending, setPending] = (0, import_react.useState)(null);
	const stageRef = (0, import_react.useRef)(null);
	const fileRef = (0, import_react.useRef)(null);
	const captureNodeRef = (0, import_react.useRef)(captureNode);
	captureNodeRef.current = captureNode;
	(0, import_react.useEffect)(() => {
		if (!pending || !stageRef.current) return;
		const node = stageRef.current;
		const sample = SAMPLES.find((s) => s.slug === pending);
		if (!sample) return;
		let cancelled = false;
		const timer = window.setTimeout(() => {
			if (cancelled || !stageRef.current) return;
			captureNodeRef.current(node, {
				title: sample.title,
				url: sample.url
			}).finally(() => {
				if (!cancelled) setPending(null);
			});
		}, pending === "thread" ? 1100 : 450);
		return () => {
			cancelled = true;
			window.clearTimeout(timer);
		};
	}, [pending]);
	(0, import_react.useEffect)(() => {
		function onPaste(e) {
			const item = [...e.clipboardData?.items ?? []].find((i) => i.type.startsWith("image/"));
			if (!item) return;
			const file = item.getAsFile();
			if (file) importFile(file);
		}
		window.addEventListener("paste", onPaste);
		return () => window.removeEventListener("paste", onPaste);
	}, [importFile]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppHeader, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto max-w-6xl px-4 py-10 md:px-8 md:py-16",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "stagger-in max-w-3xl",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs tracking-[0.2em] text-muted uppercase",
								children: "Full-page capture studio"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "font-display mt-4 text-4xl leading-tight md:text-6xl",
								children: "The whole page, in one shot."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-5 max-w-xl text-lg leading-relaxed text-muted",
								children: "A GoFullPage replacement you control. Capture long pages, scroll nested frames, crop, annotate, and export PNG, JPEG, WebP, or PDF."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-8 flex flex-wrap gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									onClick: () => setPending("field-notes"),
									disabled: busy,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, {}), "Capture a sample"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "secondary",
									asChild: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/install",
										children: "Install the extension"
									})
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
						className: "mt-14 grid gap-4 md:grid-cols-2",
						children: SAMPLES.map((sample) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							className: "rounded-xl border border-border bg-surface p-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs tracking-[0.16em] text-muted uppercase",
									children: sample.kicker
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "font-display mt-2 text-2xl",
									children: sample.title
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm leading-6 text-muted",
									children: sample.description
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 text-xs text-subtle",
									children: sample.heightLabel
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-5 flex flex-wrap gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										onClick: () => setPending(sample.slug),
										disabled: busy,
										children: "Capture"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "secondary",
										asChild: true,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
											to: "/p/$slug",
											params: { slug: sample.slug },
											children: "Open page"
										})
									})]
								})
							]
						}, sample.slug))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "mt-8 rounded-xl border border-dashed border-border-strong bg-surface/50 px-6 py-10 text-center",
						onDragOver: (e) => e.preventDefault(),
						onDrop: (e) => {
							e.preventDefault();
							const file = e.dataTransfer.files[0];
							if (file?.type.startsWith("image/")) importFile(file);
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-2xl",
								children: "Or bring your own shot"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-muted",
								children: "Upload a screenshot, drop a file, or paste from the clipboard."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-6 flex flex-wrap justify-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "secondary",
									onClick: () => fileRef.current?.click(),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, {}), "Upload image"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "outline",
									onClick: async () => {
										try {
											const items = await navigator.clipboard.read();
											for (const item of items) {
												const type = item.types.find((t) => t.startsWith("image/"));
												if (!type) continue;
												const blob = await item.getType(type);
												const reader = new FileReader();
												reader.onload = () => void importDataUrl(String(reader.result));
												reader.readAsDataURL(blob);
												return;
											}
											toast.error("Clipboard has no image");
										} catch {
											toast.error("Could not read clipboard — copy a screenshot and press Ctrl+V");
										}
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardPaste, {}), "Paste"]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HiddenFileInput, {
								ref: fileRef,
								accept: "image/*",
								onChange: (e) => {
									const file = e.target.files?.[0];
									e.target.value = "";
									if (file) importFile(file);
								}
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
						className: "mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4",
						children: [
							{
								icon: Frame,
								title: "Inner frames",
								body: "Expand iframes and framesets so nested comments aren’t clipped."
							},
							{
								icon: Crop,
								title: "Crop and mark up",
								body: "Crop, draw, type, stamp, drop images, and redact — then right-click to export."
							},
							{
								icon: Download,
								title: "Copy, file, PDF",
								body: "Copy to clipboard, download PNG/JPEG/WebP, or save a one-page PDF."
							},
							{
								icon: Camera,
								title: "Your defaults",
								body: "Browser chrome, URL bar, auto-download, Save as, folder, resize limits, and max file size."
							}
						].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl border border-border bg-surface p-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, { className: "size-5 text-primary" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "mt-3 font-medium",
									children: item.title
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm leading-6 text-muted",
									children: item.body
								})
							]
						}, item.title))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none absolute top-0 left-0 h-0 w-0 overflow-hidden",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					ref: stageRef,
					className: "w-[1280px] bg-white text-left",
					children: pending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SampleDocument, { slug: pending }) : null
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CaptureOverlay, {
				busy,
				status
			})
		]
	});
}
//#endregion
export { Home as component };

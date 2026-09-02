import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { t as Button } from "./button-CnapSl3a.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { A as Camera, d as Settings } from "../_libs/lucide-react.mjs";
import { n as Route } from "./router-Bbw9ad-6.mjs";
import { a as useCaptureFlow, i as getSample, r as SampleDocument, t as CaptureOverlay } from "./samples-D6drEPfq.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/p._slug-CwaWdOe8.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CaptureDock({ sample, onCapture, busy }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "pointer-events-auto flex w-full max-w-xl items-center gap-2 rounded-xl border border-border bg-bg/95 p-2 shadow-soft backdrop-blur-sm",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1 px-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate text-sm text-fg",
						children: sample.title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate text-xs text-muted",
						children: sample.url
					})]
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
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: onCapture,
					disabled: busy,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, {}), "Capture page"]
				})
			]
		})
	});
}
function SampleRoute() {
	const { slug } = Route.useParams();
	const { capture } = Route.useSearch();
	const sample = getSample(slug);
	const rootRef = (0, import_react.useRef)(null);
	const { busy, status, captureNode } = useCaptureFlow();
	const captureNodeRef = (0, import_react.useRef)(captureNode);
	captureNodeRef.current = captureNode;
	const meta = (0, import_react.useMemo)(() => ({
		title: sample?.title ?? "Page",
		url: sample?.url ?? "https://longshot.local"
	}), [sample]);
	(0, import_react.useEffect)(() => {
		if (!capture || !rootRef.current || !sample) return;
		const node = rootRef.current;
		const t = window.setTimeout(() => {
			captureNodeRef.current(node, meta);
		}, sample.hasFrames ? 1100 : 400);
		return () => window.clearTimeout(t);
	}, [
		capture,
		meta,
		sample
	]);
	if (!sample) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh flex-col items-center justify-center bg-bg text-fg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "That sample isn’t here." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/",
			className: "mt-3 text-muted underline",
			children: "Back to studio"
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-bg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				ref: rootRef,
				id: "sample-root",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SampleDocument, { slug: sample.slug })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CaptureDock, {
				sample,
				busy,
				onCapture: () => {
					if (rootRef.current) captureNode(rootRef.current, meta);
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CaptureOverlay, {
				busy,
				status
			})
		]
	});
}
//#endregion
export { SampleRoute as component };

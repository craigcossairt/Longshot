import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { t as Button } from "./button-CnapSl3a.mjs";
import { C as Download, b as FolderOpen, p as Puzzle, u as ShieldCheck } from "../_libs/lucide-react.mjs";
import { t as AppHeader } from "./app-header-BYeomKdh.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/install-DyH-J9MF.js
var import_jsx_runtime = require_jsx_runtime();
function InstallPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-bg text-fg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppHeader, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
			className: "mx-auto max-w-2xl px-4 py-10 md:px-0 md:py-14",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs tracking-[0.2em] text-muted uppercase",
					children: "Sideload"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display mt-3 text-4xl",
					children: "Brave and Chrome extension"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 leading-7 text-muted",
					children: "Stores flagged GoFullPage as policy-violating, so this build is meant to be loaded as an unpacked extension. It captures the real tab — including long pages and inner frames — then opens the editor in a new tab."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-8 rounded-xl border border-border bg-surface p-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-2xl",
							children: "Install"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
							className: "mt-4 space-y-4 text-sm leading-6",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "mt-0.5 size-4 shrink-0 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Download the extension pack (zip). Unzip it somewhere you won’t tidy away." })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Puzzle, { className: "mt-0.5 size-4 shrink-0 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
										"In Brave or Chrome open ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
											className: "rounded bg-surface-2 px-1.5 py-0.5",
											children: "brave://extensions"
										}),
										" ",
										"or ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
											className: "rounded bg-surface-2 px-1.5 py-0.5",
											children: "chrome://extensions"
										}),
										"."
									] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "mt-0.5 size-4 shrink-0 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Turn on Developer mode (top right)." })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderOpen, { className: "mt-0.5 size-4 shrink-0 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
										"Load unpacked, and choose the unzipped ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "longshot-extension" }),
										" folder."
									] })]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							className: "mt-6",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
								href: "/longshot-extension.zip",
								download: true,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {}), "Download extension"]
							})
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 space-y-4 text-sm leading-7 text-muted",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Click the Longshot icon on any page. The stitch opens in a new tab with copy, download, PDF, crop, and annotation. Options live under the extension details, and match the settings in this studio." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "This preview cannot inject into other websites — that’s what the extension is for. Use the sample pages here to try the editor immediately." })]
				})
			]
		})]
	});
}
//#endregion
export { InstallPage as component };

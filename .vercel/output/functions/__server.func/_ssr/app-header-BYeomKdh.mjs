import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as cn } from "./button-CnapSl3a.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { A as Camera, d as Settings } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app-header-BYeomKdh.js
var import_jsx_runtime = require_jsx_runtime();
function AppHeader({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: cn("flex items-center justify-between gap-4 border-b border-border px-4 py-3 md:px-8", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
			to: "/",
			className: "flex items-center gap-2.5 text-fg",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "flex size-8 items-center justify-center rounded-md bg-surface-2 text-primary",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { className: "size-4" })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-display text-xl tracking-tight",
				children: "Longshot"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
			className: "flex items-center gap-1 text-sm",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/editor",
					className: "rounded-md px-3 py-2 text-muted transition-colors hover:bg-surface-2 hover:text-fg",
					children: "Editor"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/install",
					className: "rounded-md px-3 py-2 text-muted transition-colors hover:bg-surface-2 hover:text-fg",
					children: "Extension"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/settings",
					className: "inline-flex size-11 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-2 hover:text-fg",
					"aria-label": "Settings",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "size-4" })
				})
			]
		})]
	});
}
//#endregion
export { AppHeader as t };

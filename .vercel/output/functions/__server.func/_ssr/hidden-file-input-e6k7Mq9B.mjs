import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/hidden-file-input-e6k7Mq9B.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Client-only so screenshot tooling cannot mutate a server-rendered file input. */
function HiddenFileInput(props) {
	const [mounted, setMounted] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => setMounted(true), []);
	if (!mounted) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		...props,
		type: "file",
		className: `hidden ${props.className ?? ""}`
	});
}
//#endregion
export { HiddenFileInput as t };

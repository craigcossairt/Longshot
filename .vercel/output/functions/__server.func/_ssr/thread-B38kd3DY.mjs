import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/thread-B38kd3DY.js
var import_jsx_runtime = require_jsx_runtime();
function ThreadPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "bg-paper text-ink",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "border-b border-ink/10 px-6 py-8 md:px-16",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs tracking-[0.18em] text-ink-muted uppercase",
						children: "The Thread"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display mt-3 max-w-3xl text-4xl md:text-5xl",
						children: "Why nested frames still break page captures"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 max-w-2xl text-ink-muted",
						children: "A short note on iframes, framesets, and the inner scroll that most extensions skip."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto max-w-3xl space-y-5 px-6 py-10 leading-7",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
					"The outer document is easy. You measure ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
						className: "rounded bg-ink/5 px-1",
						children: "scrollHeight"
					}),
					", step the viewport, stitch. The trouble starts when a comments widget, a docs TOC, or a leftover frameset keeps its own scrollbar."
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Longshot can expand those inner documents before the stitch — same-origin frames only, which is the honest limit of the web. The pane below is a live iframe. Turn on “Scroll inner frames” in Settings, capture this page, and the full conversation is in the file. Turn it off and you get the clipped viewport." })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto max-w-3xl px-6 pb-16",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-2 text-xs tracking-[0.16em] text-ink-muted uppercase",
					children: "Comments · iframe"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
					title: "Comments",
					src: "/frames/comments",
					className: "h-80 w-full rounded-lg border border-ink/15 bg-white"
				})]
			})
		]
	});
}
function CommentsFrame() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-full bg-white px-4 py-4 text-ink",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mb-4 text-xs tracking-[0.16em] text-ink-muted uppercase",
			children: "12 comments"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "space-y-4",
			children: [
				["Nia", "If you don’t expand the iframe you only keep the first six comments. That’s the bug."],
				["Owen", "Framesets are worse. Two scrolling columns, one stitch. Nightmares."],
				["Mara", "Same-origin only is the right call. Don’t pretend you can see cross-origin widgets."],
				["Jules", "We used to screenshot the comments widget separately and paste. Foolish."],
				["Rafi", "Does lazy-load inside the frame retrigger after expand? It should."],
				["Chris", "Brave still paints a blank first viewport if you don’t wait two frames."],
				["Lila", "PDF of a comments thread is an odd flex and I want it anyway."],
				["Jon", "Crop after expand, not before. Otherwise you crop the clipped version."],
				["Asha", "Emoji in the comments should survive PNG. JPEG is a different story."],
				["Ben", "Please keep the inner scrollbar out of the capture. Expand, then hide overflow."],
				["Ruth", "This thread is the test page. If the file ends at Jules, the toggle is off."],
				["Pax", "Last comment on purpose. If you can read this in the screenshot, frames worked."]
			].map(([name, body]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "border-b border-ink/10 pb-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium",
					children: name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm leading-6 text-ink-muted",
					children: body
				})]
			}, name))
		})]
	});
}
//#endregion
export { ThreadPage as n, CommentsFrame as t };

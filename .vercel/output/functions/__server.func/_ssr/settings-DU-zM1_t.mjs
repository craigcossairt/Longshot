import "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as cn, t as Button } from "./button-CnapSl3a.mjs";
import { a as SelectItemIndicator, c as SelectTrigger$1, i as SelectItem$1, l as SelectValue$1, n as SelectContent$1, o as SelectItemText, r as SelectIcon, s as SelectPortal, t as Select$1, u as SelectViewport } from "../_libs/@radix-ui/react-select+[...].mjs";
import { t as Slider } from "./slider-A_M9W9vT.mjs";
import { n as useSettings } from "./settings-4FbQ754E.mjs";
import { O as ChevronDown, k as Check } from "../_libs/lucide-react.mjs";
import { t as AppHeader } from "./app-header-BYeomKdh.mjs";
import { n as SwitchThumb, t as Switch$1 } from "../_libs/radix-ui__react-switch.mjs";
require_react();
var import_jsx_runtime = require_jsx_runtime();
function Input({ className, type, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		type,
		className: cn("flex h-11 w-full rounded-md border border-border bg-surface-2 px-3 text-sm text-fg", "placeholder:text-subtle outline-none transition-colors duration-150", "focus-visible:border-border-strong focus-visible:ring-2 focus-visible:ring-primary/30", "disabled:cursor-not-allowed disabled:opacity-40", className),
		...props
	});
}
function Label({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
		className: cn("text-sm font-medium text-fg leading-none", className),
		...props
	});
}
function Switch({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch$1, {
		className: cn("peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-border", "bg-surface-2 transition-colors duration-150", "data-[state=checked]:bg-primary data-[state=checked]:border-primary", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40", "disabled:cursor-not-allowed disabled:opacity-40", className),
		...props,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SwitchThumb, { className: cn("pointer-events-none block size-5 rounded-full bg-fg shadow-sm transition-transform duration-150", "data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0.5", "data-[state=checked]:bg-primary-fg") })
	});
}
function Select(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select$1, { ...props });
}
function SelectValue(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue$1, { ...props });
}
function SelectTrigger({ className, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectTrigger$1, {
		className: cn("flex h-11 w-full items-center justify-between gap-2 rounded-md border border-border bg-surface-2 px-3 text-sm text-fg", "outline-none focus-visible:ring-2 focus-visible:ring-primary/30", "disabled:cursor-not-allowed disabled:opacity-40", className),
		...props,
		children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectIcon, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-4 text-muted" })
		})]
	});
}
function SelectContent({ className, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectPortal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent$1, {
		className: cn("z-50 overflow-hidden rounded-lg border border-border bg-surface shadow-soft", className),
		position: "popper",
		...props,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectViewport, {
			className: "p-1",
			children
		})
	}) });
}
function SelectItem({ className, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem$1, {
		className: cn("relative flex h-10 cursor-pointer items-center rounded-md px-8 text-sm text-fg outline-none", "focus:bg-surface-2 data-[disabled]:pointer-events-none data-[disabled]:opacity-40", className),
		...props,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItemIndicator, {
			className: "absolute left-2 inline-flex",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItemText, { children })]
	});
}
var FILE_SIZE_OPTIONS = [
	{
		value: "0",
		label: "No limit"
	},
	{
		value: "0.5",
		label: "500 KB"
	},
	{
		value: "1",
		label: "1 MB"
	},
	{
		value: "2",
		label: "2 MB"
	},
	{
		value: "5",
		label: "5 MB"
	},
	{
		value: "10",
		label: "10 MB"
	},
	{
		value: "20",
		label: "20 MB"
	}
];
function SettingsForm() {
	const settings = useSettings();
	const fileSizeValue = FILE_SIZE_OPTIONS.some((o) => Number(o.value) === settings.maxFileMB) ? String(settings.maxFileMB) : "0";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
				title: "File",
				note: "Format, quality, and where the file lands.",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Image format",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: settings.format,
							onValueChange: (value) => settings.update({ format: value }),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "png",
									children: "PNG — sharp, larger"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "jpeg",
									children: "JPEG — photos, smaller"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "webp",
									children: "WebP — sharp and light"
								})
							] })]
						})
					}),
					settings.format !== "png" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: `Quality · ${Math.round(settings.quality * 100)}%`,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
							min: .5,
							max: 1,
							step: .02,
							value: [settings.quality],
							onValueChange: ([quality]) => settings.update({ quality })
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Field, {
						label: "Filename template",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: settings.filenameTemplate,
							onChange: (e) => settings.update({ filenameTemplate: e.target.value })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1.5 text-xs text-muted",
							children: [
								"Tokens: ",
								"{title}",
								" ",
								"{date}",
								" ",
								"{datetime}",
								" ",
								"{url}",
								" ",
								"{width}",
								" ",
								"{height}"
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Field, {
						label: "Download folder",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: settings.downloadDirectory,
							onChange: (e) => settings.update({ downloadDirectory: e.target.value }),
							placeholder: "Longshot"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1.5 text-xs text-muted",
							children: "Used as a subfolder of Downloads in the browser extension. In this studio, Save as lets you pick any folder."
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
				title: "Capture",
				note: "What gets included in the stitch.",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
						label: "Scroll inner frames",
						description: "Expand iframes and framesets so nested comments, widgets, and old framesets are fully captured.",
						checked: settings.captureIframes,
						onCheckedChange: (captureIframes) => settings.update({ captureIframes })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
						label: "Include browser bar",
						description: "Paint tabs, traffic lights, and a toolbar above the page.",
						checked: settings.includeBrowserBar,
						onCheckedChange: (includeBrowserBar) => settings.update({ includeBrowserBar })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
						label: "Include URL",
						description: "Show the page address in the chrome, or as a slim strip if the browser bar is off.",
						checked: settings.includeUrlBar,
						onCheckedChange: (includeUrlBar) => settings.update({ includeUrlBar })
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
				title: "Saving",
				note: "What happens after a capture.",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
						label: "Open in a new tab",
						description: "The browser extension always opens the stitch in a new tab. In this studio the editor opens in place so the preview can keep the file.",
						checked: true,
						disabled: true,
						onCheckedChange: () => {}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
						label: "Auto-download",
						description: "Save the file as soon as the stitch finishes.",
						checked: settings.autoDownload,
						onCheckedChange: (autoDownload) => settings.update({ autoDownload })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
						label: "Show a Save as dialog",
						description: "Ask where to put the file. If the browser blocks it, a normal download is used.",
						checked: settings.saveAsDialog,
						onCheckedChange: (saveAsDialog) => settings.update({ saveAsDialog })
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
				title: "Resize limits",
				note: "Scale the capture to fit a maximum box and file size.",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-4 sm:grid-cols-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Max width (px)",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "number",
									min: 320,
									max: 32768,
									value: settings.maxWidth,
									onChange: (e) => settings.update({ maxWidth: Number(e.target.value) || 0 })
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Max height (px)",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "number",
									min: 320,
									max: 65536,
									value: settings.maxHeight,
									onChange: (e) => settings.update({ maxHeight: Number(e.target.value) || 0 })
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: `Scale ${settings.scalePercent}%`,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
									min: 25,
									max: 200,
									step: 5,
									value: [settings.scalePercent],
									onValueChange: ([scalePercent]) => settings.update({ scalePercent })
								})
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Field, {
						label: "Max file size",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: fileSizeValue,
							onValueChange: (value) => settings.update({ maxFileMB: Number(value) }),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: FILE_SIZE_OPTIONS.map((opt) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: opt.value,
								children: opt.label
							}, opt.value)) })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1.5 text-xs text-muted",
							children: "If the capture would exceed this size, it is scaled down (and JPEG/WebP quality is lowered) until it fits."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: "The image is scaled uniformly so it stays inside both pixel limits. 100% keeps native pixels unless the file would exceed the box or the max file size."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "secondary",
				onClick: () => settings.reset(),
				children: "Reset to defaults"
			})
		]
	});
}
function Section({ title, note, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-xl border border-border bg-surface p-5 md:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 mb-5 text-sm text-muted",
				children: note
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-5",
				children
			})
		]
	});
}
function Field({ label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
		className: "mb-2 block",
		children: label
	}), children] });
}
function Toggle({ label, description, checked, onCheckedChange, disabled }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-start justify-between gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm font-medium",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-muted",
			children: description
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
			checked,
			onCheckedChange,
			disabled
		})]
	});
}
function SettingsPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-bg text-fg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppHeader, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
			className: "mx-auto max-w-2xl px-4 py-10 md:px-0 md:py-14",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs tracking-[0.2em] text-muted uppercase",
					children: "Preferences"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display mt-3 text-4xl",
					children: "Settings"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 mb-8 max-w-xl text-muted",
					children: "These apply to captures in this studio and match the options in the Brave/Chrome extension."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsForm, {})
			]
		})]
	});
}
//#endregion
export { SettingsPage as component };

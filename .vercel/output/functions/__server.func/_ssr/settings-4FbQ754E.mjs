import { n as create, t as persist } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings-4FbQ754E.js
var DEFAULT_SETTINGS = {
	format: "png",
	quality: .92,
	captureIframes: true,
	includeBrowserBar: false,
	includeUrlBar: false,
	autoDownload: false,
	saveAsDialog: true,
	downloadDirectory: "Longshot",
	filenameTemplate: "{title}-{date}",
	maxWidth: 8192,
	maxHeight: 32768,
	scalePercent: 100,
	maxFileMB: 0
};
var useSettings = create()(persist((set) => ({
	...DEFAULT_SETTINGS,
	update: (patch) => set(patch),
	reset: () => set(DEFAULT_SETTINGS)
}), {
	name: "longshot-settings",
	skipHydration: true,
	partialize: (state) => {
		const { update: _u, reset: _r, ...rest } = state;
		return rest;
	}
}));
if (typeof window !== "undefined") useSettings.persist.rehydrate();
function getSettings() {
	const s = useSettings.getState();
	return {
		format: s.format,
		quality: s.quality,
		captureIframes: s.captureIframes,
		includeBrowserBar: s.includeBrowserBar,
		includeUrlBar: s.includeUrlBar,
		autoDownload: s.autoDownload,
		saveAsDialog: s.saveAsDialog,
		downloadDirectory: s.downloadDirectory,
		filenameTemplate: s.filenameTemplate,
		maxWidth: s.maxWidth,
		maxHeight: s.maxHeight,
		scalePercent: s.scalePercent,
		maxFileMB: typeof s.maxFileMB === "number" && Number.isFinite(s.maxFileMB) ? s.maxFileMB : 0
	};
}
//#endregion
export { useSettings as n, getSettings as t };

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AppSettings } from "@/lib/types";

export const DEFAULT_SETTINGS: AppSettings = {
  format: "png",
  quality: 0.92,
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
  maxFileMB: 0,
};

type SettingsState = AppSettings & {
  update: (patch: Partial<AppSettings>) => void;
  reset: () => void;
};

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      update: (patch) => set(patch),
      reset: () => set(DEFAULT_SETTINGS),
    }),
    {
      name: "longshot-settings",
      skipHydration: true,
      partialize: (state) => {
        const { update: _u, reset: _r, ...rest } = state;
        return rest;
      },
    },
  ),
);

if (typeof window !== "undefined") {
  void useSettings.persist.rehydrate();
}

export function getSettings(): AppSettings {
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
    maxFileMB: typeof s.maxFileMB === "number" && Number.isFinite(s.maxFileMB) ? s.maxFileMB : 0,
  };
}

import { DEFAULTS, filename } from "./core/index.js";
import { longshotGetDirHandle, longshotWriteToDir } from "./folder.js";

// Shared by the service worker and extension pages. Pages save directly instead of
// messaging the image to the worker, which caps message size.

export async function getSettings() {
  const stored = await chrome.storage.sync.get(DEFAULTS);
  return { ...DEFAULTS, ...stored };
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function revokeWhenDone(downloadId, url) {
  const onChanged = (delta) => {
    if (delta.id !== downloadId || !delta.state) return;
    if (delta.state.current === "complete" || delta.state.current === "interrupted") {
      chrome.downloads.onChanged.removeListener(onChanged);
      URL.revokeObjectURL(url);
    }
  };
  chrome.downloads.onChanged.addListener(onChanged);
}

async function download(blob, path, saveAs) {
  // Service workers have no URL.createObjectURL; pages use a blob: URL so large
  // captures are not copied into a data: string.
  const objectUrl = typeof URL.createObjectURL === "function" ? URL.createObjectURL(blob) : null;
  try {
    const id = await chrome.downloads.download({
      url: objectUrl || (await blobToDataUrl(blob)),
      filename: path,
      saveAs: Boolean(saveAs),
      conflictAction: "uniquify",
    });
    if (objectUrl) revokeWhenDone(id, objectUrl);
  } catch (error) {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    throw error;
  }
}

export async function saveExport(blob, path, settings) {
  const handle = await longshotGetDirHandle();
  if (handle) {
    try {
      await longshotWriteToDir(handle, path, blob);
      return;
    } catch {
      /* permission expired — fall back to Downloads */
    }
  }
  await download(blob, path, settings.saveAsDialog);
}

export async function exportCapture(blob, record, kind = "image") {
  const settings = await getSettings();
  const name = filename(record, settings);
  await saveExport(blob, kind === "pdf" ? name.replace(/\.[^.]+$/, ".pdf") : name, settings);
}

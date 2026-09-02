const keys = [
  "format",
  "quality",
  "captureIframes",
  "includeBrowserBar",
  "includeUrlBar",
  "autoDownload",
  "saveAsDialog",
  "downloadDirectory",
  "filenameTemplate",
  "maxWidth",
  "maxHeight",
  "scalePercent",
  "maxFileMB",
  "oneClickCapture",
  "oneClickMode",
];

const statusEl = document.getElementById("status");
const qualityRow = document.getElementById("qualityRow");
const qualityVal = document.getElementById("qualityVal");
const scaleVal = document.getElementById("scaleVal");
const folderHint = document.getElementById("folderHint");
const downloadInput = document.getElementById("downloadDirectory");
let saveTimer = 0;
let folderLabel = "";

function isAbsolutePath(value) {
  return /^([a-zA-Z]:[\\/]|\\\\|\/)/.test(String(value || "").trim());
}

function setStatus(text) {
  statusEl.textContent = text;
}

function usesQuality(format) {
  return format === "jpeg" || format === "webp" || format === "avif";
}

function setHint(id, hint) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = hint.text;
  el.classList.toggle("warn", Boolean(hint.warn));
}

function qualityHint(percent) {
  if (percent < 70) return { text: "Below 70% you will likely see blocky artifacts, especially on text.", warn: true };
  if (percent < 80) return { text: "Fine for photos. Text and UI may look soft.", warn: true };
  if (percent <= 92) return { text: "Recommended range for screenshots is 80 to 92%.", warn: false };
  return { text: "Above 92% files grow quickly with little extra sharpness.", warn: true };
}

function scaleHint(percent) {
  if (percent < 50) return { text: "Below 50% text and UI become hard to read.", warn: true };
  if (percent < 100) return { text: "Shrinks the capture. 100% keeps native pixels.", warn: false };
  if (percent === 100) {
    return { text: "Native capture size, unless max width, height, or file size forces a shrink.", warn: false };
  }
  return { text: "Above 100% enlarges pixels. It does not add detail.", warn: true };
}

function maxWidthHint(width) {
  if (width > 0 && width < 1280) {
    return { text: "Narrower than a typical laptop capture. UI may look cramped.", warn: true };
  }
  if (width > 16384) return { text: "Very large widths can fail to encode or freeze the tab.", warn: true };
  return { text: "Caps width in pixels. Leave high unless you need a smaller export.", warn: false };
}

function maxHeightHint(height) {
  if (height > 0 && height < 2000) {
    return { text: "A short max height will scale long pages down aggressively.", warn: true };
  }
  if (height > 32768) return { text: "Very large heights can fail to encode or freeze the tab.", warn: true };
  return { text: "Caps height in pixels. Long pages scale uniformly to fit.", warn: false };
}

function maxFileHint(mb) {
  if (mb > 0 && mb <= 1) return { text: "A 1 MB cap or less will scale captures down aggressively.", warn: true };
  if (mb > 0 && mb < 5) return { text: "Tight cap. Fine for email; text may soften.", warn: true };
  if (!mb) return { text: "No file size cap. Pixel limits still apply.", warn: false };
  return { text: "If the capture would exceed this size, it is scaled down until it fits.", warn: false };
}

function syncQuality() {
  const format = document.getElementById("format").value;
  qualityRow.hidden = !usesQuality(format);
  const percent = Number(document.getElementById("quality").value);
  qualityVal.textContent = `${percent}%`;
  setHint("qualityHint", qualityHint(percent));
}

function syncScale() {
  const percent = Number(document.getElementById("scalePercent").value);
  scaleVal.textContent = `${percent}%`;
  setHint("scaleHint", scaleHint(percent));
  setHint("maxWidthHint", maxWidthHint(Number(document.getElementById("maxWidth").value)));
  setHint("maxHeightHint", maxHeightHint(Number(document.getElementById("maxHeight").value)));
  setHint("maxFileHint", maxFileHint(Number(document.getElementById("maxFileMB").value)));
}

function syncOneClick() {
  const row = document.getElementById("oneClickModeRow");
  if (row) row.hidden = !document.getElementById("oneClickCapture").checked;
}

function syncFolderHint() {
  if (folderLabel) {
    folderHint.textContent = `Saving to “${folderLabel}” on this PC. Edit the name to use a Downloads folder instead, or reset.`;
    return;
  }
  if (isAbsolutePath(downloadInput.value)) {
    folderHint.textContent =
      "Typed disk paths can’t be used directly. Browse to pick Pictures, Documents, or another folder.";
    return;
  }
  folderHint.textContent =
    "Default is a folder inside Downloads. Browse to pick Pictures, Documents, or any folder on this PC.";
}

function readPatch() {
  const patch = {};
  for (const key of keys) {
    const el = document.getElementById(key);
    if (!el) continue;
    if (el.type === "checkbox") patch[key] = el.checked;
    else if (key === "quality") patch.quality = Number(el.value) / 100;
    else if (el.type === "number" || el.type === "range") patch[key] = Number(el.value);
    else patch[key] = el.value;
  }
  patch.downloadFolderLabel = folderLabel;
  if (isAbsolutePath(patch.downloadDirectory) && !folderLabel) {
    patch.downloadDirectory = LONGSHOT_DEFAULTS.downloadDirectory;
  }
  return patch;
}

function applyData(data) {
  folderLabel = data.downloadFolderLabel || "";
  for (const key of keys) {
    const el = document.getElementById(key);
    if (!el) continue;
    if (el.type === "checkbox") el.checked = Boolean(data[key]);
    else if (key === "quality") el.value = String(Math.round((Number(data.quality) || 0.92) * 100));
    else el.value = data[key];
  }
  if (folderLabel) downloadInput.value = folderLabel;
  syncQuality();
  syncScale();
  syncFolderHint();
  syncOneClick();
}

async function persist() {
  const patch = readPatch();
  await chrome.storage.sync.set(patch);
  setStatus("Saved");
}

function queueSave() {
  syncQuality();
  syncScale();
  syncFolderHint();
  syncOneClick();
  setStatus("Saving…");
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    persist().catch(() => setStatus("Could not save"));
  }, 180);
}

async function load() {
  const data = await chrome.storage.sync.get(LONGSHOT_DEFAULTS);
  applyData({ ...LONGSHOT_DEFAULTS, ...data });
}

document.querySelectorAll("input, select").forEach((el) => {
  el.addEventListener("change", queueSave);
  el.addEventListener("input", queueSave);
});

document.getElementById("browseFolder").addEventListener("click", async () => {
  try {
    const handle = await window.showDirectoryPicker({
      id: "longshot-downloads",
      mode: "readwrite",
      startIn: "pictures",
    });
    const perm = await handle.requestPermission({ mode: "readwrite" });
    if (perm !== "granted") {
      setStatus("Folder permission was not granted");
      return;
    }
    await longshotSetDirHandle(handle);
    folderLabel = handle.name;
    downloadInput.value = handle.name;
    await persist();
    syncFolderHint();
  } catch (error) {
    if (error?.name === "AbortError") return;
    setStatus("Could not open that folder");
  }
});

downloadInput.addEventListener("input", async () => {
  if (folderLabel && downloadInput.value !== folderLabel) {
    folderLabel = "";
    await longshotClearDirHandle();
    if (!downloadInput.value) downloadInput.value = LONGSHOT_DEFAULTS.downloadDirectory;
  }
});

document.getElementById("reset").addEventListener("click", async () => {
  await longshotClearDirHandle();
  folderLabel = "";
  await chrome.storage.sync.set(LONGSHOT_DEFAULTS);
  applyData(LONGSHOT_DEFAULTS);
  setStatus("Restored defaults");
});

load();

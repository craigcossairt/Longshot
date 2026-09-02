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
];

async function load() {
  const data = await chrome.storage.sync.get(LONGSHOT_DEFAULTS);
  for (const key of keys) {
    const el = document.getElementById(key);
    if (!el) continue;
    if (el.type === "checkbox") el.checked = Boolean(data[key]);
    else el.value = data[key];
  }
}

document.getElementById("save").addEventListener("click", async () => {
  const patch = {};
  for (const key of keys) {
    const el = document.getElementById(key);
    if (el.type === "checkbox") patch[key] = el.checked;
    else if (el.type === "number") patch[key] = Number(el.value);
    else patch[key] = el.value;
  }
  await chrome.storage.sync.set(patch);
  document.getElementById("status").textContent = "Saved.";
});

load();

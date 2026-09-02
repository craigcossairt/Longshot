const status = document.getElementById("status");
const fullBtn = document.getElementById("full");
const visibleBtn = document.getElementById("visible");
const regionBtn = document.getElementById("region");
const progressWrap = document.getElementById("progressWrap");
const progressFill = document.getElementById("progressFill");
const progressBar = document.getElementById("progressBar");
const captureButtons = [fullBtn, visibleBtn, regionBtn];

function setBusy(busy) {
  captureButtons.forEach((btn) => {
    btn.disabled = busy;
  });
}

function friendlyStatus(message) {
  if (/MAX_CAPTURE_VISIBLE_TAB_CALLS_PER_SECOND/i.test(message || "")) {
    return "Chrome limited screenshot speed. Wait a second and try again.";
  }
  return message;
}

function setProgress(index, total, text) {
  progressWrap.hidden = false;
  const pct = total > 0 ? Math.max(4, Math.round((index / total) * 100)) : 8;
  const clamped = Math.min(100, pct);
  progressFill.style.width = `${clamped}%`;
  progressBar.setAttribute("aria-valuenow", String(clamped));
  status.textContent = text || `${clamped}%`;
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type !== "LONGSHOT_STATUS") return;
  if (typeof msg.index === "number" && typeof msg.total === "number") {
    setProgress(msg.index, msg.total, msg.text || "");
    return;
  }
  if (msg.text) {
    progressWrap.hidden = false;
    status.textContent = msg.text;
  }
});

function run(mode) {
  const selecting = mode === "region";
  setProgress(0, 1, selecting ? "Select an area on the page" : "Capturing");
  setBusy(true);
  chrome.runtime.sendMessage({ type: "LONGSHOT_CAPTURE", mode }, (res) => {
    setBusy(false);
    if (chrome.runtime.lastError) {
      progressFill.style.width = "0%";
      status.textContent = friendlyStatus(chrome.runtime.lastError.message);
      return;
    }
    if (!res?.ok) {
      progressFill.style.width = "0%";
      status.textContent = friendlyStatus(res?.error || "Capture failed");
      return;
    }
    setProgress(1, 1, "Opening editor");
    window.close();
  });
  if (selecting) window.close();
}

fullBtn.addEventListener("click", () => run("full"));
visibleBtn.addEventListener("click", () => run("visible"));
regionBtn.addEventListener("click", () => run("region"));
document.getElementById("options").addEventListener("click", () => chrome.runtime.openOptionsPage());

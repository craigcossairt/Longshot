const status = document.getElementById("status");

function run(mode) {
  status.textContent = "Scrolling and stitching…";
  chrome.runtime.sendMessage({ type: "LONGSHOT_CAPTURE", mode }, (res) => {
    if (chrome.runtime.lastError) {
      status.textContent = chrome.runtime.lastError.message;
      return;
    }
    if (!res?.ok) status.textContent = res?.error || "Capture failed";
    else window.close();
  });
}

document.getElementById("full").addEventListener("click", () => run("full"));
document.getElementById("visible").addEventListener("click", () => run("visible"));
document.getElementById("options").addEventListener("click", () => chrome.runtime.openOptionsPage());

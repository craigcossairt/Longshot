const rows = document.getElementById("rows");
const empty = document.getElementById("empty");
const count = document.getElementById("count");
const selectAll = document.getElementById("selectAll");
const downloadBtn = document.getElementById("downloadBtn");
const deleteBtn = document.getElementById("deleteBtn");

let items = [];
const selected = new Set();

function isHttp(url) {
  return /^https?:/i.test(url || "");
}

function render() {
  rows.replaceChildren();
  empty.hidden = items.length > 0;
  document.querySelector(".table-wrap").hidden = items.length === 0;
  items.forEach((item) => {
    const tr = document.createElement("tr");
    const checkTd = document.createElement("td");
    checkTd.className = "check";
    const box = document.createElement("input");
    box.type = "checkbox";
    box.checked = selected.has(item.id);
    box.addEventListener("change", () => {
      if (box.checked) selected.add(item.id);
      else selected.delete(item.id);
      syncActions();
    });
    checkTd.append(box);

    const capTd = document.createElement("td");
    const thumb = document.createElement("button");
    thumb.type = "button";
    thumb.className = "thumb";
    const img = document.createElement("img");
    img.src = item.thumbUrl || item.dataUrl;
    img.alt = "";
    const meta = document.createElement("span");
    const dims = document.createElement("span");
    dims.className = "dims";
    dims.textContent = `${item.width} × ${item.height}`;
    meta.append(dims);
    if (item.edited) {
      const edited = document.createElement("span");
      edited.className = "edited";
      edited.textContent = "(edited)";
      meta.append(edited);
    }
    thumb.append(img, meta);
    thumb.addEventListener("click", () => {
      location.href = `editor.html?id=${encodeURIComponent(item.id)}`;
    });
    capTd.append(thumb);

    const pageTd = document.createElement("td");
    if (isHttp(item.url)) {
      const a = document.createElement("a");
      a.className = "page";
      a.href = item.url;
      a.target = "_blank";
      a.rel = "noreferrer";
      a.textContent = item.url;
      pageTd.append(a);
    } else {
      const span = document.createElement("span");
      span.className = "muted";
      span.textContent = item.title || "Capture";
      pageTd.append(span);
    }

    const sizeTd = document.createElement("td");
    sizeTd.className = "tabular";
    sizeTd.textContent = longshotFormatBytes(item.byteSize || longshotByteSize(item.dataUrl || ""));

    const dateTd = document.createElement("td");
    dateTd.className = "tabular";
    dateTd.textContent = new Date(item.createdAt).toLocaleString(undefined, {
      month: "numeric",
      day: "numeric",
      year: "2-digit",
      hour: "numeric",
      minute: "2-digit",
    });

    tr.append(checkTd, capTd, pageTd, sizeTd, dateTd);
    rows.append(tr);
  });
  syncActions();
}

function syncActions() {
  const n = selected.size;
  count.textContent = n ? `(${n} selected)` : `${items.length} saved`;
  downloadBtn.disabled = n === 0;
  deleteBtn.disabled = n === 0;
  selectAll.checked = items.length > 0 && n === items.length;
}

selectAll.addEventListener("change", () => {
  selected.clear();
  if (selectAll.checked) items.forEach((item) => selected.add(item.id));
  render();
});

downloadBtn.addEventListener("click", async () => {
  const chosen = items.filter((item) => selected.has(item.id));
  for (const item of chosen) {
    chrome.runtime.sendMessage({
      type: "LONGSHOT_EXPORT",
      kind: "image",
      dataUrl: item.dataUrl,
      format: item.format,
      title: item.title,
      url: item.url,
      createdAt: item.createdAt,
      width: item.width,
      height: item.height,
    });
  }
});

deleteBtn.addEventListener("click", async () => {
  const ids = [...selected];
  await longshotHistoryDelete(ids);
  items = items.filter((item) => !selected.has(item.id));
  selected.clear();
  render();
});

longshotHistoryGetAll().then((list) => {
  items = list;
  render();
});

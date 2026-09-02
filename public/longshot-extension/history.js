const LONGSHOT_HISTORY_DB = "longshot-history";
const LONGSHOT_HISTORY_STORE = "items";
const LONGSHOT_HISTORY_MAX = 50;

function longshotByteSize(dataUrl) {
  if (!dataUrl) return 0;
  const comma = String(dataUrl).indexOf(",");
  const b64 = comma >= 0 ? String(dataUrl).slice(comma + 1) : String(dataUrl);
  return Math.round(b64.length * 0.75);
}

function longshotFormatBytes(bytes) {
  if (!bytes) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function longshotHistoryDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(LONGSHOT_HISTORY_DB, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(LONGSHOT_HISTORY_STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function longshotHistoryGetAll() {
  const db = await longshotHistoryDb();
  try {
    return await new Promise((resolve, reject) => {
      const req = db.transaction(LONGSHOT_HISTORY_STORE, "readonly").objectStore(LONGSHOT_HISTORY_STORE).get("list");
      req.onsuccess = () => resolve(Array.isArray(req.result) ? req.result : []);
      req.onerror = () => reject(req.error);
    });
  } finally {
    db.close();
  }
}

async function longshotHistorySetAll(items) {
  const db = await longshotHistoryDb();
  try {
    await new Promise((resolve, reject) => {
      const tx = db.transaction(LONGSHOT_HISTORY_STORE, "readwrite");
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.objectStore(LONGSHOT_HISTORY_STORE).put(items, "list");
    });
  } finally {
    db.close();
  }
}

async function longshotMakeThumb(dataUrl) {
  try {
    const blob = await (await fetch(dataUrl)).blob();
    const bmp = await createImageBitmap(blob);
    const w = 144;
    const h = Math.max(1, Math.round((bmp.height / Math.max(1, bmp.width)) * w));
    const canvas = new OffscreenCanvas(w, Math.min(h, 260));
    canvas.getContext("2d").drawImage(bmp, 0, 0, w, h);
    const out = await canvas.convertToBlob({ type: "image/jpeg", quality: 0.72 });
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(out);
    });
  } catch {
    return dataUrl;
  }
}

async function longshotPushHistory(record) {
  const item = {
    ...record,
    id: record.id || crypto.randomUUID(),
    thumbUrl: record.thumbUrl || (await longshotMakeThumb(record.dataUrl)),
    byteSize: record.byteSize || longshotByteSize(record.dataUrl),
  };
  let items = [item, ...(await longshotHistoryGetAll()).filter((entry) => entry.id !== item.id)].slice(
    0,
    LONGSHOT_HISTORY_MAX,
  );
  try {
    await longshotHistorySetAll(items);
  } catch {
    items = items.slice(0, Math.max(1, items.length - 2));
    await longshotHistorySetAll(items);
  }
  return item;
}

async function longshotHistoryDelete(ids) {
  const drop = new Set(ids);
  const items = (await longshotHistoryGetAll()).filter((item) => !drop.has(item.id));
  await longshotHistorySetAll(items);
}

async function longshotHistoryGet(id) {
  return (await longshotHistoryGetAll()).find((item) => item.id === id) || null;
}

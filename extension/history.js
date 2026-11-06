const LONGSHOT_HISTORY_DB = "longshot-history";
const STORE = "captures";
const DELETED = "deleted";
const LONGSHOT_HISTORY_MAX = 50;

export function longshotByteSize(dataUrl) {
  if (!dataUrl) return 0;
  const b64 = String(dataUrl).split(",").at(-1);
  return Math.max(0, Math.floor(b64.length * 0.75) - (b64.match(/=+$/)?.[0].length || 0));
}

export function longshotFormatBytes(bytes) {
  if (!bytes) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function openDb() {
  return new Promise((resolve, reject) => {
    let blocked = false;
    const req = indexedDB.open(LONGSHOT_HISTORY_DB, 2);
    req.onupgradeneeded = () => {
      const db = req.result;
      const captures = db.createObjectStore(STORE, { keyPath: "id" });
      captures.createIndex("updatedAt", "updatedAt");
      db.createObjectStore(DELETED);
      if (db.objectStoreNames.contains("items")) {
        const legacy = req.transaction.objectStore("items").get("list");
        legacy.onsuccess = () => {
          const items = Array.isArray(legacy.result) ? legacy.result : [];
          // Migration and removal commit together; a failed upgrade preserves v1.
          for (const [i, item] of items.entries()) {
            captures.put({ ...item, id: item.id || crypto.randomUUID(), revision: 1,
              updatedAt: item.updatedAt || item.createdAt || Date.now() - i });
          }
          db.deleteObjectStore("items");
        };
      }
    };
    req.onsuccess = () => {
      if (blocked) { req.result.close(); return; }
      req.result.onversionchange = () => req.result.close();
      resolve(req.result);
    };
    req.onerror = () => reject(req.error);
    req.onblocked = () => {
      blocked = true;
      reject(new Error("Close other Longshot tabs to update saved captures."));
    };
  });
}

async function transaction(mode, run) {
  const db = await openDb();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction([STORE, DELETED], mode);
      let result;
      let failure;
      tx.oncomplete = () => resolve(result);
      tx.onabort = () => reject(failure || tx.error || new Error("Could not save captures."));
      tx.onerror = () => { /* onabort owns rejection */ };
      run(tx.objectStore(STORE), tx.objectStore(DELETED), (value) => { result = value; }, (error) => {
        failure = error;
        tx.abort();
      });
    });
  } finally {
    db.close();
  }
}

export async function longshotHistoryGetAll() {
  return transaction("readonly", (captures, _deleted, done) => {
    captures.getAll().onsuccess = (e) => done(e.target.result.sort((a, b) => b.updatedAt - a.updatedAt));
  });
}

export async function longshotHistoryGet(id) {
  return transaction("readonly", (captures, _deleted, done) => {
    captures.get(id).onsuccess = (e) => done(e.target.result || null);
  });
}

async function makeThumb(dataUrl) {
  let bmp;
  try {
    bmp = await createImageBitmap(await (await fetch(dataUrl)).blob());
    const w = 144;
    const h = Math.max(1, Math.round(bmp.height / Math.max(1, bmp.width) * w));
    const canvas = new OffscreenCanvas(w, Math.min(h, 260));
    canvas.getContext("2d").drawImage(bmp, 0, 0, w, h);
    const blob = await canvas.convertToBlob({ type: "image/jpeg", quality: 0.72 });
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  } catch {
    return dataUrl;
  } finally {
    bmp?.close();
  }
}

async function writeRecord(record, updateOnly) {
  const item = { ...record, id: record.id || crypto.randomUUID(),
    thumbUrl: await makeThumb(record.dataUrl), byteSize: longshotByteSize(record.dataUrl) };
  return transaction("readwrite", (captures, deleted, done, fail) => {
    deleted.get(item.id).onsuccess = (tombstone) => {
      if (tombstone.target.result) return fail(new Error("This capture was deleted. Your open copy has not been saved."));
      captures.get(item.id).onsuccess = (event) => {
        const previous = event.target.result;
        if (updateOnly && !previous) return fail(new Error("This capture is no longer in Files."));
        if (previous && record.revision !== previous.revision) {
          return fail(new Error("This capture changed in another tab. Reopen it before editing."));
        }
        item.revision = (previous?.revision || 0) + 1;
        item.updatedAt = Date.now();
        captures.put(item);
        let count = 0;
        captures.index("updatedAt").openCursor(null, "prev").onsuccess = (e) => {
          const cursor = e.target.result;
          if (!cursor) return;
          if (++count > LONGSHOT_HISTORY_MAX) {
            deleted.put(true, cursor.primaryKey);
            cursor.delete();
          }
          cursor.continue();
        };
        done(item);
      };
    };
  });
}

export function longshotPushHistory(record) { return writeRecord(record, false); }
export function longshotHistoryUpdate(record) { return writeRecord(record, true); }

export async function longshotHistoryDelete(ids) {
  await transaction("readwrite", (captures, deleted) => {
    for (const id of ids) {
      captures.delete(id);
      deleted.put(true, id);
    }
  });
}

const LONGSHOT_FOLDER_DB = "longshot-folder";
const LONGSHOT_FOLDER_STORE = "handles";
const LONGSHOT_FOLDER_KEY = "downloadDir";

function longshotFolderDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(LONGSHOT_FOLDER_DB, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(LONGSHOT_FOLDER_STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function longshotGetDirHandle() {
  const db = await longshotFolderDb();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(LONGSHOT_FOLDER_STORE, "readonly");
      const req = tx.objectStore(LONGSHOT_FOLDER_STORE).get(LONGSHOT_FOLDER_KEY);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } finally {
    db.close();
  }
}

async function longshotSetDirHandle(handle) {
  const db = await longshotFolderDb();
  try {
    await new Promise((resolve, reject) => {
      const tx = db.transaction(LONGSHOT_FOLDER_STORE, "readwrite");
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.objectStore(LONGSHOT_FOLDER_STORE).put(handle, LONGSHOT_FOLDER_KEY);
    });
  } finally {
    db.close();
  }
}

async function longshotClearDirHandle() {
  const db = await longshotFolderDb();
  try {
    await new Promise((resolve, reject) => {
      const tx = db.transaction(LONGSHOT_FOLDER_STORE, "readwrite");
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.objectStore(LONGSHOT_FOLDER_STORE).delete(LONGSHOT_FOLDER_KEY);
    });
  } finally {
    db.close();
  }
}

function longshotLeafName(path) {
  return String(path || "capture")
    .replace(/\\/g, "/")
    .split("/")
    .filter(Boolean)
    .pop();
}

async function longshotWriteToDir(handle, filename, blob) {
  let perm = await handle.queryPermission({ mode: "readwrite" });
  if (perm !== "granted" && handle.requestPermission) {
    perm = await handle.requestPermission({ mode: "readwrite" });
  }
  if (perm !== "granted") throw new Error("Folder permission needed");
  // A shared origin lock also serializes writes from different editor tabs and
  // the service worker. getFileHandle({create:true}) alone overwrites collisions.
  if (!globalThis.navigator?.locks) throw new Error("Safe folder saving is unavailable");
  return navigator.locks.request("longshot-folder-write", async () => {
    const leaf = longshotLeafName(filename) || "capture";
    const dot = leaf.lastIndexOf(".");
    const stem = dot > 0 ? leaf.slice(0, dot) : leaf;
    const ext = dot > 0 ? leaf.slice(dot) : "";
    let name = leaf;
    for (let suffix = 1; ; suffix++) {
      try {
        await handle.getFileHandle(name);
      } catch (error) {
        if (error?.name === "NotFoundError") break;
        // A directory with this name is a collision too.
        if (error?.name !== "TypeMismatchError") throw error;
      }
      name = `${stem} (${suffix})${ext}`;
    }
    const fileHandle = await handle.getFileHandle(name, { create: true });
    const writable = await fileHandle.createWritable();
    try {
      await writable.write(blob);
      await writable.close();
    } catch (error) {
      await writable.abort().catch(() => {});
      throw error;
    }
    return name;
  });
}

export { longshotClearDirHandle, longshotGetDirHandle, longshotSetDirHandle, longshotWriteToDir };

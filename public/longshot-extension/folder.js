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
  const fileHandle = await handle.getFileHandle(longshotLeafName(filename), { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(blob);
  await writable.close();
}

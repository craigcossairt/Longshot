type DirHandle = {
  name: string;
  queryPermission: (descriptor: { mode: "readwrite" }) => Promise<PermissionState>;
  requestPermission: (descriptor: { mode: "readwrite" }) => Promise<PermissionState>;
  getFileHandle: (
    name: string,
    options: { create: boolean },
  ) => Promise<{
    createWritable: () => Promise<{ write: (data: Blob) => Promise<void>; close: () => Promise<void> }>;
  }>;
};

type DirectoryPickerWindow = Window & {
  showDirectoryPicker?: (options?: {
    id?: string;
    mode?: "read" | "readwrite";
    startIn?: "desktop" | "documents" | "downloads" | "music" | "pictures" | "videos";
  }) => Promise<DirHandle>;
};

const DB_NAME = "longshot-folder";
const STORE = "handles";
const KEY = "downloadDir";

function openDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function getDownloadDirHandle() {
  const db = await openDb();
  try {
    return await new Promise<DirHandle | null>((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(KEY);
      req.onsuccess = () => resolve((req.result as DirHandle) || null);
      req.onerror = () => reject(req.error);
    });
  } finally {
    db.close();
  }
}

export async function setDownloadDirHandle(handle: DirHandle) {
  const db = await openDb();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.objectStore(STORE).put(handle, KEY);
    });
  } finally {
    db.close();
  }
}

export async function clearDownloadDirHandle() {
  const db = await openDb();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.objectStore(STORE).delete(KEY);
    });
  } finally {
    db.close();
  }
}

export async function writeToDownloadDir(handle: DirHandle, filename: string, blob: Blob) {
  const leaf = filename.replace(/\\/g, "/").split("/").filter(Boolean).pop() || "capture";
  let perm = await handle.queryPermission({ mode: "readwrite" });
  if (perm !== "granted") {
    perm = await handle.requestPermission({ mode: "readwrite" });
  }
  if (perm !== "granted") throw new Error("Folder permission needed");
  const fileHandle = await handle.getFileHandle(leaf, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(blob);
  await writable.close();
}

export async function pickDownloadDirectory() {
  const picker = (window as DirectoryPickerWindow).showDirectoryPicker;
  if (!picker) throw new Error("This browser cannot pick a folder");
  const handle = await picker({
    id: "longshot-downloads",
    mode: "readwrite",
    startIn: "pictures",
  });
  const perm = await handle.requestPermission({ mode: "readwrite" });
  if (perm !== "granted") throw new Error("Folder permission was not granted");
  await setDownloadDirHandle(handle);
  return handle.name;
}

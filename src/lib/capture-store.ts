import { create } from "zustand";
import type { Annotation, CaptureRecord, CropRect } from "@/lib/types";

const DB_NAME = "longshot";
const STORE = "captures";

function openDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

const HISTORY_MAX = 50;

async function persistCapture(record: CaptureRecord | null) {
  if (typeof indexedDB === "undefined") return;
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      const store = tx.objectStore(STORE);
      if (record) store.put(record, "current");
      else store.delete("current");
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Private mode / quota: memory still holds the capture.
  }
}

async function persistHistory(items: CaptureRecord[]) {
  if (typeof indexedDB === "undefined") return;
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(items, "history");
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    /* quota */
  }
}

async function makeThumb(dataUrl: string) {
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("thumb"));
      img.src = dataUrl;
    });
    const w = 144;
    const h = Math.max(1, Math.round((img.naturalHeight / Math.max(1, img.naturalWidth)) * w));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = Math.min(h, 260);
    const ctx = canvas.getContext("2d");
    if (!ctx) return dataUrl;
    ctx.drawImage(img, 0, 0, w, h);
    return canvas.toDataURL("image/jpeg", 0.72);
  } catch {
    return dataUrl;
  }
}

function estimateBytes(dataUrl: string) {
  const comma = dataUrl.indexOf(",");
  const b64 = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
  return Math.round(b64.length * 0.75);
}

async function rememberCapture(capture: CaptureRecord) {
  const thumbUrl = capture.thumbUrl || (await makeThumb(capture.dataUrl));
  const item = {
    ...capture,
    thumbUrl,
    byteSize: capture.byteSize || estimateBytes(capture.dataUrl),
  };
  const past = [item, ...useCapture.getState().past.filter((entry) => entry.id !== item.id)].slice(0, HISTORY_MAX);
  useCapture.setState({ past });
  await persistHistory(past);
}

async function readPersistedCapture(): Promise<CaptureRecord | null> {
  if (typeof indexedDB === "undefined") return null;
  try {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get("current");
      req.onsuccess = () => resolve((req.result as CaptureRecord) ?? null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

type EditFrame = {
  annotations: Annotation[];
  capture: CaptureRecord | null;
};

type CaptureState = {
  current: CaptureRecord | null;
  past: CaptureRecord[];
  annotations: Annotation[];
  crop: CropRect | null;
  history: EditFrame[];
  future: EditFrame[];
  setCapture: (capture: CaptureRecord | null) => void;
  replaceImage: (capture: CaptureRecord) => void;
  applyEdit: (next: { capture?: CaptureRecord; annotations?: Annotation[] }) => void;
  setAnnotations: (next: Annotation[] | ((prev: Annotation[]) => Annotation[])) => void;
  commit: (next: Annotation[]) => void;
  undo: () => void;
  redo: () => void;
  setCrop: (crop: CropRect | null) => void;
  resetEdits: () => void;
  removePast: (ids: string[]) => void;
};

export const useCapture = create<CaptureState>((set, get) => ({
  current: null,
  past: [],
  annotations: [],
  crop: null,
  history: [],
  future: [],
  setCapture: (capture) => {
    void persistCapture(capture);
    if (capture) void rememberCapture(capture);
    set({
      current: capture,
      annotations: [],
      crop: null,
      history: [],
      future: [],
    });
  },
  replaceImage: (capture) => {
    void persistCapture(capture);
    set({ current: capture, crop: null });
  },
  applyEdit: (next) => {
    const { annotations, current, history } = get();
    const capture = next.capture !== undefined ? next.capture : current;
    const anns = next.annotations !== undefined ? next.annotations : annotations;
    if (next.capture) void persistCapture(next.capture);
    set({
      current: capture,
      annotations: anns,
      crop: null,
      history: [...history, { annotations, capture: current }].slice(-80),
      future: [],
    });
  },
  setAnnotations: (next) => {
    const resolved = typeof next === "function" ? next(get().annotations) : next;
    set({ annotations: resolved });
  },
  commit: (next) => {
    const { annotations, current, history } = get();
    set({
      annotations: next,
      history: [...history, { annotations, capture: current }].slice(-80),
      future: [],
    });
  },
  undo: () => {
    const { history, annotations, current, future } = get();
    const prev = history[history.length - 1];
    if (!prev) return;
    if (prev.capture !== current) void persistCapture(prev.capture);
    set({
      annotations: prev.annotations,
      current: prev.capture,
      crop: null,
      history: history.slice(0, -1),
      future: [{ annotations, capture: current }, ...future].slice(0, 80),
    });
  },
  redo: () => {
    const { future, annotations, current, history } = get();
    const nxt = future[0];
    if (!nxt) return;
    if (nxt.capture !== current) void persistCapture(nxt.capture);
    set({
      annotations: nxt.annotations,
      current: nxt.capture,
      crop: null,
      future: future.slice(1),
      history: [...history, { annotations, capture: current }].slice(-80),
    });
  },
  setCrop: (crop) => set({ crop }),
  resetEdits: () => set({ annotations: [], crop: null, history: [], future: [] }),
  removePast: (ids) => {
    const idSet = new Set(ids);
    const past = get().past.filter((item) => !idSet.has(item.id));
    const cur = get().current;
    const current = cur && idSet.has(cur.id) ? null : cur;
    if (current !== get().current) void persistCapture(current);
    set({ past, current });
    void persistHistory(past);
  },
}));

async function readPersistedHistory(): Promise<CaptureRecord[]> {
  if (typeof indexedDB === "undefined") return [];
  try {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get("history");
      req.onsuccess = () => resolve(Array.isArray(req.result) ? (req.result as CaptureRecord[]) : []);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

export async function hydrateCaptureFromSession() {
  const past = await readPersistedHistory();
  if (past.length) useCapture.setState({ past });
  if (useCapture.getState().current) return;
  const stored = await readPersistedCapture();
  if (stored) useCapture.setState({ current: stored });
}

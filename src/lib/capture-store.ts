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
    // Private mode / quota — memory still holds the capture.
  }
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

type CaptureState = {
  current: CaptureRecord | null;
  annotations: Annotation[];
  crop: CropRect | null;
  history: Annotation[][];
  future: Annotation[][];
  setCapture: (capture: CaptureRecord | null) => void;
  replaceImage: (capture: CaptureRecord) => void;
  setAnnotations: (next: Annotation[] | ((prev: Annotation[]) => Annotation[])) => void;
  commit: (next: Annotation[]) => void;
  undo: () => void;
  redo: () => void;
  setCrop: (crop: CropRect | null) => void;
  resetEdits: () => void;
};

export const useCapture = create<CaptureState>((set, get) => ({
  current: null,
  annotations: [],
  crop: null,
  history: [],
  future: [],
  setCapture: (capture) => {
    void persistCapture(capture);
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
  setAnnotations: (next) => {
    const resolved = typeof next === "function" ? next(get().annotations) : next;
    set({ annotations: resolved });
  },
  commit: (next) => {
    const { annotations, history } = get();
    set({
      annotations: next,
      history: [...history, annotations].slice(-80),
      future: [],
    });
  },
  undo: () => {
    const { history, annotations, future } = get();
    const prev = history[history.length - 1];
    if (!prev) return;
    set({
      annotations: prev,
      history: history.slice(0, -1),
      future: [annotations, ...future].slice(0, 80),
    });
  },
  redo: () => {
    const { future, annotations, history } = get();
    const nxt = future[0];
    if (!nxt) return;
    set({
      annotations: nxt,
      future: future.slice(1),
      history: [...history, annotations].slice(-80),
    });
  },
  setCrop: (crop) => set({ crop }),
  resetEdits: () => set({ annotations: [], crop: null, history: [], future: [] }),
}));

export async function hydrateCaptureFromSession() {
  if (useCapture.getState().current) return;
  const stored = await readPersistedCapture();
  if (stored) useCapture.setState({ current: stored });
}

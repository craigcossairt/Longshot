import { useCallback, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { captureElement, captureFromDataUrl, captureFromFile, type CaptureMeta } from "@/lib/capture";
import { useCapture } from "@/lib/capture-store";
import { getSettings } from "@/lib/settings";
import { rasterize } from "@/lib/rasterize";
import { exportCaptureFile } from "@/lib/image-io";
import { openEditor } from "@/lib/open-editor";
import type { CaptureRecord } from "@/lib/types";

export function useCaptureFlow() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("Capturing");

  const finish = useCallback(
    async (record: CaptureRecord) => {
      useCapture.getState().setCapture(record);
      const settings = getSettings();
      if (settings.autoDownload) {
        setStatus("Saving");
        const canvas = await rasterize(record.dataUrl, [], null);
        await exportCaptureFile(canvas, record, settings, "image");
      }
      setStatus("Opening");
      openEditor(navigate);
    },
    [navigate],
  );

  const captureNode = useCallback(
    async (node: HTMLElement, meta: CaptureMeta) => {
      setBusy(true);
      setStatus("Scrolling page");
      try {
        await new Promise((r) => setTimeout(r, 280));
        setStatus("Stitching frames");
        const record = await captureElement(node, meta);
        await finish(record);
        toast.success("Capture ready");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Capture failed");
      } finally {
        setBusy(false);
      }
    },
    [finish],
  );

  const importFile = useCallback(
    async (file: File) => {
      setBusy(true);
      setStatus("Reading image");
      try {
        const record = await captureFromFile(file);
        await finish(record);
        toast.success("Image opened");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not open file");
      } finally {
        setBusy(false);
      }
    },
    [finish],
  );

  const importDataUrl = useCallback(
    async (dataUrl: string) => {
      setBusy(true);
      setStatus("Reading clipboard");
      try {
        const record = await captureFromDataUrl(dataUrl);
        await finish(record);
        toast.success("Pasted into editor");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Nothing to paste");
      } finally {
        setBusy(false);
      }
    },
    [finish],
  );

  return { busy, status, captureNode, importFile, importDataUrl };
}

export function CaptureOverlay({ busy, status }: { busy: boolean; status: string }) {
  if (!busy) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 px-6">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-6 shadow-soft">
        <p className="text-xs tracking-[0.18em] text-muted uppercase">Longshot</p>
        <p className="font-display mt-2 text-2xl">{status}</p>
        <div className="relative mt-5 h-2 overflow-hidden rounded-full border border-border bg-surface-2">
          <div className="absolute inset-y-0 w-1/3 rounded-full bg-primary animate-indet" />
          <div className="progress-sheen-layer" />
        </div>
        <p className="mt-3 text-sm text-muted">Scrolling inner frames, then stitching the page.</p>
      </div>
    </div>
  );
}

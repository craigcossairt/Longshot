import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Download, Trash2 } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { hydrateCaptureFromSession, useCapture } from "@/lib/capture-store";
import { formatBytes, formatCapturedAt } from "@/lib/file-size";
import { saveBlob } from "@/lib/image-io";
import { getSettings } from "@/lib/settings";
import { buildFilename } from "@/lib/filename";

export const Route = createFileRoute("/files")({
  component: FilesPage,
});

function FilesPage() {
  const past = useCapture((s) => s.past);
  const removePast = useCapture((s) => s.removePast);
  const setCapture = useCapture((s) => s.setCapture);
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    void hydrateCaptureFromSession();
  }, []);

  const allIds = past.map((item) => item.id);
  const allOn = allIds.length > 0 && selected.length === allIds.length;
  const chosen = past.filter((item) => selected.includes(item.id));

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function downloadChosen() {
    const settings = getSettings();
    for (const item of chosen) {
      const blob = await (await fetch(item.dataUrl)).blob();
      await saveBlob(blob, buildFilename(item, settings), settings.saveAsDialog);
    }
  }

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-4 py-8 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs tracking-[0.2em] text-muted uppercase">Library</p>
            <h1 className="font-display mt-2 text-4xl">Files</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted">
              {chosen.length ? `(${chosen.length} selected)` : `${past.length} saved`}
            </span>
            <Button variant="secondary" size="sm" disabled={!chosen.length} onClick={() => void downloadChosen()}>
              <Download /> Download
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={!chosen.length}
              onClick={() => {
                removePast(selected);
                setSelected([]);
              }}
            >
              <Trash2 /> Delete
            </Button>
          </div>
        </div>

        {past.length === 0 ? (
          <p className="mt-10 text-muted">No captures yet. Capture a page and it will show up here.</p>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-surface">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted">
                  <th className="w-10 p-3">
                    <input
                      type="checkbox"
                      checked={allOn}
                      onChange={() => setSelected(allOn ? [] : allIds)}
                      aria-label="Select all"
                    />
                  </th>
                  <th className="p-3 font-medium">Capture</th>
                  <th className="p-3 font-medium">Page</th>
                  <th className="p-3 font-medium">Size</th>
                  <th className="p-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {past.map((item) => (
                  <tr key={item.id} className="border-b border-border last:border-0">
                    <td className="p-3 align-middle">
                      <input
                        type="checkbox"
                        checked={selected.includes(item.id)}
                        onChange={() => toggle(item.id)}
                        aria-label={`Select ${item.title}`}
                      />
                    </td>
                    <td className="p-3">
                      <button
                        type="button"
                        className="flex items-center gap-3 text-left"
                        onClick={() => {
                          setCapture(item);
                          void navigate({ to: "/editor" });
                        }}
                      >
                        <img
                          src={item.thumbUrl || item.dataUrl}
                          alt=""
                          className="h-14 w-20 shrink-0 rounded-sm object-cover object-top bg-canvas"
                        />
                        <span>
                          <span className="block text-fg">
                            {item.width} × {item.height}
                            {item.edited ? <span className="ml-2 text-muted">(edited)</span> : null}
                          </span>
                          <span className="block text-xs text-muted">{item.format.toUpperCase()}</span>
                        </span>
                      </button>
                    </td>
                    <td className="max-w-sm p-3">
                      {item.url?.startsWith("http") ? (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="break-all text-primary hover:underline"
                        >
                          {item.url}
                        </a>
                      ) : (
                        <span className="text-muted">{item.title}</span>
                      )}
                    </td>
                    <td className="p-3 tabular-nums text-muted">{formatBytes(item.byteSize || 0)}</td>
                    <td className="p-3 tabular-nums text-muted">{formatCapturedAt(item.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

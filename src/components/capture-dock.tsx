import { Link } from "@tanstack/react-router";
import { Camera, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SamplePage } from "@/lib/samples";

export function CaptureDock({
  sample,
  onCapture,
  busy,
}: {
  sample: SamplePage;
  onCapture: () => void;
  busy: boolean;
}) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
      <div className="pointer-events-auto w-full max-w-xl overflow-hidden rounded-xl border border-border bg-bg/95 shadow-soft backdrop-blur-sm">
        {busy && (
          <div className="relative h-1.5 overflow-hidden bg-surface-2" role="progressbar" aria-valuetext="Capturing">
            <div className="absolute inset-y-0 w-1/3 rounded-full bg-primary animate-indet" />
          </div>
        )}
        <div className="flex items-center gap-2 p-2">
          <div className="min-w-0 flex-1 px-2">
            <p className="truncate text-sm text-fg">{sample.title}</p>
            <p className="truncate text-xs text-muted">{busy ? "Capturing this page" : sample.url}</p>
          </div>
          <Button variant="ghost" size="icon-sm" asChild aria-label="Settings">
            <Link to="/settings">
              <Settings />
            </Link>
          </Button>
          <Button onClick={onCapture} disabled={busy}>
            <Camera />
            {busy ? "Capturing" : "Capture page"}
          </Button>
        </div>
      </div>
    </div>
  );
}

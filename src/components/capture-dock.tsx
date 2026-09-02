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
      <div className="pointer-events-auto flex w-full max-w-xl items-center gap-2 rounded-xl border border-border bg-bg/95 p-2 shadow-soft backdrop-blur-sm">
        <div className="min-w-0 flex-1 px-2">
          <p className="truncate text-sm text-fg">{sample.title}</p>
          <p className="truncate text-xs text-muted">{sample.url}</p>
        </div>
        <Button variant="ghost" size="icon-sm" asChild aria-label="Settings">
          <Link to="/settings">
            <Settings />
          </Link>
        </Button>
        <Button onClick={onCapture} disabled={busy}>
          <Camera />
          Capture page
        </Button>
      </div>
    </div>
  );
}

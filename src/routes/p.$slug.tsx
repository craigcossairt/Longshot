import { useEffect, useMemo, useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CaptureDock } from "@/components/capture-dock";
import { CaptureOverlay, useCaptureFlow } from "@/components/capture-flow";
import { SampleDocument } from "@/components/samples/render";
import { getSample } from "@/lib/samples";

export const Route = createFileRoute("/p/$slug")({
  validateSearch: (search: Record<string, unknown>): { capture?: boolean } => {
    const on = search.capture === true || search.capture === "1" || search.capture === "true";
    return on ? { capture: true } : {};
  },
  component: SampleRoute,
});

function SampleRoute() {
  const { slug } = Route.useParams();
  const { capture } = Route.useSearch();
  const sample = getSample(slug);
  const rootRef = useRef<HTMLDivElement>(null);
  const { busy, status, captureNode } = useCaptureFlow();
  const captureNodeRef = useRef(captureNode);
  captureNodeRef.current = captureNode;
  const meta = useMemo(
    () => ({
      title: sample?.title ?? "Page",
      url: sample?.url ?? "https://longshot.local",
    }),
    [sample],
  );

  useEffect(() => {
    if (!capture || !rootRef.current || !sample) return;
    const node = rootRef.current;
    const t = window.setTimeout(() => {
      void captureNodeRef.current(node, meta);
    }, sample.hasFrames ? 1100 : 400);
    return () => window.clearTimeout(t);
  }, [capture, meta, sample]);

  if (!sample) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-bg text-fg">
        <p>That sample isn’t here.</p>
        <Link to="/" className="mt-3 text-muted underline">
          Back to studio
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-bg">
      <div ref={rootRef} id="sample-root">
        <SampleDocument slug={sample.slug} />
      </div>
      <CaptureDock
        sample={sample}
        busy={busy}
        onCapture={() => {
          if (rootRef.current) void captureNode(rootRef.current, meta);
        }}
      />
      <CaptureOverlay busy={busy} status={status} />
    </div>
  );
}

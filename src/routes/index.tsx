import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Camera, ClipboardPaste, Crop, Download, Frame, Upload } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { CaptureOverlay, useCaptureFlow } from "@/components/capture-flow";
import { SampleDocument } from "@/components/samples/render";
import { HiddenFileInput } from "@/components/hidden-file-input";
import { SAMPLES } from "@/lib/samples";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const { busy, status, captureNode, importFile, importDataUrl } = useCaptureFlow();
  const [pending, setPending] = useState<string | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const captureNodeRef = useRef(captureNode);
  captureNodeRef.current = captureNode;

  useEffect(() => {
    if (!pending || !stageRef.current) return;
    const node = stageRef.current;
    const sample = SAMPLES.find((s) => s.slug === pending);
    if (!sample) return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      if (cancelled || !stageRef.current) return;
      void captureNodeRef.current(node, { title: sample.title, url: sample.url }).finally(() => {
        if (!cancelled) setPending(null);
      });
    }, pending === "thread" ? 1100 : 450);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [pending]);

  useEffect(() => {
    function onPaste(e: ClipboardEvent) {
      const item = [...(e.clipboardData?.items ?? [])].find((i) => i.type.startsWith("image/"));
      if (!item) return;
      const file = item.getAsFile();
      if (file) void importFile(file);
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [importFile]);

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 py-10 md:px-8 md:py-16">
        <section className="stagger-in max-w-3xl">
          <p className="text-xs tracking-[0.2em] text-muted uppercase">Full-page capture studio</p>
          <h1 className="font-display mt-4 text-4xl leading-tight md:text-6xl">The whole page, in one shot.</h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
            A GoFullPage replacement you control. Capture long pages, scroll nested frames, crop,
            annotate, and export PNG, JPEG, WebP, or PDF.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button onClick={() => setPending("field-notes")} disabled={busy}>
              <Camera />
              Capture a sample
            </Button>
            <Button variant="secondary" asChild>
              <Link to="/install">Install the extension</Link>
            </Button>
          </div>
        </section>

        <section className="mt-14 grid gap-4 md:grid-cols-2">
          {SAMPLES.map((sample) => (
            <article key={sample.slug} className="rounded-xl border border-border bg-surface p-5">
              <p className="text-xs tracking-[0.16em] text-muted uppercase">{sample.kicker}</p>
              <h2 className="font-display mt-2 text-2xl">{sample.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{sample.description}</p>
              <p className="mt-3 text-xs text-subtle">{sample.heightLabel}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Button size="sm" onClick={() => setPending(sample.slug)} disabled={busy}>
                  Capture
                </Button>
                <Button size="sm" variant="secondary" asChild>
                  <Link to="/p/$slug" params={{ slug: sample.slug }}>
                    Open page
                  </Link>
                </Button>
              </div>
            </article>
          ))}
        </section>

        <section
          className="mt-8 rounded-xl border border-dashed border-border-strong bg-surface/50 px-6 py-10 text-center"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file?.type.startsWith("image/")) void importFile(file);
          }}
        >
          <p className="font-display text-2xl">Or bring your own shot</p>
          <p className="mt-2 text-sm text-muted">
            Upload a screenshot, drop a file, or paste from the clipboard.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button variant="secondary" onClick={() => fileRef.current?.click()}>
              <Upload />
              Upload image
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  const items = await navigator.clipboard.read();
                  for (const item of items) {
                    const type = item.types.find((t) => t.startsWith("image/"));
                    if (!type) continue;
                    const blob = await item.getType(type);
                    const reader = new FileReader();
                    reader.onload = () => void importDataUrl(String(reader.result));
                    reader.readAsDataURL(blob);
                    return;
                  }
                  toast.error("Clipboard has no image");
                } catch {
                  toast.error("Could not read clipboard — copy a screenshot and press Ctrl+V");
                }
              }}
            >
              <ClipboardPaste />
              Paste
            </Button>
          </div>
          <HiddenFileInput
            ref={fileRef}
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) void importFile(file);
            }}
          />
        </section>

        <section className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Frame,
              title: "Inner frames",
              body: "Expand iframes and framesets so nested comments aren’t clipped.",
            },
            {
              icon: Crop,
              title: "Crop and mark up",
              body: "Crop, draw, type, stamp, drop images, and redact — then right-click to export.",
            },
            {
              icon: Download,
              title: "Copy, file, PDF",
              body: "Copy to clipboard, download PNG/JPEG/WebP, or save a one-page PDF.",
            },
            {
              icon: Camera,
              title: "Your defaults",
              body: "Browser chrome, URL bar, auto-download, Save as, folder, resize limits, and max file size.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-xl border border-border bg-surface p-5">
              <item.icon className="size-5 text-primary" />
              <h3 className="mt-3 font-medium">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{item.body}</p>
            </div>
          ))}
        </section>
      </main>

      <div className="pointer-events-none absolute top-0 left-0 h-0 w-0 overflow-hidden" aria-hidden="true">
        <div ref={stageRef} className="w-[1280px] bg-white text-left">
          {pending ? <SampleDocument slug={pending} /> : null}
        </div>
      </div>
      <CaptureOverlay busy={busy} status={status} />
    </div>
  );
}

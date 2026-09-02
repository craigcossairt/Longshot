import { createFileRoute } from "@tanstack/react-router";
import { Download, FolderOpen, Puzzle, ShieldCheck } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/install")({
  component: InstallPage,
});

function InstallPage() {
  return (
    <div className="min-h-dvh bg-bg text-fg">
      <AppHeader />
      <main className="mx-auto max-w-2xl px-4 py-10 md:px-0 md:py-14">
        <p className="text-xs tracking-[0.2em] text-muted uppercase">Sideload</p>
        <h1 className="font-display mt-3 text-4xl">Brave and Chrome extension</h1>
        <p className="mt-4 leading-7 text-muted">
          Stores flagged GoFullPage as policy-violating, so this build is meant to be loaded as an
          unpacked extension. It captures the real tab, including long pages and inner frames,
          then opens the editor in a new tab.
        </p>

        <div className="mt-8 rounded-xl border border-border bg-surface p-6">
          <h2 className="font-display text-2xl">Install</h2>
          <ol className="mt-4 space-y-4 text-sm leading-6">
            <li className="flex gap-3">
              <Download className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>Download the extension pack (zip). Unzip it somewhere you won’t tidy away.</span>
            </li>
            <li className="flex gap-3">
              <Puzzle className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>
                In Brave or Chrome open <code className="rounded bg-surface-2 px-1.5 py-0.5">brave://extensions</code>{" "}
                or <code className="rounded bg-surface-2 px-1.5 py-0.5">chrome://extensions</code>.
              </span>
            </li>
            <li className="flex gap-3">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>Turn on Developer mode (top right).</span>
            </li>
            <li className="flex gap-3">
              <FolderOpen className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>Load unpacked, and choose the unzipped <strong>longshot-extension</strong> folder.</span>
            </li>
          </ol>
          <Button asChild className="mt-6">
            <a href="/longshot-extension.zip" download>
              <Download />
              Download extension
            </a>
          </Button>
        </div>

        <div className="mt-6 space-y-4 text-sm leading-7 text-muted">
          <p>
            Click the Longshot icon on any page. The stitch opens in a new tab with copy, download,
            PDF, crop, and annotation. Options live under the extension details, and match the
            settings in this studio.
          </p>
          <p>
            This preview cannot inject into other websites. That is what the extension is for. Use
            the sample pages here to try the editor immediately.
          </p>
        </div>
      </main>
    </div>
  );
}

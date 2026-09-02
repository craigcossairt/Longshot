import { Link } from "@tanstack/react-router";
import { List, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export function AppHeader({ className }: { className?: string }) {
  return (
    <header
      className={cn(
        "flex items-center justify-between gap-4 border-b border-border px-4 py-3 md:px-8",
        className,
      )}
    >
      <Link to="/" className="flex items-center gap-2.5 text-fg">
        <img src="/favicon-48.png" alt="" width={32} height={32} className="size-8 rounded-md" />
        <span className="font-display text-xl tracking-tight">Longshot</span>
      </Link>
      <nav className="flex items-center gap-1 text-sm">
        <Link
          to="/editor"
          className="rounded-md px-3 py-2 text-muted transition-colors hover:bg-surface-2 hover:text-fg"
        >
          Editor
        </Link>
        <Link
          to="/install"
          className="rounded-md px-3 py-2 text-muted transition-colors hover:bg-surface-2 hover:text-fg"
        >
          Extension
        </Link>
        <Link
          to="/files"
          className="inline-flex size-11 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-2 hover:text-fg"
          aria-label="Files"
        >
          <List className="size-4" />
        </Link>
        <Link
          to="/settings"
          className="inline-flex size-11 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-2 hover:text-fg"
          aria-label="Settings"
        >
          <Settings className="size-4" />
        </Link>
      </nav>
    </header>
  );
}

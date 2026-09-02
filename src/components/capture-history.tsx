import { History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useCapture } from "@/lib/capture-store";

export function CaptureHistory() {
  const past = useCapture((s) => s.past);
  const currentId = useCapture((s) => s.current?.id);
  const setCapture = useCapture((s) => s.setCapture);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Capture history" title="History">
          <History />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-2">
        {past.length === 0 ? (
          <p className="px-2 py-3 text-sm text-muted">No captures yet.</p>
        ) : (
          <ul className="grid max-h-80 gap-1 overflow-auto">
            {past.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setCapture(item)}
                  className={`flex w-full items-center gap-3 rounded-md p-2 text-left hover:bg-surface-2 ${
                    item.id === currentId ? "bg-surface-2" : ""
                  }`}
                >
                  <img
                    src={item.thumbUrl || item.dataUrl}
                    alt=""
                    className="h-12 w-16 shrink-0 rounded-sm object-cover object-top bg-canvas"
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-sm">{item.title}</span>
                    <span className="block truncate text-xs text-muted tabular-nums">
                      {new Date(item.createdAt).toLocaleString()} · {item.width}×{item.height}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}

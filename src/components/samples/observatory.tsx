const STATS = [
  { label: "Captures today", value: "1,284", delta: "+12%" },
  { label: "Avg. page height", value: "6,420 px", delta: "+3%" },
  { label: "PDF exports", value: "318", delta: "+9%" },
  { label: "Stitch failures", value: "4", delta: "−2" },
];

const ROWS = [
  ["north-ridge", "fieldnotes.example", "4,102 × 8,440", "PNG", "2.1 MB"],
  ["dash-north", "observatory.example", "1,440 × 5,120", "WebP", "640 KB"],
  ["catalog-p2", "atelier.example", "1,280 × 9,600", "JPEG", "1.4 MB"],
  ["thread-418", "frames.example", "1,280 × 7,200", "PNG", "3.0 MB"],
  ["invoice-88", "ledger.example", "1,024 × 4,800", "PDF", "890 KB"],
  ["press-kit", "studio.example", "1,600 × 6,200", "PNG", "2.8 MB"],
];

export function ObservatoryPage() {
  return (
    <div className="min-h-full bg-[#101114] text-[#ecece8]">
      <header className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <div>
          <p className="text-xs tracking-[0.2em] text-white/50 uppercase">Observatory</p>
          <h1 className="font-display text-2xl">North desk</h1>
        </div>
        <p className="text-sm text-white/50">Tuesday 1 Sep · live</p>
      </header>

      <div className="grid gap-4 p-6 md:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="rounded-lg border border-white/10 bg-[#17181c] p-4">
            <p className="text-xs text-white/50">{s.label}</p>
            <p className="mt-2 font-display text-3xl tabular-nums">{s.value}</p>
            <p className="mt-1 text-xs text-[#7dba96]">{s.delta}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 px-6 pb-6 lg:grid-cols-5">
        <section className="rounded-lg border border-white/10 bg-[#17181c] p-5 lg:col-span-3">
          <h2 className="text-sm text-white/70">Capture volume · 14 days</h2>
          <LineChart />
        </section>
        <section className="rounded-lg border border-white/10 bg-[#17181c] p-5 lg:col-span-2">
          <h2 className="text-sm text-white/70">Format mix</h2>
          <div className="mt-4 space-y-3">
            {[
              ["PNG", 52, "#d2d6d0"],
              ["JPEG", 28, "#8c8b86"],
              ["WebP", 14, "#4a7ec4"],
              ["PDF", 6, "#5e9a7a"],
            ].map(([name, pct, color]) => (
              <div key={String(name)}>
                <div className="mb-1 flex justify-between text-xs">
                  <span>{name}</span>
                  <span className="tabular-nums text-white/50">{pct}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: String(color) }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="px-6 pb-6">
        <div className="overflow-hidden rounded-lg border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-xs tracking-wide text-white/50 uppercase">
              <tr>
                {["Job", "Source", "Size", "Format", "Weight"].map((h) => (
                  <th key={h} className="px-4 py-3 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row[0]} className="border-t border-white/10">
                  {row.map((cell) => (
                    <td key={cell} className="px-4 py-3 tabular-nums">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="px-6 pb-16">
        <h2 className="mb-4 text-sm text-white/70">Activity</h2>
        <ol className="space-y-3">
          {[
            "Stitched 18 viewports on fieldnotes.example/essays/ridgeline",
            "Expanded iframe on frames.example/thread/418 (comments, 2,400 px)",
            "Auto-downloaded catalog-p2.jpg to Longshot/",
            "PDF export of invoice-88 at 150 dpi",
            "Crop applied: 1,280 × 9,600 → 1,280 × 7,140",
            "Annotation set: 4 arrows, 1 blur, 2 captions",
            "Retry after lazy-load on press-kit hero",
          ].map((item, i) => (
            <li key={item} className="flex gap-3 rounded-md border border-white/10 bg-[#17181c] px-4 py-3 text-sm">
              <span className="tabular-nums text-white/30">{String(i + 1).padStart(2, "0")}</span>
              {item}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function LineChart() {
  const points = [40, 55, 48, 62, 70, 66, 80, 92, 78, 88, 96, 90, 110, 124];
  const w = 560;
  const h = 180;
  const max = 140;
  const d = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - (p / max) * h;
      return `${i === 0 ? "M" : "L"}${x} ${y}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-4 h-auto w-full" aria-hidden="true">
      <path d={d} fill="none" stroke="#d2d6d0" strokeWidth="2" />
      {points.map((p, i) => (
        <circle
          key={i}
          cx={(i / (points.length - 1)) * w}
          cy={h - (p / max) * h}
          r="3"
          fill="#d2d6d0"
        />
      ))}
    </svg>
  );
}

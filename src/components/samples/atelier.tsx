const PRODUCTS = [
  { name: "Field 35", spec: "35mm · f/2.0 · 240g", price: "$1,280", note: "The walking lens" },
  { name: "Ridge 50", spec: "50mm · f/1.4 · 310g", price: "$1,640", note: "Mid-plane standard" },
  { name: "Haze 85", spec: "85mm · f/1.8 · 380g", price: "$1,490", note: "Compression without drama" },
  { name: "Plate 24", spec: "24mm · f/2.8 · 210g", price: "$980", note: "Near plane, honest" },
  { name: "Scroll Body", spec: "Full-frame · 42MP", price: "$3,200", note: "Tall files, quiet shutter" },
  { name: "Notebook Kit", spec: "Body + 35 + 85", price: "$5,400", note: "The actual assignment bag" },
];

export function AtelierPage() {
  return (
    <div className="bg-[#f3efe6] text-ink">
      <header className="px-6 py-10 md:px-12">
        <p className="text-xs tracking-[0.22em] text-ink-muted uppercase">Atelier</p>
        <h1 className="font-display mt-3 max-w-2xl text-4xl md:text-6xl">Glass for the long page</h1>
        <p className="mt-4 max-w-xl text-ink-muted">
          Lenses chosen for vertical work — assignment kits that keep a ridgeline readable from
          fence to weather to far wall.
        </p>
      </header>

      <div className="grid gap-6 px-6 pb-16 md:grid-cols-2 md:px-12 xl:grid-cols-3">
        {PRODUCTS.map((p, i) => (
          <article key={p.name} className="rounded-xl border border-ink/10 bg-[#faf7f1] p-5">
            <LensMark index={i} />
            <h2 className="font-display mt-4 text-2xl">{p.name}</h2>
            <p className="mt-1 text-sm text-ink-muted">{p.spec}</p>
            <p className="mt-4 text-sm">{p.note}</p>
            <p className="mt-6 font-medium tabular-nums">{p.price}</p>
          </article>
        ))}
      </div>

      <section className="border-t border-ink/10 px-6 py-12 md:px-12">
        <h2 className="font-display text-3xl">Notes from the bench</h2>
        <div className="mt-6 max-w-2xl space-y-4 text-sm leading-7">
          <p>
            We do not sell “landscape lenses.” We sell glass that does not panic when the file is
            8,000 pixels tall. Coatings are tuned for haze, not for brochure contrast. Helicoids
            are damped so you can focus with gloves on a windy berm.
          </p>
          <p>
            Every kit is collared and measured against a 1,280-pixel-wide scroll at 150% zoom. If
            the mid plane turns to mush, it does not ship.
          </p>
          <p>
            Shipping from West Valley City. Repair turnaround is nine days, not because we are
            slow — because we recollimate against a 10-meter rail, not a projector chart.
          </p>
        </div>
      </section>
    </div>
  );
}

function LensMark({ index }: { index: number }) {
  const r = 36 + (index % 3) * 6;
  return (
    <svg viewBox="0 0 240 140" className="h-auto w-full rounded-lg bg-[#e7e1d4]" aria-hidden="true">
      <circle cx="120" cy="70" r={r + 18} fill="none" stroke="#1a1916" strokeWidth="2" />
      <circle cx="120" cy="70" r={r} fill="#1a1916" />
      <circle cx="120" cy="70" r={r - 14} fill="#8aa0a8" />
      <circle cx="120" cy="70" r="8" fill="#1a1916" />
    </svg>
  );
}

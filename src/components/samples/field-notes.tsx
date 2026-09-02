export function FieldNotesPage() {
  return (
    <article className="bg-paper text-ink">
      <header className="border-b border-ink/10 px-6 py-8 md:px-16 md:py-12">
        <div className="mx-auto flex max-w-3xl items-center justify-between text-xs tracking-[0.18em] text-ink-muted uppercase">
          <span>Field Notes</span>
          <span>Vol. 12 · Late Light</span>
        </div>
        <div className="mx-auto mt-10 max-w-3xl">
          <p className="text-sm font-medium tracking-wide text-ink-muted">Essay · 14 min read</p>
          <h1 className="font-display mt-4 text-4xl leading-tight md:text-6xl">
            How to read a ridgeline
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-muted">
            A working method for photographing long country: wait for the fold in the land, not the
            peak. The picture lives in the overlap.
          </p>
          <p className="mt-8 text-sm text-ink-muted">Mara Ellison · 12 August 2026 · Wasatch Range</p>
        </div>
      </header>

      <RidgelineFigure />

      <div className="mx-auto max-w-3xl space-y-6 px-6 py-12 text-base leading-7 md:px-0">
        <p>
          Most people photograph mountains as objects. They stand at the overlook, zoom until the
          summit fills the frame, and leave with a postcard. The ridgeline is treated as a logo.
          That is a missed picture.
        </p>
        <p>
          A ridgeline is a sentence. It has clauses — the near slope, the mid fold, the far wall
          that goes blue. If you crop to the peak you cut the grammar. Full-page seeing, the kind
          you do with your feet as much as the lens, is about keeping those clauses in order.
        </p>
        <blockquote className="border-l-2 border-ink/20 pl-5 font-display text-2xl leading-snug text-ink">
          “The long picture is not more landscape. It is the same landscape, allowed to finish.”
        </blockquote>
        <p>
          I started doing this on assignment in the Oquirrhs, walking a service road that never
          quite crested. Every 200 meters the ridge rewrote itself. A notch became a shoulder.
          A shoulder became a second skyline. The photograph that survived the edit was 3,200
          pixels tall and almost nothing happened in it — except the land changing its mind.
        </p>
        <h2 className="font-display pt-4 text-3xl">Three planes, one exposure</h2>
        <p>
          Work in planes, not subjects. Near: grass, fence, the thing you could touch. Mid: the
          first true rise, usually where weather sits. Far: the wall that will print as a single
          tone if you are careless with haze.
        </p>
        <p>
          Expose for the mid. The near can go dark; it still reads as weight. The far can go pale;
          it still reads as air. If you expose for the snow on the summit you will lose the
          sentence in the middle, which is the only part that is actually the photograph.
        </p>
        <ContourFigure />
        <h2 className="font-display pt-4 text-3xl">Why the scroll matters</h2>
        <p>
          Screens taught us to crop at the fold. A phone will show you a square of ridge and call
          it done. Printing a full page — or capturing one — puts the reader back in the walk.
          You do not glance a ridgeline. You travel it.
        </p>
        <p>
          When I send a contact sheet now I send the whole scroll. Editors complain, then they
          read it. The picture that gets published is rarely the hero frame. It is the one where
          the fence line, the weather, and the far wall finally agree.
        </p>
        <ol className="list-decimal space-y-3 pl-5">
          <li>Arrive two hours before the light you want. Ridges heat from the back.</li>
          <li>Do not change focal length between frames if you plan to stitch a vertical.</li>
          <li>Leave the sky a thin lid. It is a margin, not a subject.</li>
          <li>Caption the weather, not the peak name. Weather is what the print will show.</li>
        </ol>
        <p>
          The last useful picture I made this year was from a rest-stop. Semi trucks, a vending
          machine, and behind them a line of hills doing something quiet and complete. I did not
          crop the trucks out. They are the near plane. The ridge is the rest of the sentence.
        </p>
      </div>

      <footer className="border-t border-ink/10 px-6 py-12 md:px-16">
        <div className="mx-auto grid max-w-3xl gap-8 md:grid-cols-3">
          {[
            ["Further reading", "Haze as a drawing tool"],
            ["Field kit", "One body, two primes, a notebook"],
            ["Next essay", "Night work without a tripod myth"],
          ].map(([k, v]) => (
            <div key={k}>
              <p className="text-xs tracking-[0.16em] text-ink-muted uppercase">{k}</p>
              <p className="mt-2 font-display text-xl">{v}</p>
            </div>
          ))}
        </div>
      </footer>
    </article>
  );
}

function RidgelineFigure() {
  return (
    <figure className="bg-[#cfc6b4]">
      <svg viewBox="0 0 1200 420" className="h-auto w-full" aria-hidden="true">
        <rect width="1200" height="420" fill="#cfc6b4" />
        <rect width="1200" height="180" fill="#b9c4c2" />
        <path d="M0 260 L140 210 L260 240 L420 160 L580 220 L760 120 L940 190 L1200 90 L1200 420 L0 420 Z" fill="#8d7f68" />
        <path d="M0 300 L180 250 L340 280 L520 210 L700 260 L900 180 L1200 220 L1200 420 L0 420 Z" fill="#6f6352" />
        <path d="M0 350 L220 320 L480 340 L720 300 L1200 330 L1200 420 L0 420 Z" fill="#4f463c" />
        <circle cx="920" cy="88" r="18" fill="#f1efe6" />
      </svg>
      <figcaption className="px-6 py-3 text-center text-xs tracking-wide text-ink-muted uppercase">
        Figure 1 · West slope, two hours before sundown
      </figcaption>
    </figure>
  );
}

function ContourFigure() {
  return (
    <figure className="border border-ink/10 bg-[#efeae0] p-4">
      <svg viewBox="0 0 640 280" className="h-auto w-full" aria-hidden="true">
        {[40, 70, 100, 130, 160, 190, 220].map((r) => (
          <ellipse
            key={r}
            cx="320"
            cy="150"
            rx={r * 1.4}
            ry={r * 0.55}
            fill="none"
            stroke="#1a1916"
            strokeOpacity="0.45"
            strokeWidth="1"
          />
        ))}
        <circle cx="338" cy="132" r="3" fill="#1a1916" />
      </svg>
      <figcaption className="mt-2 text-center text-xs text-ink-muted">
        Contour of the mid plane — expose here, let the rest fall
      </figcaption>
    </figure>
  );
}

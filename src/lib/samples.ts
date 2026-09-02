export type SamplePage = {
  slug: string;
  title: string;
  kicker: string;
  description: string;
  url: string;
  heightLabel: string;
  hasFrames: boolean;
};

export const SAMPLES: SamplePage[] = [
  {
    slug: "field-notes",
    title: "Field Notes",
    kicker: "Essay",
    description: "A long illustrated article — the classic full-page capture.",
    url: "https://fieldnotes.example/essays/ridgeline",
    heightLabel: "~4 screens",
    hasFrames: false,
  },
  {
    slug: "observatory",
    title: "Observatory",
    kicker: "Dashboard",
    description: "Dense analytics layout with charts, tables, and a long activity feed.",
    url: "https://observatory.example/dash/north",
    heightLabel: "~3 screens",
    hasFrames: false,
  },
  {
    slug: "atelier",
    title: "Atelier",
    kicker: "Catalog",
    description: "A product grid that runs well past the fold.",
    url: "https://atelier.example/catalog",
    heightLabel: "~5 screens",
    hasFrames: false,
  },
  {
    slug: "thread",
    title: "The Thread",
    kicker: "Frames",
    description: "Article with a nested comments iframe — tests inner-frame scrolling.",
    url: "https://frames.example/thread/418",
    heightLabel: "Page + iframe",
    hasFrames: true,
  },
];

export function getSample(slug: string) {
  return SAMPLES.find((s) => s.slug === slug);
}

import { AtelierPage } from "@/components/samples/atelier";
import { FieldNotesPage } from "@/components/samples/field-notes";
import { ObservatoryPage } from "@/components/samples/observatory";
import { ThreadPage } from "@/components/samples/thread";

export function SampleDocument({ slug }: { slug: string }) {
  if (slug === "observatory") return <ObservatoryPage />;
  if (slug === "atelier") return <AtelierPage />;
  if (slug === "thread") return <ThreadPage />;
  return <FieldNotesPage />;
}

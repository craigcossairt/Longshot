import { createFileRoute } from "@tanstack/react-router";
import { EditorView } from "@/components/editor/editor-view";

export const Route = createFileRoute("/editor")({
  component: EditorPage,
});

function EditorPage() {
  return <EditorView />;
}

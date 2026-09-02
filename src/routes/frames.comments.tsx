import { createFileRoute } from "@tanstack/react-router";
import { CommentsFrame } from "@/components/samples/thread";

export const Route = createFileRoute("/frames/comments")({
  component: CommentsRoute,
});

function CommentsRoute() {
  return <CommentsFrame />;
}

import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export const GITHUB_REPO_URL = "https://github.com/craigcossairt/Longshot";

export function GithubStarButton() {
  return (
    <Button variant="ghost" size="icon-sm" asChild aria-label="Star on GitHub" title="Star on GitHub">
      <a href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer">
        <Star />
      </a>
    </Button>
  );
}

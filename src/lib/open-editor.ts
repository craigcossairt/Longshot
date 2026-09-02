import type { NavigateFn } from "@tanstack/react-router";

export function openEditor(navigate: NavigateFn) {
  void navigate({ to: "/editor" });
}

import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { SettingsForm } from "@/components/settings-form";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="min-h-dvh bg-bg text-fg">
      <AppHeader />
      <main className="mx-auto max-w-2xl px-4 py-10 md:px-0 md:py-14">
        <p className="text-xs tracking-[0.2em] text-muted uppercase">Preferences</p>
        <h1 className="font-display mt-3 text-4xl">Settings</h1>
        <p className="mt-3 mb-8 max-w-xl text-muted">
          These apply to captures in this studio and match the options in the Brave/Chrome
          extension.
        </p>
        <SettingsForm />
      </main>
    </div>
  );
}

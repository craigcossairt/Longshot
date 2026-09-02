import { useSettings } from "@/lib/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ImageFormat } from "@/lib/types";

const FILE_SIZE_OPTIONS = [
  { value: "0", label: "No limit" },
  { value: "0.5", label: "500 KB" },
  { value: "1", label: "1 MB" },
  { value: "2", label: "2 MB" },
  { value: "5", label: "5 MB" },
  { value: "10", label: "10 MB" },
  { value: "20", label: "20 MB" },
];

export function SettingsForm() {
  const settings = useSettings();
  const fileSizeValue = FILE_SIZE_OPTIONS.some((o) => Number(o.value) === settings.maxFileMB)
    ? String(settings.maxFileMB)
    : "0";

  return (
    <div className="space-y-8">
      <Section title="File" note="Format, quality, and where the file lands.">
        <Field label="Image format">
          <Select
            value={settings.format}
            onValueChange={(value) => settings.update({ format: value as ImageFormat })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="png">PNG — sharp, larger</SelectItem>
              <SelectItem value="jpeg">JPEG — photos, smaller</SelectItem>
              <SelectItem value="webp">WebP — sharp and light</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        {settings.format !== "png" && (
          <Field label={`Quality · ${Math.round(settings.quality * 100)}%`}>
            <Slider
              min={0.5}
              max={1}
              step={0.02}
              value={[settings.quality]}
              onValueChange={([quality]) => settings.update({ quality })}
            />
          </Field>
        )}

        <Field label="Filename template">
          <Input
            value={settings.filenameTemplate}
            onChange={(e) => settings.update({ filenameTemplate: e.target.value })}
          />
          <p className="mt-1.5 text-xs text-muted">
            Tokens: {"{title}"} {"{date}"} {"{datetime}"} {"{url}"} {"{width}"} {"{height}"}
          </p>
        </Field>

        <Field label="Download folder">
          <Input
            value={settings.downloadDirectory}
            onChange={(e) => settings.update({ downloadDirectory: e.target.value })}
            placeholder="Longshot"
          />
          <p className="mt-1.5 text-xs text-muted">
            Used as a subfolder of Downloads in the browser extension. In this studio, Save as
            lets you pick any folder.
          </p>
        </Field>
      </Section>

      <Section title="Capture" note="What gets included in the stitch.">
        <Toggle
          label="Scroll inner frames"
          description="Expand iframes and framesets so nested comments, widgets, and old framesets are fully captured."
          checked={settings.captureIframes}
          onCheckedChange={(captureIframes) => settings.update({ captureIframes })}
        />
        <Toggle
          label="Include browser bar"
          description="Paint tabs, traffic lights, and a toolbar above the page."
          checked={settings.includeBrowserBar}
          onCheckedChange={(includeBrowserBar) => settings.update({ includeBrowserBar })}
        />
        <Toggle
          label="Include URL"
          description="Show the page address in the chrome, or as a slim strip if the browser bar is off."
          checked={settings.includeUrlBar}
          onCheckedChange={(includeUrlBar) => settings.update({ includeUrlBar })}
        />
      </Section>

      <Section title="Saving" note="What happens after a capture.">
        <Toggle
          label="Open in a new tab"
          description="The browser extension always opens the stitch in a new tab. In this studio the editor opens in place so the preview can keep the file."
          checked
          disabled
          onCheckedChange={() => {}}
        />
        <Toggle
          label="Auto-download"
          description="Save the file as soon as the stitch finishes."
          checked={settings.autoDownload}
          onCheckedChange={(autoDownload) => settings.update({ autoDownload })}
        />
        <Toggle
          label="Show a Save as dialog"
          description="Ask where to put the file. If the browser blocks it, a normal download is used."
          checked={settings.saveAsDialog}
          onCheckedChange={(saveAsDialog) => settings.update({ saveAsDialog })}
        />
      </Section>

      <Section title="Resize limits" note="Scale the capture to fit a maximum box and file size.">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Max width (px)">
            <Input
              type="number"
              min={320}
              max={32768}
              value={settings.maxWidth}
              onChange={(e) => settings.update({ maxWidth: Number(e.target.value) || 0 })}
            />
          </Field>
          <Field label="Max height (px)">
            <Input
              type="number"
              min={320}
              max={65536}
              value={settings.maxHeight}
              onChange={(e) => settings.update({ maxHeight: Number(e.target.value) || 0 })}
            />
          </Field>
          <Field label={`Scale ${settings.scalePercent}%`}>
            <Slider
              min={25}
              max={200}
              step={5}
              value={[settings.scalePercent]}
              onValueChange={([scalePercent]) => settings.update({ scalePercent })}
            />
          </Field>
        </div>
        <Field label="Max file size">
          <Select
            value={fileSizeValue}
            onValueChange={(value) => settings.update({ maxFileMB: Number(value) })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FILE_SIZE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="mt-1.5 text-xs text-muted">
            If the capture would exceed this size, it is scaled down (and JPEG/WebP quality is
            lowered) until it fits.
          </p>
        </Field>
        <p className="text-xs text-muted">
          The image is scaled uniformly so it stays inside both pixel limits. 100% keeps native
          pixels unless the file would exceed the box or the max file size.
        </p>
      </Section>

      <Button variant="secondary" onClick={() => settings.reset()}>
        Reset to defaults
      </Button>
    </div>
  );
}

function Section({ title, note, children }: { title: string; note: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-surface p-5 md:p-6">
      <h2 className="font-display text-2xl">{title}</h2>
      <p className="mt-1 mb-5 text-sm text-muted">{note}</p>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-2 block">{label}</Label>
      {children}
    </div>
  );
}

function Toggle({
  label,
  description,
  checked,
  onCheckedChange,
  disabled,
}: {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="mt-1 text-sm text-muted">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
    </div>
  );
}

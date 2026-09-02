import { useEffect, useState } from "react";
import { useSettings } from "@/lib/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  clearDownloadDirHandle,
  getDownloadDirHandle,
  pickDownloadDirectory,
} from "@/lib/download-folder";
import type { ImageFormat } from "@/lib/types";
import {
  FORMAT_OPTIONS,
  maxFileHint,
  maxHeightHint,
  maxWidthHint,
  qualityHint,
  scaleHint,
  usesQuality,
} from "@/lib/formats";
import { cn } from "@/lib/utils";

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
  const [folderLabel, setFolderLabel] = useState("");
  const fileSizeValue = FILE_SIZE_OPTIONS.some((o) => Number(o.value) === settings.maxFileMB)
    ? String(settings.maxFileMB)
    : "0";

  useEffect(() => {
    void getDownloadDirHandle().then((handle) => setFolderLabel(handle?.name ?? ""));
  }, []);

  async function browseFolder() {
    try {
      const name = await pickDownloadDirectory();
      setFolderLabel(name);
      settings.update({ downloadDirectory: name });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
    }
  }

  async function resetAll() {
    await clearDownloadDirHandle();
    setFolderLabel("");
    settings.reset();
  }

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
              {FORMAT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        {usesQuality(settings.format) && (
          <Field label={`Quality · ${Math.round(settings.quality * 100)}%`}>
            <Slider
              min={50}
              max={100}
              step={1}
              value={[Math.round(settings.quality * 100)]}
              onValueChange={([pct]) => settings.update({ quality: (pct ?? 92) / 100 })}
            />
            <Hint warn={qualityHint(Math.round(settings.quality * 100)).warn}>
              {qualityHint(Math.round(settings.quality * 100)).text}
            </Hint>
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
          <div className="flex gap-2">
            <Input
              value={folderLabel || settings.downloadDirectory}
              onChange={(e) => {
                if (folderLabel) {
                  void clearDownloadDirHandle();
                  setFolderLabel("");
                }
                settings.update({ downloadDirectory: e.target.value || "Longshot" });
              }}
              placeholder="Longshot"
            />
            <Button type="button" variant="secondary" onClick={() => void browseFolder()}>
              Browse
            </Button>
          </div>
          <p className="mt-1.5 text-xs text-muted">
            {folderLabel
              ? `Saving to “${folderLabel}” on this PC. Edit the name to use a Downloads folder instead.`
              : "Default is Downloads/Longshot. Browse to pick Pictures, Documents, or any folder on this PC."}
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
            <Hint warn={maxWidthHint(settings.maxWidth).warn}>{maxWidthHint(settings.maxWidth).text}</Hint>
          </Field>
          <Field label="Max height (px)">
            <Input
              type="number"
              min={320}
              max={65536}
              value={settings.maxHeight}
              onChange={(e) => settings.update({ maxHeight: Number(e.target.value) || 0 })}
            />
            <Hint warn={maxHeightHint(settings.maxHeight).warn}>{maxHeightHint(settings.maxHeight).text}</Hint>
          </Field>
          <Field label={`Scale ${settings.scalePercent}%`}>
            <Slider
              min={25}
              max={200}
              step={5}
              value={[settings.scalePercent]}
              onValueChange={([scalePercent]) => settings.update({ scalePercent })}
            />
            <Hint warn={scaleHint(settings.scalePercent).warn}>{scaleHint(settings.scalePercent).text}</Hint>
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
          <Hint warn={maxFileHint(settings.maxFileMB).warn}>{maxFileHint(settings.maxFileMB).text}</Hint>
        </Field>
      </Section>

      <Button variant="secondary" onClick={() => void resetAll()}>
        Reset to defaults
      </Button>
    </div>
  );
}

function Section({ title, note, children }: { title: string; note: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{note}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
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

function Hint({ warn, children }: { warn?: boolean; children: React.ReactNode }) {
  return <p className={cn("mt-1.5 text-xs", warn ? "text-danger" : "text-muted")}>{children}</p>;
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

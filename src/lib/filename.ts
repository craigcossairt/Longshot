import { slugify } from "@/lib/utils";
import type { AppSettings, CaptureRecord, ImageFormat } from "@/lib/types";

export function extensionFor(format: ImageFormat) {
  return format === "jpeg" ? "jpg" : format;
}

export function buildFilename(capture: Pick<CaptureRecord, "title" | "url" | "width" | "height" | "format" | "createdAt">, settings: AppSettings) {
  const date = new Date(capture.createdAt);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");
  const tokens: Record<string, string> = {
    "{title}": slugify(capture.title) || "capture",
    "{url}": slugify(capture.url.replace(/^https?:\/\//, "")) || "page",
    "{date}": `${yyyy}-${mm}-${dd}`,
    "{datetime}": `${yyyy}-${mm}-${dd}-${hh}${mi}`,
    "{width}": String(capture.width),
    "{height}": String(capture.height),
  };
  let name = settings.filenameTemplate || "{title}-{date}";
  for (const [token, value] of Object.entries(tokens)) {
    name = name.split(token).join(value);
  }
  name = slugify(name) || "capture";
  const folder = settings.downloadDirectory.replace(/^\/+|\/+$/g, "").replace(/\.\./g, "");
  const file = `${name}.${extensionFor(capture.format)}`;
  return folder ? `${folder}/${file}` : file;
}

export function leafName(path: string) {
  return path.split("/").pop() ?? path;
}

export function slugify(value) {
  return (value || "capture")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

export function filename(record, settings) {
  const d = new Date(record.createdAt);
  const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  let name = settings.filenameTemplate || "{title}-{date}";
  name = name
    .replaceAll("{title}", slugify(record.title))
    .replaceAll("{date}", date)
    .replaceAll("{datetime}", `${date}-${String(d.getHours()).padStart(2, "0")}${String(d.getMinutes()).padStart(2, "0")}`)
    .replaceAll("{url}", slugify(String(record.url || "").replace(/^https?:\/\//, "")))
    .replaceAll("{width}", String(record.width))
    .replaceAll("{height}", String(record.height));
  name = slugify(name);
  const ext = record.format === "jpeg" ? "jpg" : record.format || "png";
  const folder = String(settings.downloadDirectory || "Longshot")
    .replace(/\\/g, "/")
    .replace(/^[a-zA-Z]:/, "")
    .replace(/^\/+|\/+$/g, "")
    .replace(/\.\./g, "")
    .replace(/\/+/g, "/");
  return folder ? `${folder}/${name}.${ext}` : `${name}.${ext}`;
}

export function uniquePath(path, existsFn) {
  if (!existsFn(path)) return path;
  const slash = Math.max(path.lastIndexOf("/"), path.lastIndexOf("\\"));
  const dot = path.lastIndexOf(".");
  const ext = dot > slash ? path.slice(dot) : "";
  const base = dot > slash ? path.slice(0, dot) : path;
  let n = 1;
  let next = `${base} (${n})${ext}`;
  while (existsFn(next)) {
    n += 1;
    next = `${base} (${n})${ext}`;
  }
  return next;
}

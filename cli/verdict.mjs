import { existsSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";

export const REGION_GRID = 8;
export const REGION_TOLERANCE = 0.05;

export function sha256(buf) {
  return createHash("sha256").update(buf).digest("hex");
}

export function verdictPath(imagePath) {
  const dot = imagePath.lastIndexOf(".");
  const slash = Math.max(imagePath.lastIndexOf("/"), imagePath.lastIndexOf("\\"));
  if (dot > slash) return `${imagePath.slice(0, dot)}.verdict.json`;
  return `${imagePath}.verdict.json`;
}

export function buildVerdict({
  path,
  width,
  height,
  format,
  bytes,
  engine,
  tiles,
  url,
  sha256: hash,
  regions,
}) {
  return {
    path,
    width,
    height,
    format,
    bytes,
    engine,
    tiles,
    url,
    sha256: hash,
    grid: REGION_GRID,
    regions: regions || [],
  };
}

export function compareVerdict(current, baseline) {
  const reasons = [];
  for (const key of ["width", "height", "format", "engine"]) {
    if (current[key] !== baseline[key]) {
      reasons.push(`${key} changed (${baseline[key]} -> ${current[key]})`);
    }
  }
  if (current.tiles !== baseline.tiles) {
    reasons.push(`tiles changed (${baseline.tiles} -> ${current.tiles})`);
  }
  if (current.url && baseline.url && current.url !== baseline.url) {
    reasons.push(`url changed ("${baseline.url}" -> "${current.url}")`);
  }
  const a = current.regions || [];
  const b = baseline.regions || [];
  if (a.length && b.length && a.length === b.length) {
    const changed = [];
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) changed.push(i);
    }
    const ratio = changed.length / a.length;
    if (ratio > REGION_TOLERANCE) {
      const cols = Math.round(Math.sqrt(a.length)) || REGION_GRID;
      const where = changed
        .slice(0, 8)
        .map((i) => `r${Math.floor(i / cols)}c${i % cols}`)
        .join(", ");
      reasons.push(`${changed.length}/${a.length} regions changed (${where})`);
    }
  } else if (a.length !== b.length) {
    reasons.push(`region grid changed (${b.length} -> ${a.length})`);
  }
  return { divergesFromBaseline: reasons.length > 0, reasons };
}

export function compareToBaseline(current, rawText) {
  let baseline;
  try {
    baseline = JSON.parse(rawText);
  } catch {
    return { divergesFromBaseline: true, reasons: ["baseline unreadable: invalid JSON"] };
  }
  if (baseline === null || typeof baseline !== "object" || Array.isArray(baseline)) {
    return { divergesFromBaseline: true, reasons: ["baseline unreadable: not a verdict object"] };
  }
  if (!("width" in baseline) && !("regions" in baseline) && !("sha256" in baseline)) {
    return { divergesFromBaseline: true, reasons: ["baseline unreadable: not a verdict object"] };
  }
  return compareVerdict(current, baseline);
}

export function compareToBaselineFile(current, path) {
  if (!existsSync(path)) {
    return { divergesFromBaseline: true, reasons: [`baseline missing: ${path}`] };
  }
  let raw;
  try {
    raw = readFileSync(path, "utf8");
  } catch (error) {
    return { divergesFromBaseline: true, reasons: [`baseline unreadable: ${error.message}`] };
  }
  return compareToBaseline(current, raw);
}

export function regionHashesFromRgba(rgba, width, height, grid = REGION_GRID) {
  const hashes = [];
  const cellW = Math.max(1, Math.floor(width / grid));
  const cellH = Math.max(1, Math.floor(height / grid));
  for (let gy = 0; gy < grid; gy++) {
    for (let gx = 0; gx < grid; gx++) {
      const x0 = gx * cellW;
      const y0 = gy * cellH;
      const x1 = gx === grid - 1 ? width : x0 + cellW;
      const y1 = gy === grid - 1 ? height : y0 + cellH;
      const hash = createHash("sha256");
      for (let y = y0; y < y1; y++) {
        const start = (y * width + x0) * 4;
        const end = (y * width + x1) * 4;
        hash.update(rgba.subarray(start, end));
      }
      hashes.push(hash.digest("hex").slice(0, 16));
    }
  }
  return hashes;
}

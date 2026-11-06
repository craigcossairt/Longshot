import { existsSync, readFileSync, realpathSync } from "node:fs";
import { resolve } from "node:path";
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

export function parseBaseline(rawText) {
  let baseline;
  try {
    baseline = JSON.parse(rawText);
  } catch {
    return { error: "baseline unreadable: invalid JSON" };
  }
  if (!baseline || typeof baseline !== "object" || Array.isArray(baseline) ||
      !Number.isInteger(baseline.width) || baseline.width <= 0 ||
      !Number.isInteger(baseline.height) || baseline.height <= 0 ||
      !Number.isInteger(baseline.tiles) || baseline.tiles <= 0 ||
      typeof baseline.format !== "string" || typeof baseline.engine !== "string" ||
      baseline.grid !== REGION_GRID || !Array.isArray(baseline.regions) ||
      baseline.regions.length !== REGION_GRID * REGION_GRID ||
      baseline.regions.some((region) => typeof region !== "string" || !region)) {
    return { error: "baseline unreadable: not a complete verdict object" };
  }
  return { baseline };
}

export function readBaselineFile(path) {
  if (!existsSync(path)) return { error: `baseline missing: ${path}` };
  try {
    return parseBaseline(readFileSync(path, "utf8"));
  } catch (error) {
    return { error: `baseline unreadable: ${error.message}` };
  }
}

export function compareToBaseline(current, rawText) {
  const parsed = parseBaseline(rawText);
  return parsed.error
    ? { divergesFromBaseline: true, reasons: [parsed.error] }
    : compareVerdict(current, parsed.baseline);
}

export function compareToBaselineFile(current, path) {
  const parsed = readBaselineFile(path);
  return parsed.error
    ? { divergesFromBaseline: true, reasons: [parsed.error] }
    : compareVerdict(current, parsed.baseline);
}

export function assertBaselineSafeOutput(imagePath, baselinePath) {
  if (!baselinePath) return;
  const canonical = (path) => {
    const resolved = existsSync(path) ? realpathSync(path) : resolve(path);
    return process.platform === "win32" ? resolved.toLowerCase() : resolved;
  };
  const baseline = canonical(baselinePath);
  if ([imagePath, verdictPath(imagePath)].some((path) => canonical(path) === baseline)) {
    const error = new Error("Output would overwrite --baseline; choose a different --out path");
    error.code = 2;
    throw error;
  }
}

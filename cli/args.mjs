export const EXIT = {
  OK: 0,
  CAPTURE: 1,
  ARGS: 2,
  TARGET: 3,
  BROWSER: 4,
  DIFF: 5,
};

const DEVICES = {
  mobile: { width: 390, height: 844, scale: 2 },
  tablet: { width: 768, height: 1024, scale: 2 },
  desktop: { width: 1280, height: 800, scale: 1 },
};

const FORMATS = new Set(["png", "jpeg", "webp", "avif", "pdf"]);
const ENGINES = new Set(["tiled", "native"]);
const CHANNELS = new Set(["chrome", "msedge", "chromium"]);

function fail(error) {
  return { ok: false, error, code: EXIT.ARGS };
}

export function parseArgs(argv) {
  const raw = [...argv];
  const options = {
    url: null,
    fullPage: false,
    selector: null,
    region: null,
    engine: "tiled",
    device: "desktop",
    width: null,
    height: null,
    scale: null,
    wait: null,
    format: "png",
    maxBytes: 0,
    out: null,
    cdp: null,
    channel: "chrome",
    headed: false,
    overflow: true,
    baseline: null,
    help: false,
  };

  while (raw.length) {
    const arg = raw.shift();
    if (arg === "--help" || arg === "-h") {
      options.help = true;
      continue;
    }
    if (arg === "--full-page") {
      options.fullPage = true;
      continue;
    }
    if (arg === "--headed") {
      options.headed = true;
      continue;
    }
    if (arg === "--overflow") {
      options.overflow = true;
      continue;
    }
    if (arg === "--no-overflow") {
      options.overflow = false;
      continue;
    }
    if (!arg.startsWith("--")) return fail(`Unexpected argument: ${arg}`);
    const key = arg.slice(2);
    const value = raw.shift();
    if (value === undefined || value.startsWith("--")) return fail(`Missing value for --${key}`);
    switch (key) {
      case "url":
        options.url = value;
        break;
      case "selector":
        options.selector = value;
        break;
      case "region": {
        const parts = value.split(",").map(Number);
        if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n))) {
          return fail("--region must be x,y,w,h");
        }
        const [x, y, w, h] = parts;
        if (w <= 0 || h <= 0) return fail("--region width and height must be positive");
        options.region = { x, y, w, h };
        break;
      }
      case "engine":
        if (!ENGINES.has(value)) return fail("--engine must be tiled or native");
        options.engine = value;
        break;
      case "device":
        if (!DEVICES[value]) return fail("--device must be mobile, tablet, or desktop");
        options.device = value;
        break;
      case "width":
      case "height":
      case "scale":
      case "max-bytes": {
        const n = Number(value);
        if (!Number.isFinite(n) || n <= 0) return fail(`--${key} must be a positive number`);
        if (key === "max-bytes") options.maxBytes = n;
        else options[key] = n;
        break;
      }
      case "wait":
        options.wait = value;
        break;
      case "format":
        if (!FORMATS.has(value)) return fail("--format must be png, jpeg, webp, avif, or pdf");
        options.format = value;
        break;
      case "out":
        options.out = value;
        break;
      case "cdp":
        options.cdp = value;
        break;
      case "baseline":
        options.baseline = value;
        break;
      case "channel":
        if (!CHANNELS.has(value)) return fail("--channel must be chrome, msedge, or chromium");
        options.channel = value;
        break;
      default:
        return fail(`Unknown option --${key}`);
    }
  }

  if (options.help) return { ok: true, options };

  if (!options.url) return fail("--url is required");

  const modes = [options.fullPage, Boolean(options.selector), Boolean(options.region)].filter(Boolean);
  if (modes.length > 1) return fail("Use only one of --full-page, --selector, or --region");

  const device = DEVICES[options.device];
  options.viewport = {
    width: options.width || device.width,
    height: options.height || device.height,
    scale: options.scale || device.scale,
  };

  return { ok: true, options };
}

export function helpText() {
  return `Longshot CLI — full-page screenshots with sticky-header suppression.

Usage:
  node cli/longshot.mjs --url <url> [options]

Options:
  --url <url>                 Required.
  --full-page                 Scroll-and-stitch the whole page (default: current viewport).
  --selector <css>            Capture one element's bounding box.
  --region x,y,w,h            Capture a CSS-pixel rectangle of the viewport.
  --engine tiled|native       tiled (default) matches the extension and hides stickies after tile 1.
                              native uses Playwright fullPage: faster, repeats sticky chrome.
  --device mobile|tablet|desktop
  --width <n> --height <n> --scale <n>
  --wait <ms|selector>        Delay or wait for a selector before capturing.
  --format png|jpeg|webp|avif|pdf
  --max-bytes <n>             Re-encode / downscale to a byte budget.
  --out <path>                Output file. Defaults to a slug in the current directory.
  --cdp <wsUrl>               Attach to an already-running Chrome (logged-in pages).
  --baseline <path.json>      Compare this capture to a prior verdict. Exit 5 on change.
  --channel chrome|msedge|chromium   Default chrome (installed browser, not a download).
  --headed                    Show the browser.
  --overflow / --no-overflow  Scroll a main overflow pane when the page itself does not
                              (default on, same as the extension setting).

Exit codes: 0 ok, 1 capture failed, 2 bad arguments, 3 selector not found, 4 browser launch failed, 5 differs from baseline.

JSON goes to stdout. Progress goes to stderr.
`;
}

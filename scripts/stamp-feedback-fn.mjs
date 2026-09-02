import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const output = join(root, ".vercel", "output");
const serverFunc = join(output, "functions", "__server.func");
const funcDir = join(output, "functions", "api", "feedback.func");
const configPath = join(output, "config.json");
const tslibSrc = join(root, "node_modules", "tslib");

if (!existsSync(output)) {
  console.log("stamp-feedback-fn: no .vercel/output, skip");
  process.exit(0);
}

if (existsSync(tslibSrc) && existsSync(serverFunc)) {
  for (const destRoot of [serverFunc, join(serverFunc, "_libs")]) {
    mkdirSync(join(destRoot, "node_modules"), { recursive: true });
    cpSync(tslibSrc, join(destRoot, "node_modules", "tslib"), { recursive: true });
  }
  console.log("stamp-feedback-fn: copied tslib into __server.func");
}

const handler = `module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.end("Method Not Allowed");
    return;
  }
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const text = String(body.message || "").trim().slice(0, 4000);
    if (!text) {
      res.statusCode = 400;
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({ ok: false, error: "Message is required" }));
      return;
    }
    const key = process.env.RESEND_API_KEY;
    let delivered = false;
    if (key) {
      const send = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + key,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM || "Longshot <onboarding@resend.dev>",
          to: [process.env.FEEDBACK_INBOX || "craigcossairt@gmail.com"],
          subject: "Longshot Feedback",
          text: "Source: " + (body.source || "extension") + "\\n\\n" + text,
        }),
      });
      delivered = send.ok;
      if (!send.ok) {
        console.error("Resend failed", send.status, await send.text());
      }
    }
    res.statusCode = 200;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ ok: true, delivered }));
  } catch (err) {
    res.statusCode = 500;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ ok: false, error: err instanceof Error ? err.message : "Failed" }));
  }
};
`;

mkdirSync(funcDir, { recursive: true });
writeFileSync(join(funcDir, "index.js"), handler);
writeFileSync(
  join(funcDir, ".vc-config.json"),
  JSON.stringify({
    runtime: "nodejs22.x",
    handler: "index.js",
    launcherType: "Nodejs",
    shouldAddHelpers: true,
  }),
);

if (existsSync(configPath)) {
  const config = JSON.parse(readFileSync(configPath, "utf8"));
  const routes = Array.isArray(config.routes) ? config.routes : [];
  const dest = "/api/feedback";
  const route = { src: "^/api/feedback$", dest };
  config.routes = [route, ...routes.filter((item) => item.dest !== dest && item.src !== route.src)];
  writeFileSync(configPath, JSON.stringify(config));
  console.log("stamp-feedback-fn: patched config.json");
} else {
  console.log("stamp-feedback-fn: wrote standalone function; left routing to Nitro");
}

import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const funcDir = join(root, ".vercel", "output", "functions", "api", "feedback.func");
const configPath = join(root, ".vercel", "output", "config.json");

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

if (!existsSync(join(root, ".vercel", "output"))) {
  console.log("stamp-feedback-fn: no .vercel/output, skip");
  process.exit(0);
}

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
  const nextRoutes = routes.filter((route) => route.dest !== dest && route.src !== "^/api/feedback$");
  nextRoutes.unshift({ src: "^/api/feedback$", dest });
  config.routes = nextRoutes;
  writeFileSync(configPath, JSON.stringify(config));
  console.log("stamp-feedback-fn: routed /api/feedback to standalone function");
} else {
  console.log("stamp-feedback-fn: wrote function, no config.json to patch");
}

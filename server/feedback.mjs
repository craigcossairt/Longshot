import { appendFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/** @typedef {{ at: string, source: string, message: string }} FeedbackEntry */

function inboxAddress() {
  return process.env.FEEDBACK_INBOX || "craigcossairt@gmail.com";
}

/** @param {FeedbackEntry} entry */
function storeLocally(entry) {
  try {
    const root = join(dirname(fileURLToPath(import.meta.url)), "..");
    mkdirSync(join(root, "data"), { recursive: true });
    appendFileSync(join(root, "data", "feedback-inbox.jsonl"), `${JSON.stringify(entry)}\n`);
    return true;
  } catch {
    return false;
  }
}

/** @param {FeedbackEntry} entry */
async function emailResend(entry) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  const from = process.env.RESEND_FROM || "Longshot <onboarding@resend.dev>";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [inboxAddress()],
      subject: "Longshot Feedback",
      text: `Source: ${entry.source}\n\n${entry.message}`,
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("Resend failed", res.status, detail);
    return false;
  }
  return true;
}

/** @param {FeedbackEntry} entry */
async function emailFormSubmit(entry) {
  const res = await fetch(`https://formsubmit.co/ajax/${inboxAddress()}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      _subject: "Longshot Feedback",
      _template: "box",
      _captcha: "false",
      message: entry.message,
      source: entry.source,
    }),
  });
  if (!res.ok) return false;
  const body = await res.json().catch(() => ({}));
  const message = String(body?.message || body?.success || "");
  if (/activat|confirm/i.test(message)) return false;
  return body?.success === true || body?.success === "true";
}

/** @param {FeedbackEntry} entry */
async function notifyNtfy(entry) {
  const topic = process.env.FEEDBACK_NTFY_TOPIC;
  if (!topic) return false;
  const res = await fetch(`https://ntfy.sh/${encodeURIComponent(topic)}`, {
    method: "POST",
    headers: {
      Title: "Longshot Feedback",
      Priority: "default",
      Tags: "speech_balloon",
    },
    body: `${entry.source}\n\n${entry.message}`,
  });
  return res.ok;
}

/** @param {FeedbackEntry} entry */
async function notifyWebhook(entry) {
  const hook = process.env.FEEDBACK_WEBHOOK;
  if (!hook) return false;
  const res = await fetch(hook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: `Longshot feedback (${entry.source}): ${entry.message}`,
      ...entry,
    }),
  });
  return res.ok;
}

/** @param {string} message @param {string} [source] */
export async function deliverFeedback(message, source = "longshot") {
  const text = String(message || "").trim().slice(0, 4000);
  if (!text) throw new Error("Message is required");
  const entry = { at: new Date().toISOString(), source, message: text };

  storeLocally(entry);

  if (process.env.RESEND_API_KEY) {
    const delivered = await emailResend(entry);
    return { ok: true, stored: true, delivered };
  }

  const results = await Promise.allSettled([emailFormSubmit(entry), notifyNtfy(entry), notifyWebhook(entry)]);
  const delivered = results.some((result) => result.status === "fulfilled" && result.value === true);
  return { ok: true, stored: true, delivered };
}

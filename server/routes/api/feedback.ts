import { defineEventHandler, readBody, setResponseHeaders, createError } from "h3";
import { deliverFeedback } from "../../feedback.mjs";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, cors);
  if (event.method === "OPTIONS") return "";
  if (event.method !== "POST") {
    throw createError({ statusCode: 405, statusMessage: "Method Not Allowed" });
  }
  const body = (await readBody(event)) as { message?: string; source?: string };
  const result = await deliverFeedback(body?.message || "", body?.source || "extension");
  return { ok: true, delivered: Boolean(result?.delivered) };
});

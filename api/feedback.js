module.exports = async (req, res) => {
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
          text: "Source: " + (body.source || "extension") + "\n\n" + text,
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

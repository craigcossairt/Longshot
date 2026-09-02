async function sendLongshotFeedback(message) {
  const text = String(message || "").trim().slice(0, 4000);
  if (!text) throw new Error("Message is required");

  const endpoints = [
    "https://longshot-cossairt.vercel.app/api/feedback",
    "https://longshot-seven.vercel.app/api/feedback",
    "http://127.0.0.1:8080/api/feedback",
  ];
  let delivered = false;
  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, source: "extension" }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.delivered) {
        delivered = true;
        break;
      }
    } catch {
      /* try next */
    }
  }
  return { delivered };
}

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const submitFeedback = createServerFn({ method: "POST" })
  .validator(z.object({ message: z.string().min(1).max(4000) }))
  .handler(async ({ data }) => {
    const { deliverFeedback } = await import("../../server/feedback.mjs");
    const result = await deliverFeedback(data.message, "studio");
    return { ok: true, delivered: Boolean(result?.delivered) };
  });

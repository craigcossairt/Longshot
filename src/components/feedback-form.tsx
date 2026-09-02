import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { submitFeedback } from "@/lib/submit-feedback";

export function FeedbackForm({ align = "end" }: { align?: "start" | "center" | "end" }) {
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  async function submit() {
    const text = body.trim();
    if (!text) return;
    setSending(true);
    try {
      const result = await submitFeedback({ data: { message: text } });
      if (!result?.delivered) throw new Error("undelivered");
      setBody("");
      setOpen(false);
      toast.success("Sent. Thank you.");
    } catch {
      toast.error("Could not send feedback. Try again in a moment.");
    } finally {
      setSending(false);
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Feedback" title="Feedback">
          <MessageSquare />
        </Button>
      </PopoverTrigger>
      <PopoverContent align={align} className="w-80 space-y-3">
        <p className="text-sm font-medium">Feedback</p>
        <p className="text-xs text-muted">Sent privately to the Longshot inbox. No email address is collected or shown.</p>
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="What should we improve?"
          rows={5}
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="button" size="sm" disabled={!body.trim() || sending} onClick={() => void submit()}>
            {sending ? "Sending" : "Submit"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

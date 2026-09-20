"use client";

import { useState } from "react";
import { sendInquiryReply } from "../messageActions";

export function ReplyComposer({ inquiryId }: { inquiryId: string }) {
  const [draft, setDraft] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/generate-contact-reply", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inquiryId, adminNotes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setDraft(data.draft);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 border-t border-line pt-6">
      <h3 className="text-sm font-semibold text-cream">Reply</h3>
      <label className="mt-3 block text-xs text-faint">Notes for AI (optional)</label>
      <input
        value={adminNotes}
        onChange={(e) => setAdminNotes(e.target.value)}
        placeholder="e.g. offer 10% off next order, mention 48h revision policy…"
        className="mt-1 w-full rounded-lg border border-line bg-ink px-3 py-2 text-sm text-cream"
      />
      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading}
        className="mt-3 rounded-full border border-accent/40 px-4 py-2 text-xs font-semibold text-accent hover:bg-accent/10 disabled:opacity-50"
      >
        {loading ? "Generating…" : "Draft reply with OpenAI"}
      </button>
      {error && <p className="mt-2 text-xs text-flame">{error}</p>}

      <form action={sendInquiryReply} className="mt-4 space-y-2">
        <input type="hidden" name="inquiryId" value={inquiryId} />
        <textarea
          name="body"
          rows={8}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          required
          placeholder="Edit the draft or write your reply…"
          className="w-full rounded-xl border border-line bg-ink px-4 py-3 text-sm text-cream focus:border-accent focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-bright"
        >
          Send email & save
        </button>
      </form>
    </div>
  );
}

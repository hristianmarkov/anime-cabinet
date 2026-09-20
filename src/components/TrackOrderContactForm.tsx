"use client";

import { useState } from "react";
import { AnalyticsEvents, trackFunnel } from "@/lib/analytics";

export function TrackOrderContactForm({ trackToken }: { trackToken: string }) {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch("/api/track/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackToken, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not send message");
      trackFunnel(AnalyticsEvents.trackMessage, { source: "order_tracking" });
      setStatus("sent");
      setMessage("");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <section className="rounded-2xl border border-line bg-surface p-6 shadow-card">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">Need help with this order?</h2>
      <p className="mt-2 text-sm text-muted">
        Send us a message here or reply to any order email — it all lands in the same thread for our team.
      </p>
      {status === "sent" && (
        <p className="mt-4 text-sm text-[#4ade80]">Message sent. We typically reply within 24 hours.</p>
      )}
      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          minLength={5}
          rows={4}
          placeholder="Describe your question or revision request…"
          className="w-full rounded-xl border border-line bg-ink px-4 py-3 text-sm text-cream focus:border-accent focus:outline-none"
        />
        {error && <p className="text-xs text-flame">{error}</p>}
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-bright disabled:opacity-50"
        >
          {status === "loading" ? "Sending…" : "Contact us about this order"}
        </button>
      </form>
    </section>
  );
}

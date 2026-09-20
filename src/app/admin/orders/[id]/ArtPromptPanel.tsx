"use client";

import { useState } from "react";
import { combineArtPromptForOrder } from "../../actions";
import type { StyleArtPrompt } from "@/data/style-art-prompts";

export function ArtPromptPanel({
  orderId,
  stylePrompt,
  customerNotes,
}: {
  orderId: string;
  stylePrompt: StyleArtPrompt;
  customerNotes: string;
}) {
  const [combinedPrompt, setCombinedPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<"base" | "combined" | null>(null);

  async function handleCombine() {
    setLoading(true);
    setError(null);
    try {
      const data = await combineArtPromptForOrder(orderId);
      if (!data.ok) throw new Error(data.error || "Request failed");
      setCombinedPrompt(data.prompt);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function copyText(text: string, which: "base" | "combined") {
    await navigator.clipboard.writeText(text);
    setCopied(which);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <article className="rounded-2xl border border-line bg-surface p-6 shadow-card">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
        Art direction — {stylePrompt.showTitle}
      </h2>
      <p className="mt-2 text-xs text-faint">
        Base template names the show directly ({stylePrompt.medium}). Use “Combine with customer
        notes” to merge order notes via OpenAI (set OPENAI_API_KEY on the server).
      </p>

      {customerNotes.trim() ? (
        <p className="mt-4 rounded-lg border border-line bg-ink px-4 py-3 text-sm text-muted">
          <span className="text-xs font-semibold uppercase text-faint">Customer notes: </span>
          {customerNotes}
        </p>
      ) : (
        <p className="mt-4 text-sm text-faint">No customer notes on this order.</p>
      )}

      <label className="mt-4 block text-xs font-semibold uppercase text-faint">
        Base style prompt
      </label>
      <textarea
        readOnly
        rows={10}
        value={stylePrompt.prompt}
        className="mt-2 w-full rounded-xl border border-line bg-ink px-4 py-3 text-sm leading-relaxed text-cream"
      />

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => copyText(stylePrompt.prompt, "base")}
          className="rounded-full border border-line px-4 py-2 text-xs font-semibold text-cream hover:bg-line"
        >
          {copied === "base" ? "Copied" : "Copy base prompt"}
        </button>
        <button
          type="button"
          onClick={handleCombine}
          disabled={loading}
          className="rounded-full bg-accent px-4 py-2 text-xs font-semibold text-white hover:bg-accent-bright disabled:opacity-60"
        >
          {loading ? "Combining…" : "Combine with customer notes (OpenAI)"}
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-flame">{error}</p>}

      {combinedPrompt && (
        <>
          <label className="mt-6 block text-xs font-semibold uppercase text-flame">
            Final combined prompt
          </label>
          <textarea
            readOnly
            rows={12}
            value={combinedPrompt}
            className="mt-2 w-full rounded-xl border border-flame/30 bg-ink px-4 py-3 text-sm leading-relaxed text-cream"
          />
          <button
            type="button"
            onClick={() => copyText(combinedPrompt, "combined")}
            className="mt-3 rounded-full border border-line px-4 py-2 text-xs font-semibold text-cream hover:bg-line"
          >
            {copied === "combined" ? "Copied" : "Copy combined prompt"}
          </button>
        </>
      )}
    </article>
  );
}

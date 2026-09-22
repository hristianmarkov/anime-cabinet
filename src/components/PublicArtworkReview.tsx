"use client";

import { useState } from "react";
import type { PublicOrderTracking } from "@/lib/orderTrackingPublic";

export function PublicArtworkReview({ tracking, trackToken }: { tracking: PublicOrderTracking; trackToken: string }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState<"revision" | "approve" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const delivery = tracking.previewDelivery;
  if (tracking.status !== "review" || !delivery) return null;

  async function submit(path: "revision" | "approve") {
    setBusy(path); setError(null);
    try {
      const response = await fetch(`/api/track/${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ trackToken, message }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not update your review");
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setBusy(null);
    }
  }

  return (
    <section className="rounded-2xl border border-flame/40 bg-surface p-6 shadow-card">
      <p className="text-xs font-semibold uppercase tracking-wider text-flame">Artwork review · Version {delivery.versionNumber}</p>
      <h2 className="font-display mt-2 text-2xl text-cream">Your preliminary artwork is ready</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {delivery.imageUrls.map((url, index) => <a key={url} href={url} target="_blank" rel="noopener noreferrer"><img src={url} alt={`Artwork preview ${index + 1}`} className="w-full rounded-xl border border-line object-contain" /></a>)}
      </div>
      {tracking.reviewMessages.length > 0 && <div className="mt-6"><h3 className="text-sm font-semibold text-cream">Review conversation</h3><ol className="mt-3 space-y-3">{tracking.reviewMessages.map((item) => <li key={item.id} className={`rounded-xl border border-line p-3 ${item.direction === "customer" ? "ml-6 bg-accent/10" : "mr-6 bg-ink"}`}><p className="text-xs text-faint">{item.author}{item.deliveryVersion ? ` · Version ${item.deliveryVersion}` : ""} · {new Date(item.createdAt).toLocaleString("en-GB")}</p>{item.imageUrls.length > 0 && <div className="mt-3 grid gap-3 sm:grid-cols-2">{item.imageUrls.map((url, index) => <a key={url} href={url} target="_blank" rel="noopener noreferrer"><img src={url} alt={`Artwork version ${item.deliveryVersion ?? ""} preview ${index + 1}`} className="max-h-72 w-full rounded-lg border border-line object-contain" /></a>)}</div>}<p className="mt-2 whitespace-pre-wrap text-sm text-cream">{item.body}</p></li>)}</ol></div>}

      <div className="mt-6 border-t border-line pt-5">
        <label htmlFor="revision-comment" className="text-sm font-semibold text-cream">Need a change?</label>
        <textarea id="revision-comment" value={message} onChange={(event) => setMessage(event.target.value)} minLength={5} maxLength={5000} rows={4} placeholder="Describe the changes you would like…" className="mt-2 w-full rounded-xl border border-line bg-ink px-4 py-3 text-sm text-cream focus:border-accent focus:outline-none" />
        {error && <p className="mt-2 text-sm text-flame">{error}</p>}
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" disabled={busy !== null || message.trim().length < 5} onClick={() => submit("revision")} className="rounded-full border border-flame px-5 py-2.5 text-sm font-semibold text-flame disabled:opacity-50">Send revision comments</button>
          <button type="button" disabled={busy !== null} onClick={() => submit("approve")} className="rounded-full bg-[#4ade80]/20 px-5 py-2.5 text-sm font-semibold text-[#4ade80] disabled:opacity-50">Looks great — proceed</button>
        </div>
      </div>
    </section>
  );
}

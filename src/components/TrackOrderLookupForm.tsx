"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { PublicOrderTracking } from "@/lib/orderTrackingPublic";
import { OrderTrackingDisplay } from "./OrderTrackingDisplay";

export function TrackOrderLookupForm() {
  const router = useRouter();
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ trackToken: string; tracking: PublicOrderTracking } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: orderId.trim(), email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lookup failed");
      setResult({ trackToken: data.trackToken, tracking: data.tracking });
      router.replace(`/track/${data.trackToken}`, { scroll: false });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="rounded-2xl border border-line bg-surface p-6 shadow-card">
        <label className="block text-sm font-semibold text-cream">Order ID</label>
        <input
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          required
          placeholder="From your confirmation email"
          className="mt-2 w-full rounded-xl border border-line bg-ink px-4 py-3 text-sm text-cream focus:border-accent focus:outline-none"
        />
        <label className="mt-4 block text-sm font-semibold text-cream">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-2 w-full rounded-xl border border-line bg-ink px-4 py-3 text-sm text-cream focus:border-accent focus:outline-none"
        />
        {error && <p className="mt-3 text-sm text-flame">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full rounded-full bg-accent py-3 text-sm font-semibold text-white hover:bg-accent-bright disabled:opacity-50"
        >
          {loading ? "Looking up…" : "View status"}
        </button>
      </form>
      {result && (
        <div className="mt-10">
          <OrderTrackingDisplay tracking={result.tracking} trackToken={result.trackToken} />
        </div>
      )}
    </div>
  );
}

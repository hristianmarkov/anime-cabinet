"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";
import { AnalyticsEvents, trackFunnel } from "@/lib/analytics";
import { MAX_TRACK_MESSAGE_IMAGES, MAX_TRACK_MESSAGE_IMAGE_BYTES, TRACK_MESSAGE_IMAGE_TYPES } from "@/lib/trackMessageAttachments";

export function TrackOrderContactForm({ trackToken }: { trackToken: string }) {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<File[]>([]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    try {
      const imageUrls: string[] = [];
      for (const image of images) {
        const safeName = image.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const blob = await upload(`order-messages/${trackToken}/${Date.now()}-${safeName}`, image, {
          access: "public",
          handleUploadUrl: "/api/track/blob-upload",
        });
        imageUrls.push(blob.url);
      }
      const res = await fetch("/api/track/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackToken, message, imageUrls }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not send message");
      trackFunnel(AnalyticsEvents.trackMessage, { source: "order_tracking" });
      setStatus("sent");
      setMessage("");
      setImages([]);
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
        <div>
          <label
            htmlFor="track-message-images"
            className="inline-flex cursor-pointer items-center rounded-full border border-line px-4 py-2 text-sm font-semibold text-cream transition hover:border-accent"
          >
            Add images
          </label>
          <input
            id="track-message-images"
            type="file"
            accept={TRACK_MESSAGE_IMAGE_TYPES.join(",")}
            multiple
            className="sr-only"
            onChange={(event) => {
              const selected = Array.from(event.target.files ?? []);
              const invalid = selected.find((file) =>
                !TRACK_MESSAGE_IMAGE_TYPES.includes(file.type as (typeof TRACK_MESSAGE_IMAGE_TYPES)[number]) ||
                file.size > MAX_TRACK_MESSAGE_IMAGE_BYTES
              );
              if (invalid) {
                setError("Images must be JPG, PNG, WebP, HEIC, or GIF files up to 15MB.");
                event.target.value = "";
                return;
              }
              setError(null);
              setImages(selected.slice(0, MAX_TRACK_MESSAGE_IMAGES));
              if (selected.length > MAX_TRACK_MESSAGE_IMAGES) {
                setError(`You can attach up to ${MAX_TRACK_MESSAGE_IMAGES} images.`);
              }
            }}
          />
          <p className="mt-2 text-xs text-faint">Up to 5 images, 15MB each.</p>
          {images.length > 0 && (
            <ul className="mt-2 space-y-1 text-xs text-muted">
              {images.map((image) => (
                <li key={`${image.name}-${image.lastModified}`} className="flex items-center justify-between gap-3">
                  <span className="truncate">{image.name}</span>
                  <button type="button" className="text-accent hover:underline" onClick={() => setImages((current) => current.filter((item) => item !== image))}>
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {error && <p className="text-xs text-flame">{error}</p>}
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-bright disabled:opacity-50"
        >
          {status === "loading" ? (images.length ? "Uploading & sending…" : "Sending…") : "Contact us about this order"}
        </button>
      </form>
    </section>
  );
}

"use client";

import { upload } from "@vercel/blob/client";
import { useMemo, useState } from "react";
import { sendDelivery } from "../../actions";

export function SendDeliveryForm({
  orderId,
  revisionHours,
  isDigital,
}: {
  orderId: string;
  revisionHours: number;
  isDigital: boolean;
}) {
  const [comment, setComment] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileLabel = useMemo(() => {
    if (files.length === 0) return "No files selected";
    return files.map((f) => f.name).join(", ");
  }, [files]);

  async function handleSend() {
    setError(null);
    if (files.length === 0) {
      setError("Upload at least one image (JPEG, PNG, WebP, or GIF).");
      return;
    }

    setUploading(true);
    try {
      const imageUrls: string[] = [];
      for (const file of files) {
        const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
        const blob = await upload(
          `orders/deliveries/${orderId}/${Date.now()}-${safeName}`,
          file,
          { access: "public", handleUploadUrl: "/api/admin/blob-upload" }
        );
        imageUrls.push(blob.url);
      }

      const formData = new FormData();
      formData.set("orderId", orderId);
      formData.set("comment", comment);
      formData.set("imageUrls", JSON.stringify(imageUrls));
      await sendDelivery(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setUploading(false);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        Sends the customer an email with download links. They have{" "}
        <strong className="text-cream">{revisionHours} hours</strong> to reply with
        revision notes
        {isDigital
          ? " — after that, the digital order is marked complete."
          : " — after that, the artwork is approved and the print goes into production."}{" "}
        Reminders go out at 24h and 48h after send.
      </p>

      <div>
        <label htmlFor="delivery-files" className="text-sm font-semibold text-cream">
          Artwork files
        </label>
        <input
          id="delivery-files"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
          className="mt-2 block w-full text-sm text-muted file:mr-4 file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
        />
        <p className="mt-1 text-xs text-faint">{fileLabel}</p>
      </div>

      <div>
        <label htmlFor="delivery-comment" className="text-sm font-semibold text-cream">
          Message to customer <span className="font-normal text-faint">(optional)</span>
        </label>
        <textarea
          id="delivery-comment"
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="e.g. Here's your first preview — let us know if you'd like the background darker."
          className="mt-2 w-full rounded-xl border border-line bg-ink px-4 py-3 text-sm text-cream placeholder:text-faint focus:border-accent focus:outline-none"
        />
      </div>

      {error && <p className="text-sm text-flame">{error}</p>}

      <button
        type="button"
        onClick={handleSend}
        disabled={uploading}
        className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-bright disabled:opacity-60"
      >
        {uploading ? "Uploading…" : "Send to customer"}
      </button>
    </div>
  );
}

"use client";

import { upload } from "@vercel/blob/client";
import { useMemo, useState } from "react";
import {
  draftDeliveryMessageForOrder,
  getDeliveryUploadToken,
  sendDelivery,
} from "../../actions";

const MAX_FILE_BYTES = 100 * 1024 * 1024;

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
  const [adminNotes, setAdminNotes] = useState("");
  const [draftLoading, setDraftLoading] = useState(false);
  const [draftError, setDraftError] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileLabel = useMemo(() => {
    if (files.length === 0) return "No files selected";
    return files.map((f) => f.name).join(", ");
  }, [files]);

  async function handleDraftMessage() {
    setDraftLoading(true);
    setDraftError(null);
    try {
      const data = await draftDeliveryMessageForOrder(orderId, adminNotes);
      if (!data.ok) throw new Error(data.error || "Request failed");
      setComment(data.draft);
    } catch (err) {
      setDraftError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setDraftLoading(false);
    }
  }

  async function handleSend() {
    setError(null);
    if (files.length === 0) {
      setError("Upload at least one image (JPEG, PNG, WebP, or GIF).");
      return;
    }

    for (const file of files) {
      if (file.size > MAX_FILE_BYTES) {
        setError(`File too large (max 100MB each): ${file.name}`);
        return;
      }
    }

    setUploading(true);
    try {
      const tokenResult = await getDeliveryUploadToken(orderId);
      if (!tokenResult.ok) {
        throw new Error(tokenResult.error || "Could not start upload");
      }
      const uploadHeaders = { Authorization: `Bearer ${tokenResult.token}` };

      const imageUrls: string[] = [];
      for (const file of files) {
        const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
        const blob = await upload(
          `orders/deliveries/${orderId}/${Date.now()}-${safeName}`,
          file,
          {
            access: "public",
            handleUploadUrl: "/api/admin/blob-upload",
            headers: uploadHeaders,
          }
        );
        imageUrls.push(blob.url);
      }

      const formData = new FormData();
      formData.set("orderId", orderId);
      formData.set("comment", comment);
      formData.set("imageUrls", JSON.stringify(imageUrls));
      await sendDelivery(formData);
    } catch (err) {
      if (
        typeof err === "object" &&
        err !== null &&
        "digest" in err &&
        typeof (err as { digest: string }).digest === "string" &&
        (err as { digest: string }).digest.startsWith("NEXT_REDIRECT")
      ) {
        throw err;
      }
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
          ? " — after that, the order advances to Digital File."
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
        <p className="mt-1 text-xs text-faint">
          {fileLabel}
          {files.length > 0 && " · Large files upload directly to storage (up to 100MB each)."}
        </p>
      </div>

      <div>
        <label htmlFor="delivery-ai-notes" className="text-sm font-semibold text-cream">
          Notes for AI <span className="font-normal text-faint">(optional)</span>
        </label>
        <input
          id="delivery-ai-notes"
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          placeholder="e.g. first preview, softened background per their note, mention 72h revision window…"
          className="mt-2 w-full rounded-xl border border-line bg-ink px-4 py-2 text-sm text-cream placeholder:text-faint focus:border-accent focus:outline-none"
        />
        <button
          type="button"
          onClick={handleDraftMessage}
          disabled={draftLoading || uploading}
          className="mt-3 rounded-full border border-accent/40 px-4 py-2 text-xs font-semibold text-accent hover:bg-accent/10 disabled:opacity-50"
        >
          {draftLoading ? "Generating…" : "Draft message with OpenAI"}
        </button>
        {draftError && <p className="mt-2 text-xs text-flame">{draftError}</p>}
        <p className="mt-2 text-xs text-faint">
          Uses order details only (style name, format, notes, etc.) — not the art-direction prompt.
        </p>
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
          placeholder="Edit the draft or write your own message…"
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

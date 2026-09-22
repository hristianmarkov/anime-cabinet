"use client";

import { upload } from "@vercel/blob/client";
import { useState } from "react";
import { getDeliveryUploadToken, sendFinalFile } from "../../actions";
import type { OrderFinalFile } from "@/lib/schema";

const MAX_FILE_BYTES = 100 * 1024 * 1024;

export function FinalFilePanel({
  orderId,
  finalFile,
  canSend,
}: {
  orderId: string;
  finalFile: OrderFinalFile | null;
  canSend: boolean;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    if (!file) {
      setError("Choose the final high-resolution file.");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError("The file must be no larger than 100MB.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const auth = await getDeliveryUploadToken(orderId);
      if (!auth.ok) throw new Error(auth.error);
      const headers = { Authorization: `Bearer ${auth.token}` };
      const name = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const originalBlob = await upload(`orders/deliveries/${orderId}/final/original-${Date.now()}-${name}`, file, {
          access: "public",
          handleUploadUrl: "/api/admin/blob-upload",
          headers,
      });
      const data = new FormData();
      data.set("orderId", orderId);
      data.set("fileUrl", originalBlob.url);
      data.set("previewUrl", originalBlob.url);
      await sendFinalFile(data);
    } catch (err) {
      if (typeof err === "object" && err && "digest" in err) throw err;
      setError(err instanceof Error ? err.message : "Upload failed");
      setBusy(false);
    }
  }

  return (
    <article className="rounded-2xl border border-cyan-400/30 bg-surface p-6 shadow-card">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-cyan-300">Final digital file</h2>
      {finalFile && (
        <p className="mt-3 text-sm text-[#4ade80]">
          Sent {new Date(finalFile.sentAt).toLocaleString("en-GB")} ·{" "}
          <a className="underline" href={finalFile.fileUrl} target="_blank" rel="noreferrer">Open original</a>
        </p>
      )}
      {canSend ? (
        <div className="mt-4 space-y-4">
          <p className="text-sm text-muted">Upload the final high-resolution artwork. The tracking page will show the same artwork in a constrained preview and provide the original as the download.</p>
          <label className="block text-sm text-cream">High-resolution final file
            <input className="mt-2 block w-full text-sm text-muted" type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </label>
          {error && <p className="text-sm text-flame">{error}</p>}
          <button type="button" onClick={handleSend} disabled={busy} className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white disabled:opacity-60">
            {busy ? "Uploading and sending…" : "Upload and send final file"}
          </button>
        </div>
      ) : !finalFile ? (
        <p className="mt-3 text-sm text-muted">This panel becomes available after artwork approval.</p>
      ) : null}
    </article>
  );
}

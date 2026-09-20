import { put } from "@vercel/blob";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
]);

const MAX_BYTES = 100 * 1024 * 1024;

export async function uploadOrderDeliveryImages(
  orderId: string,
  files: File[]
): Promise<string[]> {
  if (!process.env.BLOB_READ_WRITE_TOKEN?.trim()) {
    throw new Error(
      "Blob storage is not configured. Add BLOB_READ_WRITE_TOKEN on Vercel for this project."
    );
  }

  const urls: string[] = [];
  for (const file of files) {
    if (file.size === 0) continue;
    if (!ALLOWED_TYPES.has(file.type)) {
      throw new Error(`Unsupported file type: ${file.type || file.name}`);
    }
    if (file.size > MAX_BYTES) {
      throw new Error(`File too large (max 100MB): ${file.name}`);
    }
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const blob = await put(
      `orders/deliveries/${orderId}/${Date.now()}-${safeName}`,
      file,
      { access: "public", addRandomSuffix: true }
    );
    urls.push(blob.url);
  }
  return urls;
}

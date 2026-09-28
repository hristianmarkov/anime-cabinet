export const TRACK_MESSAGE_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "image/gif",
] as const;

export const MAX_TRACK_MESSAGE_IMAGES = 5;
export const MAX_TRACK_MESSAGE_IMAGE_BYTES = 15 * 1024 * 1024;

export function isTrackMessageImageUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;

  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname.endsWith(".public.blob.vercel-storage.com");
  } catch {
    return false;
  }
}

export function validateTrackMessageImageUrls(value: unknown): string[] | null {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > MAX_TRACK_MESSAGE_IMAGES) return null;
  return value.every(isTrackMessageImageUrl) ? value : null;
}

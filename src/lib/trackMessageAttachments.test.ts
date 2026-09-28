import assert from "node:assert/strict";
import test from "node:test";
import { validateTrackMessageImageUrls } from "./trackMessageAttachments";

test("accepts omitted and valid Vercel Blob image URLs", () => {
  assert.deepEqual(validateTrackMessageImageUrls(undefined), []);
  assert.deepEqual(
    validateTrackMessageImageUrls(["https://example.public.blob.vercel-storage.com/order-photo.png"]),
    ["https://example.public.blob.vercel-storage.com/order-photo.png"]
  );
});

test("rejects untrusted, non-HTTPS, and excessive image URLs", () => {
  assert.equal(validateTrackMessageImageUrls(["https://example.com/photo.png"]), null);
  assert.equal(validateTrackMessageImageUrls(["http://example.public.blob.vercel-storage.com/photo.png"]), null);
  assert.equal(
    validateTrackMessageImageUrls(
      Array.from({ length: 6 }, (_, index) =>
        `https://example.public.blob.vercel-storage.com/photo-${index}.png`
      )
    ),
    null
  );
});

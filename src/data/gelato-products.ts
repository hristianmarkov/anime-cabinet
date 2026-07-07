/**
 * Map our print format IDs to Gelato product UIDs.
 * Fill these from https://dashboard.gelato.com/catalogue/categories after account setup.
 * Placeholder UIDs allow dev/testing; replace before production print orders.
 */
export const GELATO_PRODUCT_UIDS: Record<string, string> = {
  "poster-12x18": process.env.GELATO_UID_POSTER_12X18 ?? "",
  "poster-18x24": process.env.GELATO_UID_POSTER_18X24 ?? "",
  "canvas-12x18": process.env.GELATO_UID_CANVAS_12X18 ?? "",
  "canvas-18x24": process.env.GELATO_UID_CANVAS_18X24 ?? "",
  "framed-12x18": process.env.GELATO_UID_FRAMED_12X18 ?? "",
};

export function getGelatoProductUid(formatId: string): string | null {
  const uid = GELATO_PRODUCT_UIDS[formatId];
  return uid && uid.length > 0 ? uid : null;
}

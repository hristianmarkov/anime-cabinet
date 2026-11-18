/**
 * Map our print format IDs to Gelato product UIDs.
 * Fill these from https://dashboard.gelato.com/catalogue/categories after account setup.
 */
export const GELATO_PRODUCT_UIDS: Record<string, string> = {
  "poster-12x16": process.env.GELATO_UID_POSTER_12X16 ?? "",
  "poster-12x18": process.env.GELATO_UID_POSTER_12X18 ?? "",
  "poster-18x24": process.env.GELATO_UID_POSTER_18X24 ?? "",
  "canvas-12x16": process.env.GELATO_UID_CANVAS_12X16 ?? "",
  "canvas-12x18": process.env.GELATO_UID_CANVAS_12X18 ?? "",
  "canvas-18x24": process.env.GELATO_UID_CANVAS_18X24 ?? "",
  "framed-12x16": process.env.GELATO_UID_FRAMED_12X16 ?? "",
  "framed-12x18": process.env.GELATO_UID_FRAMED_12X18 ?? "",
  "framed-18x24": process.env.GELATO_UID_FRAMED_18X24 ?? "",
};

export function getGelatoProductUid(formatId: string): string | null {
  const uid = GELATO_PRODUCT_UIDS[formatId];
  return typeof uid === "string" && uid.trim() ? uid.trim() : null;
}

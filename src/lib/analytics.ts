import { site } from "@/data/site";

export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? site.gaMeasurementId;

/** Custom + GA4-aligned event names for funnel reporting in GA4 Explorations. */
export const AnalyticsEvents = {
  viewStyleGallery: "view_item_list",
  selectStyle: "select_item",
  viewProduct: "view_item",
  addPhotos: "add_photos",
  beginCheckout: "begin_checkout",
  purchase: "purchase",
  contactSubmit: "contact_submit",
  trackMessage: "track_message_sent",
} as const;

export type AnalyticsEventName =
  (typeof AnalyticsEvents)[keyof typeof AnalyticsEvents];

export function isAdminPath(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export function isAnalyticsAllowedPath(pathname: string): boolean {
  if (!GA_MEASUREMENT_ID) return false;
  return !isAdminPath(pathname);
}

export function trackEvent(
  eventName: string,
  params?: Record<string, unknown>
): void {
  if (typeof window === "undefined") return;
  if (!isAnalyticsAllowedPath(window.location.pathname)) return;
  if (typeof window.gtag !== "function") return;

  const cleaned: Record<string, unknown> = {};
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) cleaned[key] = value;
    }
  }

  window.gtag("event", eventName, cleaned);
}

/** Same event with a consistent `funnel_step` param for GA4 funnel explorations. */
export function trackFunnel(
  funnelStep: AnalyticsEventName,
  params?: Record<string, unknown>
): void {
  trackEvent(funnelStep, { funnel_step: funnelStep, ...params });
}

export type GaItem = {
  item_id: string;
  item_name: string;
  item_category?: string;
  price?: number;
  quantity?: number;
};

export function trackViewItem(item: GaItem, value?: number, currency?: string): void {
  trackFunnel(AnalyticsEvents.viewProduct, {
    currency: (currency ?? "USD").toUpperCase(),
    value,
    items: [item],
  });
}

export function trackBeginCheckout(input: {
  value: number;
  currency: string;
  item: GaItem;
  characters?: number;
  format_id?: string;
}): void {
  trackFunnel(AnalyticsEvents.beginCheckout, {
    currency: input.currency.toUpperCase(),
    value: input.value,
    characters: input.characters,
    format_id: input.format_id,
    items: [{ ...input.item, quantity: 1 }],
  });
}

export function trackPurchase(input: {
  transaction_id: string;
  value: number;
  currency: string;
  item: GaItem;
}): void {
  trackFunnel(AnalyticsEvents.purchase, {
    transaction_id: input.transaction_id,
    currency: input.currency.toUpperCase(),
    value: input.value,
    items: [{ ...input.item, quantity: 1 }],
  });
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

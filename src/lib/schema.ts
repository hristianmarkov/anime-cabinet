import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const ORDER_STATUSES = [
  "pending",
  "paid",
  "in_progress",
  "review",
  "delivered",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  addressLine1: string;
  city: string;
  postCode: string;
  country: string;
}

export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  status: text("status").$type<OrderStatus>().default("pending").notNull(),
  styleSlug: text("style_slug").notNull(),
  styleName: text("style_name").notNull(),
  characters: integer("characters").notNull(),
  background: text("background").notNull(),
  formatId: text("format_id").notNull(),
  notes: text("notes").default("").notNull(),
  email: text("email").notNull(),
  photoUrls: jsonb("photo_urls").$type<string[]>().default([]).notNull(),
  expedited: boolean("expedited").default(false).notNull(),
  shippingAddress: jsonb("shipping_address").$type<ShippingAddress | null>(),
  shippingMethodUid: text("shipping_method_uid"),
  shippingMethodName: text("shipping_method_name"),
  shippingAmount: integer("shipping_amount").default(0).notNull(),
  gelatoQuoteId: text("gelato_quote_id"),
  amountTotal: integer("amount_total").notNull(),
  currency: text("currency").default("usd").notNull(),
  stripeSessionId: text("stripe_session_id"),
});

export type Order = typeof orders.$inferSelect;

export const orderDeliveries = pgTable("order_deliveries", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id").notNull(),
  versionNumber: integer("version_number").notNull(),
  comment: text("comment").default("").notNull(),
  imageUrls: jsonb("image_urls").$type<string[]>().default([]).notNull(),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  revisionHours: integer("revision_hours").notNull(),
  revisionDeadline: timestamp("revision_deadline", { withTimezone: true }),
  reminder24SentAt: timestamp("reminder_24_sent_at", { withTimezone: true }),
  reminder48SentAt: timestamp("reminder_48_sent_at", { withTimezone: true }),
  autoCompletedAt: timestamp("auto_completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type OrderDelivery = typeof orderDeliveries.$inferSelect;

export const TIMELINE_EVENT_KINDS = [
  "order_created",
  "payment_received",
  "status_updated",
  "delivery_sent",
  "reminder_24h",
  "reminder_48h",
  "auto_completed",
] as const;

export type TimelineEventKind = (typeof TIMELINE_EVENT_KINDS)[number];

export const orderTimelineEvents = pgTable("order_timeline_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id").notNull(),
  kind: text("kind").$type<TimelineEventKind>().notNull(),
  summary: text("summary").notNull(),
  detail: text("detail").default("").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type OrderTimelineEvent = typeof orderTimelineEvents.$inferSelect;

export const siteCounters = pgTable("site_counters", {
  key: text("key").primaryKey(),
  value: integer("value").notNull(),
});

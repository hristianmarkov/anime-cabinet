import { sql } from "drizzle-orm";
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
  "digital_file",
  "approved",
  "printing",
  "shipped",
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
  gelatoOrderId: text("gelato_order_id"),
  gelatoFulfillmentStatus: text("gelato_fulfillment_status"),
  printFileUrl: text("print_file_url"),
  trackToken: text("track_token").default(sql`gen_random_uuid()`).notNull(),
  productionScheduledAt: timestamp("production_scheduled_at", { withTimezone: true }),
  trackingNumber: text("tracking_number"),
  trackingUrl: text("tracking_url"),
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

/** Final, full-resolution customer asset. Kept separate from review previews. */
export const orderFinalFiles = pgTable("order_final_files", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id").notNull().unique(),
  fileUrl: text("file_url").notNull(),
  previewUrl: text("preview_url").notNull(),
  sentAt: timestamp("sent_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type OrderFinalFile = typeof orderFinalFiles.$inferSelect;

export const TIMELINE_EVENT_KINDS = [
  "order_created",
  "payment_received",
  "status_updated",
  "delivery_sent",
  "reminder_24h",
  "reminder_48h",
  "auto_completed",
  "customer_feedback",
  "artwork_approved",
  "revision_requested",
  "gelato_submitted",
  "gelato_status_sync",
  "final_file_sent",
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

export const orderCustomerFeedback = pgTable("order_customer_feedback", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id").notNull(),
  body: text("body").notNull(),
  source: text("source").default("manual").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type OrderCustomerFeedback = typeof orderCustomerFeedback.$inferSelect;

export const CONTACT_INQUIRY_STATUSES = ["open", "closed"] as const;
export type ContactInquiryStatus = (typeof CONTACT_INQUIRY_STATUSES)[number];

export const contactInquiries = pgTable("contact_inquiries", {
  id: uuid("id").defaultRandom().primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  status: text("status").$type<ContactInquiryStatus>().default("open").notNull(),
  linkedOrderId: text("linked_order_id"),
  /** Subject line shared across the customer email thread (without Re:). */
  threadSubject: text("thread_subject"),
  lastRfcMessageId: text("last_rfc_message_id"),
  emailReferences: text("email_references"),
});

export type ContactInquiry = typeof contactInquiries.$inferSelect;

export const contactMessages = pgTable("contact_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  inquiryId: uuid("inquiry_id").notNull(),
  direction: text("direction").$type<"inbound" | "outbound">().notNull(),
  body: text("body").notNull(),
  rfcMessageId: text("rfc_message_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type ContactMessage = typeof contactMessages.$inferSelect;

export const siteCounters = pgTable("site_counters", {
  key: text("key").primaryKey(),
  value: integer("value").notNull(),
});

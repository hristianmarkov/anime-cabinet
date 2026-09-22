import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { isDigitalOrder, revisionWindowHours } from "@/lib/orderDeliveryRules";
import { buildOrderPipeline, getActiveDelivery } from "@/lib/orderWorkflow";
import {
  orderDeliveries,

  orderReviewMessages,

  orderFinalFiles,

  orderTimelineEvents,
  orders,
  type OrderDelivery,
  type OrderTimelineEvent,
} from "@/lib/schema";
import { PRINT_FORMATS, formatUsd } from "@/data/pricing";
import { StatusUpdateForm } from "./StatusUpdateForm";
import { AdminShell } from "../../AdminShell";
import { statusColors, statusLabels } from "../../order-ui";
import { trackOrderUrl } from "@/lib/trackOrderUrl";
import { getStyleArtPromptOrFallback } from "@/data/style-art-prompts";
import { ArtPromptPanel } from "./ArtPromptPanel";
import { CustomerReviewPanel } from "./CustomerReviewPanel";
import { OrderPipeline } from "./OrderPipeline";
import { PrintFulfillmentPanel } from "./PrintFulfillmentPanel";
import { ReviewCountdown } from "./ReviewCountdown";
import { SendDeliveryForm } from "./SendDeliveryForm";
import { FinalFilePanel } from "./FinalFilePanel";

export const metadata: Metadata = {
  title: "Order detail — Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function timelineDot(kind: string): string {
  switch (kind) {
    case "payment_received":
      return "bg-gold";
    case "delivery_sent":
      return "bg-flame";
    case "reminder_24h":
    case "reminder_48h":
      return "bg-electric";
    case "auto_completed":
    case "artwork_approved":
      return "bg-[#4ade80]";
    case "customer_feedback":
    case "revision_requested":
      return "bg-accent";
    default:
      return "bg-faint";
  }
}

export default async function AdminOrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin");
  }

  const { id } = await params;
  const query = await searchParams;

  let dbError: string | null = null;
  let order = null;
  let timeline: OrderTimelineEvent[] = [];
  let deliveries: OrderDelivery[] = [];

  let reviewMessages: (typeof orderReviewMessages.$inferSelect)[] = [];
  let finalFile: (typeof orderFinalFiles.$inferSelect) | null = null;


  try {
    const db = getDb();
    const [row] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    order = row ?? null;
    if (order) {
      timeline = await db
        .select()
        .from(orderTimelineEvents)
        .where(eq(orderTimelineEvents.orderId, id))
        .orderBy(desc(orderTimelineEvents.createdAt));
      deliveries = await db
        .select()
        .from(orderDeliveries)
        .where(eq(orderDeliveries.orderId, id))
        .orderBy(desc(orderDeliveries.versionNumber));
      reviewMessages = await db
        .select()

        .from(orderReviewMessages)
        .where(eq(orderReviewMessages.orderId, id))
        .orderBy(orderReviewMessages.createdAt);
      const [storedFinalFile] = await db
        .select()
        .from(orderFinalFiles)
        .where(eq(orderFinalFiles.orderId, id))
        .limit(1);
      finalFile = storedFinalFile ?? null;

    }
  } catch {
    dbError =
      "Could not load order. Run npm run db:push after deploying schema changes.";
  }

  if (!dbError && !order) notFound();

  if (!order) {
    return (
      <AdminShell active="orders">
        <section className="mx-auto max-w-3xl px-4 py-12">
          <p className="text-flame">{dbError}</p>
        </section>
      </AdminShell>
    );
  }

  const format = PRINT_FORMATS.find((f) => f.id === order.formatId);
  const shipping = order.shippingAddress;
  const digital = isDigitalOrder(order);
  const revisionHours = revisionWindowHours(order);
  const stylePrompt = getStyleArtPromptOrFallback(order.styleSlug, order.styleName);
  const pipelineSteps = buildOrderPipeline(order);
  const activeDelivery = getActiveDelivery(deliveries);
  const showReviewPanel = order.status === "review" || reviewMessages.length > 0;
  const showPrintPanel =
    !digital &&
    ["digital_file", "approved", "printing", "shipped", "delivered", "review"].includes(order.status);

  return (
    <AdminShell active="orders">
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link href="/admin" className="text-sm font-semibold text-accent hover:underline">
              ← All orders
            </Link>
            <h1 className="font-display mt-2 text-3xl text-cream">{order.styleName}</h1>
          <p className="mt-1 break-all text-xs text-faint">{order.id}</p>
          <p className="mt-2 text-xs text-muted">
            Customer track link:{" "}
            <a href={trackOrderUrl(order)} className="text-accent hover:underline break-all">
              {trackOrderUrl(order)}
            </a>
          </p>
        </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColors[order.status]}`}
          >
            {statusLabels[order.status]}
          </span>
        </div>

      {query.sent === "1" && (
        <p className="mt-6 rounded-xl border border-[#4ade80]/40 bg-[#4ade80]/10 px-4 py-3 text-sm text-[#4ade80]">
          Artwork sent — the customer has been emailed.
        </p>
      )}
      {query.sent === "gelato" && (
        <p className="mt-6 rounded-xl border border-[#4ade80]/40 bg-[#4ade80]/10 px-4 py-3 text-sm text-[#4ade80]">
          Submitted to Gelato — print production started.
        </p>
      )}
        {query.error && (
          <p className="mt-6 rounded-xl border border-flame/40 bg-flame/10 px-4 py-3 text-sm text-flame">
            {decodeURIComponent(query.error)}
          </p>
        )}

        <article className="mt-8 rounded-2xl border border-line bg-surface p-6 shadow-card">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">Pipeline</h2>
          <div className="mt-6">
            <OrderPipeline steps={pipelineSteps} />
          </div>
          {order.status === "review" && activeDelivery?.revisionDeadline && (
            <div className="mt-6 max-w-md">
              <ReviewCountdown
                deadlineIso={new Date(activeDelivery.revisionDeadline).toISOString()}
                revisionHours={revisionHours}
              />
            </div>
          )}
        </article>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            {showReviewPanel && (
              <CustomerReviewPanel
                orderId={order.id}
                messages={reviewMessages}
                deliveries={deliveries}
                showActions={order.status === "review"}
              />
            )}

            <FinalFilePanel
              orderId={order.id}
              finalFile={finalFile}
              canSend={order.status === "digital_file"}
            />

            {showPrintPanel && <PrintFulfillmentPanel order={order} />}

            <article className="rounded-2xl border border-line bg-surface p-6 shadow-card">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
                Order details
              </h2>
              <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-xs text-faint">Customer</dt>
                  <dd className="break-all text-cream">
                    <a href={`mailto:${order.email}`} className="text-accent hover:underline">
                      {order.email}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-faint">Placed</dt>
                  <dd className="text-cream">{new Date(order.createdAt).toLocaleString("en-GB")}</dd>
                </div>
                <div>
                  <dt className="text-xs text-faint">Characters</dt>
                  <dd className="text-cream">{order.characters}</dd>
                </div>
                <div>
                  <dt className="text-xs text-faint">Format</dt>
                  <dd className="text-cream">{format?.label ?? order.formatId}</dd>
                </div>
                <div>
                  <dt className="text-xs text-faint">Total</dt>
                  <dd className="font-semibold text-cream">
                    {formatUsd(order.amountTotal / 100)} {order.currency.toUpperCase()}
                  </dd>
                </div>
              </dl>

              {order.expedited && (
                <p className="mt-4 inline-block rounded-full bg-flame/20 px-3 py-1 text-xs font-semibold text-flame">
                  24-hour expedited
                </p>
              )}

              {order.notes && (
                <p className="mt-4 rounded-lg border border-line bg-ink px-4 py-3 text-sm text-muted">
                  <span className="text-xs font-semibold uppercase text-faint">Notes: </span>
                  {order.notes}
                </p>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                {order.photoUrls.map((url, i) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-line bg-ink px-3 py-1.5 text-xs font-semibold text-accent hover:border-accent"
                  >
                    Reference photo {i + 1} ↗
                  </a>
                ))}
              </div>

              {order.formatId !== "digital" && shipping && (
                <div className="mt-4 rounded-lg border border-line bg-ink px-4 py-3 text-sm text-muted">
                  <p className="text-xs font-semibold uppercase text-faint">Ship to</p>
                  <p className="mt-1 text-cream">
                    {shipping.firstName} {shipping.lastName}
                  </p>
                  <p>{shipping.addressLine1}</p>
                  <p>
                    {shipping.city}, {shipping.postCode}, {shipping.country}
                  </p>
                  {order.shippingMethodName && <p className="mt-2">{order.shippingMethodName}</p>}
                </div>
              )}

              <StatusUpdateForm
                orderId={order.id}
                currentStatus={order.status}
                returnTo={`/admin/orders/${order.id}`}
              />
            </article>

            <ArtPromptPanel
              orderId={order.id}
              stylePrompt={stylePrompt}
              customerNotes={order.notes}
            />

            {order.status === "in_progress" && (
              <article className="rounded-2xl border border-line bg-surface p-6 shadow-card">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
                  Send artwork
                </h2>
                <div className="mt-4">
                  <SendDeliveryForm
                    orderId={order.id}
                    revisionHours={revisionHours}
                  />
                </div>
              </article>
            )}

            {deliveries.length > 0 && (
              <article className="rounded-2xl border border-line bg-surface p-6 shadow-card">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
                  Sent versions
                </h2>
                <ul className="mt-4 space-y-4">
                  {deliveries.map((d) => (
                    <li key={d.id} className="rounded-xl border border-line bg-ink p-4 text-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold text-cream">Version {d.versionNumber}</p>
                        {d.sentAt && (
                          <p className="text-xs text-faint">
                            Sent {new Date(d.sentAt).toLocaleString("en-GB")}
                          </p>
                        )}
                      </div>
                      {d.comment && <p className="mt-2 text-muted">{d.comment}</p>}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {d.imageUrls.map((url, i) => (
                          <a
                            key={url}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-semibold text-accent hover:underline"
                          >
                            File {i + 1} ↗
                          </a>
                        ))}
                      </div>
                      {d.revisionDeadline && !d.autoCompletedAt && (
                        <p className="mt-2 text-xs text-flame">
                          Revision window until{" "}
                          {new Date(d.revisionDeadline).toLocaleString("en-GB")} UTC
                        </p>
                      )}
                      {d.autoCompletedAt && (
                        <p className="mt-2 text-xs text-[#4ade80]">
                          Closed {new Date(d.autoCompletedAt).toLocaleString("en-GB")}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </article>
            )}
          </div>

          <aside className="h-fit rounded-2xl border border-line bg-surface p-6 shadow-card">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">Event log</h2>
            {timeline.length === 0 ? (
              <p className="mt-4 text-sm text-faint">No events yet.</p>
            ) : (
              <ol className="mt-4 space-y-4">
                {timeline.map((event) => (
                  <li key={event.id} className="flex gap-3">
                    <span
                      className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${timelineDot(event.kind)}`}
                      aria-hidden
                    />
                    <div>
                      <p className="text-sm text-cream">{event.summary}</p>
                      {event.detail && event.kind !== "customer_feedback" && (
                        <p className="mt-1 whitespace-pre-wrap text-xs text-muted">{event.detail}</p>
                      )}
                      <p className="mt-1 text-xs text-faint">
                        {new Date(event.createdAt).toLocaleString("en-GB")}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </aside>
        </div>
      </section>
    </AdminShell>
  );
}

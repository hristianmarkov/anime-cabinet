import type { Metadata } from "next";
import { desc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { ORDER_STATUSES, orders, type Order } from "@/lib/schema";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { PRINT_FORMATS, formatUsd } from "@/data/pricing";
import { login, logout, updateOrderStatus } from "./actions";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const statusColors: Record<string, string> = {
  pending: "bg-faint/20 text-muted",
  paid: "bg-gold/20 text-gold",
  in_progress: "bg-electric/20 text-electric",
  review: "bg-flame/20 text-flame",
  delivered: "bg-[#4ade80]/20 text-[#4ade80]",
  cancelled: "bg-accent/20 text-accent",
};

const statusLabels: Record<string, string> = {
  pending: "Pending payment",
  paid: "Paid — new",
  in_progress: "In progress",
  review: "Sent for review",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

function LoginForm({ error }: { error?: string }) {
  const errorMessage =
    error === "invalid"
      ? "Incorrect password. Please try again."
      : error === "not_configured"
        ? "ADMIN_PASSWORD is not set on this deployment — login is disabled."
        : !process.env.ADMIN_PASSWORD
          ? "ADMIN_PASSWORD is not set in the environment — login is disabled until you configure it."
          : null;

  return (
    <section className="mx-auto max-w-sm px-4 py-24">
      <h1 className="font-display text-center text-3xl text-cream">Admin Login</h1>
      <form action={login} className="mt-8 rounded-2xl border border-line bg-surface p-6 shadow-card">
        <label htmlFor="password" className="text-sm font-semibold text-cream">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoFocus
          className="mt-2 w-full rounded-xl border border-line bg-ink px-4 py-3 text-sm text-cream focus:border-accent focus:outline-none"
        />
        <button
          type="submit"
          className="mt-4 w-full rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-bright"
        >
          Sign In
        </button>
        {errorMessage && <p className="mt-4 text-xs text-flame">{errorMessage}</p>}
      </form>
    </section>
  );
}

function OrderCard({ order }: { order: Order }) {
  const format = PRINT_FORMATS.find((f) => f.id === order.formatId);
  const shipping = order.shippingAddress;
  return (
    <article className="rounded-2xl border border-line bg-surface p-6 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-cream">
            {order.styleName}
            {order.expedited && (
              <span className="ml-2 rounded-full bg-flame/20 px-2 py-0.5 text-xs font-semibold text-flame">
                24h expedited
              </span>
            )}
          </h2>
          <p className="mt-0.5 text-xs text-faint">
            {order.id} · {new Date(order.createdAt).toLocaleString("en-GB")}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColors[order.status]}`}
        >
          {statusLabels[order.status]}
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-xs text-faint">Customer</dt>
          <dd className="break-all text-cream">{order.email}</dd>
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

      {order.formatId !== "digital" && shipping && (
        <div className="mt-4 rounded-lg border border-line bg-ink px-4 py-3 text-sm text-muted">
          <p className="text-xs font-semibold uppercase tracking-wide text-faint">Shipping</p>
          <p className="mt-1 text-cream">
            {shipping.firstName} {shipping.lastName}
          </p>
          <p>{shipping.addressLine1}</p>
          <p>
            {shipping.city}, {shipping.postCode}, {shipping.country}
          </p>
          {order.shippingMethodName && (
            <p className="mt-2">
              {order.shippingMethodName}
              {order.shippingAmount > 0 && (
                <> · {formatUsd(order.shippingAmount / 100)}</>
              )}
            </p>
          )}
        </div>
      )}

      {order.notes && (
        <p className="mt-4 rounded-lg border border-line bg-ink px-4 py-3 text-sm text-muted">
          <span className="text-xs font-semibold uppercase tracking-wide text-faint">Notes: </span>
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
            Photo {i + 1} ↗
          </a>
        ))}
      </div>

      <form action={updateOrderStatus} className="mt-5 flex items-center gap-2 border-t border-line pt-4">
        <input type="hidden" name="orderId" value={order.id} />
        <label htmlFor={`status-${order.id}`} className="text-xs text-faint">
          Status
        </label>
        <select
          id={`status-${order.id}`}
          name="status"
          defaultValue={order.status}
          className="rounded-lg border border-line bg-ink px-3 py-2 text-sm text-cream focus:border-accent focus:outline-none"
        >
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {statusLabels[s]}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-full bg-surface-raised px-4 py-2 text-xs font-semibold text-cream transition hover:bg-line"
        >
          Update
        </button>
      </form>
    </article>
  );
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  if (!(await isAdminAuthenticated())) {
    return <LoginForm error={params.error} />;
  }

  let allOrders: Order[] = [];
  let dbError: string | null = null;
  try {
    const db = getDb();
    allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));
  } catch {
    dbError =
      "Could not connect to the database. Check that DATABASE_URL is set and the schema has been pushed (npm run db:push).";
  }

  const active = allOrders.filter((o) => !["delivered", "cancelled"].includes(o.status));
  const done = allOrders.filter((o) => ["delivered", "cancelled"].includes(o.status));

  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-cream">Orders</h1>
        <form action={logout}>
          <button
            type="submit"
            className="rounded-full border border-line px-5 py-2 text-sm font-semibold text-muted transition hover:text-cream"
          >
            Log Out
          </button>
        </form>
      </div>

      {dbError && (
        <p className="mt-8 rounded-xl border border-flame/40 bg-flame/10 px-5 py-4 text-sm text-flame">
          {dbError}
        </p>
      )}

      {!dbError && allOrders.length === 0 && (
        <p className="mt-8 rounded-xl border border-line bg-surface px-5 py-8 text-center text-sm text-muted">
          No orders yet. They&apos;ll appear here the moment someone checks out.
        </p>
      )}

      {active.length > 0 && (
        <div className="mt-8 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
            Active ({active.length})
          </h2>
          {active.map((o) => (
            <OrderCard key={o.id} order={o} />
          ))}
        </div>
      )}

      {done.length > 0 && (
        <div className="mt-10 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
            Completed ({done.length})
          </h2>
          {done.map((o) => (
            <OrderCard key={o.id} order={o} />
          ))}
        </div>
      )}
    </section>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { desc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { orders, type Order } from "@/lib/schema";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { PRINT_FORMATS, formatUsd } from "@/data/pricing";
import { login, logout } from "./actions";
import { statusColors, statusLabels } from "./order-ui";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

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

function OrderRow({ order }: { order: Order }) {
  const format = PRINT_FORMATS.find((f) => f.id === order.formatId);
  return (
    <Link
      href={`/admin/orders/${order.id}`}
      className="block rounded-2xl border border-line bg-surface p-5 shadow-card transition hover:border-accent/40 hover:bg-surface-raised"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-cream">
            {order.styleName}
            {order.expedited && (
              <span className="ml-2 rounded-full bg-flame/20 px-2 py-0.5 text-xs font-semibold text-flame">
                24h
              </span>
            )}
          </h2>
          <p className="mt-0.5 text-xs text-faint">
            {order.email} · {new Date(order.createdAt).toLocaleString("en-GB")}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColors[order.status]}`}
        >
          {statusLabels[order.status]}
        </span>
      </div>
      <p className="mt-3 text-sm text-muted">
        {format?.label ?? order.formatId} · {order.characters} character
        {order.characters > 1 ? "s" : ""} ·{" "}
        <span className="text-cream">
          {formatUsd(order.amountTotal / 100)} {order.currency.toUpperCase()}
        </span>
      </p>
      <p className="mt-2 text-xs font-semibold text-accent">Open order →</p>
    </Link>
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
        <div className="mt-8 space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
            Active ({active.length})
          </h2>
          {active.map((o) => (
            <OrderRow key={o.id} order={o} />
          ))}
        </div>
      )}

      {done.length > 0 && (
        <div className="mt-10 space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
            Completed ({done.length})
          </h2>
          {done.map((o) => (
            <OrderRow key={o.id} order={o} />
          ))}
        </div>
      )}
    </section>
  );
}

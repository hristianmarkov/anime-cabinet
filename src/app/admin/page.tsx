import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { orders, type Order, type OrderStatus } from "@/lib/schema";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { PRINT_FORMATS, formatUsd } from "@/data/pricing";
import { login } from "./actions";
import { AdminShell } from "./AdminShell";
import { FILTER_STATUSES, statusColors, statusLabels } from "./order-ui";

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

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; status?: string }>;
}) {
  const params = await searchParams;
  if (!(await isAdminAuthenticated())) {
    return <LoginForm error={params.error} />;
  }

  const statusFilter = params.status ?? "all";
  const validFilter =
    statusFilter === "all" || FILTER_STATUSES.some((f) => f.value === statusFilter);

  let allOrders: Order[] = [];
  let dbError: string | null = null;
  try {
    const db = getDb();
    if (validFilter && statusFilter !== "all") {
      allOrders = await db
        .select()
        .from(orders)
        .where(eq(orders.status, statusFilter as OrderStatus))
        .orderBy(desc(orders.createdAt));
    } else {
      allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));
    }
  } catch {
    dbError =
      "Could not connect to the database. Check that DATABASE_URL is set and the schema has been pushed (npm run db:push).";
  }

  return (
    <AdminShell active="orders">
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h1 className="font-display text-3xl text-cream">Orders</h1>

        {dbError && (
          <p className="mt-8 rounded-xl border border-flame/40 bg-flame/10 px-5 py-4 text-sm text-flame">
            {dbError}
          </p>
        )}

        {!dbError && (
          <>
            <div className="mt-6 flex flex-wrap gap-2">
              {FILTER_STATUSES.map((f) => {
                const active = (validFilter ? statusFilter : "all") === f.value;
                const href = f.value === "all" ? "/admin" : `/admin?status=${f.value}`;
                return (
                  <Link
                    key={f.value}
                    href={href}
                    className={
                      active
                        ? "rounded-full bg-accent/20 px-3 py-1.5 text-xs font-semibold text-accent"
                        : "rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-muted hover:text-cream"
                    }
                  >
                    {f.label}
                  </Link>
                );
              })}
            </div>

            {allOrders.length === 0 ? (
              <p className="mt-8 rounded-xl border border-line bg-surface px-5 py-8 text-center text-sm text-muted">
                No orders match this filter.
              </p>
            ) : (
              <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-surface shadow-card">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-line text-xs uppercase tracking-wider text-faint">
                      <th className="px-4 py-3 font-semibold">Date</th>
                      <th className="px-4 py-3 font-semibold">Customer</th>
                      <th className="px-4 py-3 font-semibold">Style</th>
                      <th className="px-4 py-3 font-semibold">Format</th>
                      <th className="px-4 py-3 font-semibold">Total</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold" />
                    </tr>
                  </thead>
                  <tbody>
                    {allOrders.map((order) => {
                      const format = PRINT_FORMATS.find((f) => f.id === order.formatId);
                      return (
                        <tr key={order.id} className="border-b border-line/80 last:border-0 hover:bg-surface-raised/50">
                          <td className="px-4 py-3 whitespace-nowrap text-muted">
                            {new Date(order.createdAt).toLocaleString("en-GB", {
                              dateStyle: "short",
                              timeStyle: "short",
                            })}
                          </td>
                          <td className="max-w-[180px] truncate px-4 py-3 text-cream" title={order.email}>
                            {order.email}
                          </td>
                          <td className="px-4 py-3 text-cream">
                            {order.styleName}
                            {order.expedited && (
                              <span className="ml-1 text-xs text-flame">24h</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-muted">{format?.label ?? order.formatId}</td>
                          <td className="px-4 py-3 font-semibold text-cream">
                            {formatUsd(order.amountTotal / 100)}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${statusColors[order.status]}`}
                            >
                              {statusLabels[order.status]}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Link
                              href={`/admin/orders/${order.id}`}
                              className="text-xs font-semibold text-accent hover:underline"
                            >
                              Open →
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </section>
    </AdminShell>
  );
}

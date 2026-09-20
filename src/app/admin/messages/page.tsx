import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { contactInquiries, type ContactInquiry, type ContactInquiryStatus } from "@/lib/schema";
import { AdminShell } from "../AdminShell";

export const metadata: Metadata = {
  title: "Messaging — Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin");
  }

  const params = await searchParams;
  const filter = params.status === "closed" ? "closed" : params.status === "open" ? "open" : "all";

  let inquiries: ContactInquiry[] = [];
  let dbError: string | null = null;

  try {
    const db = getDb();
    if (filter === "all") {
      inquiries = await db.select().from(contactInquiries).orderBy(desc(contactInquiries.createdAt));
    } else {
      inquiries = await db
        .select()
        .from(contactInquiries)
        .where(eq(contactInquiries.status, filter as ContactInquiryStatus))
        .orderBy(desc(contactInquiries.createdAt));
    }
  } catch {
    dbError = "Could not load messages. Run npm run db:push for contact_inquiries tables.";
  }

  const filterLink = (status: string) =>
    status === "all" ? "/admin/messages" : `/admin/messages?status=${status}`;

  return (
    <AdminShell active="messages">
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h1 className="font-display text-3xl text-cream">Messaging</h1>
        <p className="mt-2 text-sm text-muted">Contact form submissions and replies.</p>

        {dbError && (
          <p className="mt-8 rounded-xl border border-flame/40 bg-flame/10 px-5 py-4 text-sm text-flame">
            {dbError}
          </p>
        )}

        {!dbError && (
          <>
            <div className="mt-6 flex flex-wrap gap-2">
              {[
                { value: "all", label: "All" },
                { value: "open", label: "Open" },
                { value: "closed", label: "Closed" },
              ].map((f) => (
                <Link
                  key={f.value}
                  href={filterLink(f.value)}
                  className={
                    filter === f.value
                      ? "rounded-full bg-accent/20 px-3 py-1.5 text-xs font-semibold text-accent"
                      : "rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-muted hover:text-cream"
                  }
                >
                  {f.label}
                </Link>
              ))}
            </div>

            {inquiries.length === 0 ? (
              <p className="mt-8 rounded-xl border border-line bg-surface px-5 py-8 text-center text-sm text-muted">
                No contact messages yet.
              </p>
            ) : (
              <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-surface shadow-card">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-line text-xs uppercase tracking-wider text-faint">
                      <th className="px-4 py-3 font-semibold">Date</th>
                      <th className="px-4 py-3 font-semibold">Name</th>
                      <th className="px-4 py-3 font-semibold">Email</th>
                      <th className="px-4 py-3 font-semibold">Subject</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold" />
                    </tr>
                  </thead>
                  <tbody>
                    {inquiries.map((row) => (
                      <tr
                        key={row.id}
                        className="border-b border-line/80 last:border-0 hover:bg-surface-raised/50"
                      >
                        <td className="whitespace-nowrap px-4 py-3 text-muted">
                          {new Date(row.createdAt).toLocaleString("en-GB", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </td>
                        <td className="px-4 py-3 text-cream">{row.name}</td>
                        <td className="max-w-[160px] truncate px-4 py-3 text-muted" title={row.email}>
                          {row.email}
                        </td>
                        <td className="px-4 py-3 text-cream">{row.subject}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
                              row.status === "open"
                                ? "bg-flame/20 text-flame"
                                : "bg-faint/20 text-muted"
                            }`}
                          >
                            {row.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/admin/messages/${row.id}`}
                            className="text-xs font-semibold text-accent hover:underline"
                          >
                            Open →
                          </Link>
                        </td>
                      </tr>
                    ))}
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

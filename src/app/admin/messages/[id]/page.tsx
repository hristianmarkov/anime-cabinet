import type { Metadata } from "next";
import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { contactInquiries, contactMessages, type ContactMessage } from "@/lib/schema";
import { AdminShell } from "../../AdminShell";
import { closeInquiry, logInboundMessage } from "../../messageActions";
import { ReplyComposer } from "../ReplyComposer";

export const metadata: Metadata = {
  title: "Conversation — Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminMessageDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sent?: string }>;
}) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin");
  }

  const { id } = await params;
  const query = await searchParams;

  let inquiry = null;
  let messages: ContactMessage[] = [];
  let dbError: string | null = null;

  try {
    const db = getDb();
    const [row] = await db.select().from(contactInquiries).where(eq(contactInquiries.id, id)).limit(1);
    inquiry = row ?? null;
    if (inquiry) {
      messages = await db
        .select()
        .from(contactMessages)
        .where(eq(contactMessages.inquiryId, id))
        .orderBy(asc(contactMessages.createdAt));
    }
  } catch {
    dbError = "Could not load conversation.";
  }

  if (!dbError && !inquiry) notFound();

  if (!inquiry) {
    return (
      <AdminShell active="messages">
        <p className="p-12 text-flame">{dbError}</p>
      </AdminShell>
    );
  }

  return (
    <AdminShell active="messages">
      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Link href="/admin/messages" className="text-sm font-semibold text-accent hover:underline">
          ← All messages
        </Link>
        <header className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl text-cream">{inquiry.subject}</h1>
            <p className="mt-1 text-sm text-muted">
              {inquiry.name} ·{" "}
              <a href={`mailto:${inquiry.email}`} className="text-accent hover:underline">
                {inquiry.email}
              </a>
            </p>
            {inquiry.linkedOrderId && (
              <p className="mt-1 text-xs text-faint">Order ref: {inquiry.linkedOrderId}</p>
            )}
          </div>
          {inquiry.status === "open" && (
            <form action={closeInquiry}>
              <input type="hidden" name="inquiryId" value={inquiry.id} />
              <button
                type="submit"
                className="rounded-full border border-line px-4 py-2 text-xs font-semibold text-muted hover:text-cream"
              >
                Mark closed
              </button>
            </form>
          )}
        </header>

        {query.sent === "1" && (
          <p className="mt-6 rounded-xl border border-[#4ade80]/40 bg-[#4ade80]/10 px-4 py-3 text-sm text-[#4ade80]">
            Reply sent and saved.
          </p>
        )}

        <div className="mt-8 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`rounded-2xl border p-4 ${
                msg.direction === "inbound"
                  ? "border-line bg-surface"
                  : "border-accent/30 bg-accent/5"
              }`}
            >
              <p className="text-xs font-semibold uppercase text-faint">
                {msg.direction === "inbound" ? "Customer" : "You"} ·{" "}
                {new Date(msg.createdAt).toLocaleString("en-GB")}
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-cream">{msg.body}</p>
            </div>
          ))}
        </div>

        <form action={logInboundMessage} className="mt-6 rounded-2xl border border-line bg-surface p-4">
          <input type="hidden" name="inquiryId" value={inquiry.id} />
          <label className="text-xs font-semibold text-faint">Log inbound email</label>
          <textarea
            name="body"
            rows={3}
            className="mt-2 w-full rounded-xl border border-line bg-ink px-4 py-3 text-sm text-cream"
            placeholder="Paste a reply they sent by email…"
          />
          <button
            type="submit"
            className="mt-2 rounded-full border border-line px-4 py-2 text-xs font-semibold text-muted hover:text-cream"
          >
            Add to thread
          </button>
        </form>

        {inquiry.status === "open" && <ReplyComposer inquiryId={inquiry.id} />}
      </section>
    </AdminShell>
  );
}

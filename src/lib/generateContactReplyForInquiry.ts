import { asc, eq } from "drizzle-orm";
import { draftContactReplyWithOpenAI } from "@/lib/contactReplyOpenAi";
import { getDb } from "@/lib/db";
import { contactInquiries, contactMessages } from "@/lib/schema";

export type GenerateContactReplyResult =
  | { ok: true; draft: string }
  | { ok: false; error: string; status: number };

export async function generateContactReplyForInquiry(
  inquiryId: string,
  adminNotes?: string
): Promise<GenerateContactReplyResult> {
  const trimmed = inquiryId.trim();
  if (!trimmed) {
    return { ok: false, error: "inquiryId required", status: 400 };
  }

  const db = getDb();
  const [inquiry] = await db
    .select()
    .from(contactInquiries)
    .where(eq(contactInquiries.id, trimmed))
    .limit(1);
  if (!inquiry) {
    return { ok: false, error: "Inquiry not found", status: 404 };
  }

  const messages = await db
    .select()
    .from(contactMessages)
    .where(eq(contactMessages.inquiryId, trimmed))
    .orderBy(asc(contactMessages.createdAt));

  try {
    const draft = await draftContactReplyWithOpenAI({
      customerName: inquiry.name,
      subject: inquiry.subject,
      thread: messages.map((m) => ({
        direction: m.direction as "inbound" | "outbound",
        body: m.body,
      })),
      adminNotes,
    });
    return { ok: true, draft };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed";
    return { ok: false, error: message, status: 500 };
  }
}

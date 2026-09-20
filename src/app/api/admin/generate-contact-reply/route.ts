import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { getDb } from "@/lib/db";
import { draftContactReplyWithOpenAI } from "@/lib/contactReplyOpenAi";
import { contactInquiries, contactMessages } from "@/lib/schema";

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { inquiryId?: string; adminNotes?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const inquiryId = body.inquiryId;
  if (!inquiryId) {
    return NextResponse.json({ error: "inquiryId required" }, { status: 400 });
  }

  const db = getDb();
  const [inquiry] = await db
    .select()
    .from(contactInquiries)
    .where(eq(contactInquiries.id, inquiryId))
    .limit(1);
  if (!inquiry) {
    return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
  }

  const messages = await db
    .select()
    .from(contactMessages)
    .where(eq(contactMessages.inquiryId, inquiryId))
    .orderBy(asc(contactMessages.createdAt));

  try {
    const draft = await draftContactReplyWithOpenAI({
      customerName: inquiry.name,
      subject: inquiry.subject,
      thread: messages.map((m) => ({ direction: m.direction as "inbound" | "outbound", body: m.body })),
      adminNotes: body.adminNotes,
    });
    return NextResponse.json({ draft });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

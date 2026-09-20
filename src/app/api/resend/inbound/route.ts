import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { processInboundEmail } from "@/lib/inboundEmail";
import { fetchReceivedEmail } from "@/lib/resendReceivedEmail";

function verifySvixSignature(rawBody: string, headers: Headers): boolean {
  const secret = process.env.RESEND_WEBHOOK_SECRET?.trim();
  if (!secret) return process.env.NODE_ENV !== "production";

  const id = headers.get("svix-id");
  const timestamp = headers.get("svix-timestamp");
  const signature = headers.get("svix-signature");
  if (!id || !timestamp || !signature) return false;

  try {
    const signed = `${id}.${timestamp}.${rawBody}`;
    const key = secret.startsWith("whsec_")
      ? Buffer.from(secret.slice(6), "base64")
      : Buffer.from(secret, "utf8");
    const expected = createHmac("sha256", key).update(signed).digest("base64");
    const parts = signature.split(" ");
    return parts.some((part) => {
      const [, sig] = part.split(",");
      if (!sig) return false;
      const a = Buffer.from(sig);
      const b = Buffer.from(expected);
      return a.length === b.length && timingSafeEqual(a, b);
    });
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const rawBody = await request.text();

  if (!verifySvixSignature(rawBody, request.headers)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: { type?: string; data?: { email_id?: string; from?: string; to?: string[]; subject?: string } };
  try {
    event = JSON.parse(rawBody) as typeof event;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (event.type !== "email.received" || !event.data?.email_id) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  try {
    const email = await fetchReceivedEmail(event.data.email_id);
    const result = await processInboundEmail({
      to: email.to.length ? email.to : (event.data.to ?? []),
      from: email.from || event.data.from || "",
      subject: email.subject || event.data.subject || "",
      text: email.text,
      html: email.html,
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("Inbound email processing failed:", err);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}

export interface ReceivedEmailContent {
  text: string | null;
  html: string | null;
  subject: string;
  from: string;
  to: string[];
}

export async function fetchReceivedEmail(emailId: string): Promise<ReceivedEmailContent> {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set");

  const res = await fetch(`https://api.resend.com/emails/receiving/${encodeURIComponent(emailId)}`, {
    headers: { Authorization: `Bearer ${key}` },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend receiving get failed: ${err.slice(0, 400)}`);
  }

  const data = (await res.json()) as {
    subject?: string;
    from?: string;
    to?: string[];
    text?: string | null;
    html?: string | null;
  };

  return {
    subject: data.subject ?? "(no subject)",
    from: data.from ?? "",
    to: Array.isArray(data.to) ? data.to : [],
    text: data.text ?? null,
    html: data.html ?? null,
  };
}

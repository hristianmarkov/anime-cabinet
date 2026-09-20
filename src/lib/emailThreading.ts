import { inboundEmailDomain } from "@/lib/emailReplyRouting";

export function normalizeRfcMessageId(id: string): string {
  const trimmed = id.trim();
  if (!trimmed) return trimmed;
  if (trimmed.startsWith("<") && trimmed.endsWith(">")) return trimmed;
  return `<${trimmed.replace(/^<|>$/g, "")}>`;
}

/** Stable Message-ID for outbound mail (Resend accepts Message-ID in headers). */
export function buildRfcMessageId(localPart: string): string {
  const domain = inboundEmailDomain();
  const safe = localPart.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 120);
  return `<${safe}@${domain}>`;
}

export function replyEmailSubject(threadSubject: string): string {
  const base = threadSubject.replace(/^(Re:\s*)+/i, "").trim();
  return `Re: ${base}`;
}

export function headerValue(
  headers: Record<string, string> | undefined,
  name: string
): string | undefined {
  if (!headers) return undefined;
  const key = Object.keys(headers).find((k) => k.toLowerCase() === name.toLowerCase());
  const value = key ? headers[key]?.trim() : undefined;
  return value || undefined;
}

export function threadReplyHeaders(
  lastRfcMessageId: string | null | undefined,
  emailReferences: string | null | undefined
): Record<string, string> | undefined {
  if (!lastRfcMessageId?.trim()) return undefined;
  const inReplyTo = normalizeRfcMessageId(lastRfcMessageId);
  const prior = emailReferences?.trim();
  const references = prior && prior.includes(inReplyTo) ? prior : prior ? `${prior} ${inReplyTo}` : inReplyTo;
  return {
    "In-Reply-To": inReplyTo,
    References: references,
  };
}

export function appendReferenceChain(
  emailReferences: string | null | undefined,
  messageId: string
): string {
  const norm = normalizeRfcMessageId(messageId);
  const prior = emailReferences?.trim();
  if (!prior) return norm;
  if (prior.includes(norm)) return prior;
  return `${prior} ${norm}`;
}

export function contactAckSubject(inquirySubject: string): string {
  return `We received your message — ${inquirySubject}`;
}

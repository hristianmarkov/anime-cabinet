import { site } from "@/data/site";

const INBOUND_PREFIX_ORDER = "orders+";
const INBOUND_PREFIX_CONTACT = "contact+";

/** Subdomain where Resend receives mail (never use ADMIN_EMAIL for customer Reply-To). */
export function inboundEmailDomain(): string {
  const configured = process.env.EMAIL_INBOUND_DOMAIN?.trim();
  if (configured) return configured;
  return site.domain;
}

export function orderReplyToAddress(trackToken: string): string {
  return `${INBOUND_PREFIX_ORDER}${trackToken}@${inboundEmailDomain()}`;
}

export function contactReplyToAddress(inquiryId: string): string {
  return `${INBOUND_PREFIX_CONTACT}${inquiryId}@${inboundEmailDomain()}`;
}

export function parseInboundRecipient(address: string): { kind: "order"; trackToken: string } | { kind: "contact"; inquiryId: string } | null {
  const lower = address.toLowerCase().trim();
  const at = lower.indexOf("@");
  if (at <= 0) return null;
  const local = lower.slice(0, at);

  if (local.startsWith(INBOUND_PREFIX_ORDER)) {
    const trackToken = local.slice(INBOUND_PREFIX_ORDER.length);
    if (trackToken.length >= 8) return { kind: "order", trackToken };
  }
  if (local.startsWith(INBOUND_PREFIX_CONTACT)) {
    const inquiryId = local.slice(INBOUND_PREFIX_CONTACT.length);
    if (inquiryId.length >= 8) return { kind: "contact", inquiryId };
  }
  return null;
}

export function extractRoutingFromRecipients(to: string[]): ReturnType<typeof parseInboundRecipient> {
  for (const addr of to) {
    const match = addr.match(/<?([^<>@\s]+@[^>\s]+)>?/);
    const email = match ? match[1] : addr;
    const parsed = parseInboundRecipient(email);
    if (parsed) return parsed;
  }
  return null;
}

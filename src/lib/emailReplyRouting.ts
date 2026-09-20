import { site } from "@/data/site";

const INBOUND_PREFIX_ORDER = "orders+";
const INBOUND_PREFIX_CONTACT = "contact+";

export function inboundEmailDomain(): string | null {
  const domain = process.env.EMAIL_INBOUND_DOMAIN?.trim();
  return domain && domain.length > 0 ? domain : null;
}

export function orderReplyToAddress(trackToken: string): string {
  const domain = inboundEmailDomain();
  if (domain) return `${INBOUND_PREFIX_ORDER}${trackToken}@${domain}`;
  return process.env.ADMIN_EMAIL ?? site.email;
}

export function contactReplyToAddress(inquiryId: string): string {
  const domain = inboundEmailDomain();
  if (domain) return `${INBOUND_PREFIX_CONTACT}${inquiryId}@${domain}`;
  return process.env.ADMIN_EMAIL ?? site.email;
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

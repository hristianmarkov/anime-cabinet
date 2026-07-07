import { Resend } from "resend";
import type { Order } from "./schema";
import { PRINT_FORMATS } from "@/data/pricing";
import { site } from "@/data/site";

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

const FROM = process.env.EMAIL_FROM ?? `Anime Cabinet <orders@${site.domain}>`;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? site.email;

function orderSummaryHtml(order: Order): string {
  const format = PRINT_FORMATS.find((f) => f.id === order.formatId);
  const total = (order.amountTotal / 100).toFixed(2);
  const currency = order.currency.toUpperCase();
  const shipping = order.shippingAddress;
  const shippingRow =
    order.formatId !== "digital" && shipping
      ? `<tr><td style="padding:6px 0;color:#777">Ship to</td><td style="padding:6px 0">${shipping.firstName} ${shipping.lastName}, ${shipping.city}, ${shipping.country}</td></tr>
         ${order.shippingMethodName ? `<tr><td style="padding:6px 0;color:#777">Shipping</td><td style="padding:6px 0">${order.shippingMethodName}</td></tr>` : ""}`
      : "";
  return `
    <table style="border-collapse:collapse;width:100%;max-width:520px;font-family:Arial,sans-serif;font-size:14px;color:#222">
      <tr><td style="padding:6px 0;color:#777">Order ID</td><td style="padding:6px 0"><strong>${order.id}</strong></td></tr>
      <tr><td style="padding:6px 0;color:#777">Style</td><td style="padding:6px 0">${order.styleName}</td></tr>
      <tr><td style="padding:6px 0;color:#777">Characters</td><td style="padding:6px 0">${order.characters}</td></tr>
      <tr><td style="padding:6px 0;color:#777">Format</td><td style="padding:6px 0">${format?.label ?? order.formatId}</td></tr>
      <tr><td style="padding:6px 0;color:#777">Background</td><td style="padding:6px 0">${order.background}</td></tr>
      ${order.expedited ? `<tr><td style="padding:6px 0;color:#777">Delivery</td><td style="padding:6px 0">24-hour expedited</td></tr>` : ""}
      ${shippingRow}
      <tr><td style="padding:6px 0;color:#777">Total</td><td style="padding:6px 0"><strong>${total} ${currency}</strong></td></tr>
    </table>`;
}

export async function sendOrderConfirmation(order: Order): Promise<void> {
  const resend = getResend();
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping customer confirmation email");
    return;
  }
  await resend.emails.send({
    from: FROM,
    to: order.email,
    subject: `Your ${order.styleName} is in the queue! 🎨`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#222">
        <h1 style="font-size:22px">Thanks for your order!</h1>
        <p>Our artists have received your photos and your <strong>${order.styleName}</strong> is officially in the drawing queue.</p>
        <p><strong>What happens next:</strong></p>
        <ol style="line-height:1.7">
          <li>An artist reviews your photos and notes.</li>
          <li>Within ${site.deliveryHours} hours you'll receive a preview at this email address.${order.expedited ? " (Priority order — 24h turnaround)" : ""}</li>
          <li>Request as many free revisions as you like.</li>
          <li>Once you approve it, we send the final high-resolution file${order.formatId !== "digital" ? " and ship your print" : ""}.</li>
        </ol>
        ${orderSummaryHtml(order)}
        <p style="margin-top:24px">Questions or extra details for the artist? Just reply to this email and include your order ID.</p>
        <p style="color:#777">— The ${site.name} team</p>
      </div>`,
  });
}

export async function sendNewOrderAlert(order: Order): Promise<void> {
  const resend = getResend();
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping admin alert email");
    return;
  }
  const photosHtml = order.photoUrls
    .map((u, i) => `<li><a href="${u}">Photo ${i + 1}</a></li>`)
    .join("");
  await resend.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `New paid order: ${order.styleName} (${(order.amountTotal / 100).toFixed(2)} ${order.currency.toUpperCase()})${order.expedited ? " [EXPEDITED]" : ""}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#222">
        <h1 style="font-size:20px">New paid order</h1>
        ${orderSummaryHtml(order)}
        <p><strong>Customer:</strong> ${order.email}</p>
        <p><strong>Notes:</strong> ${order.notes || "(none)"}</p>
        <p><strong>Photos:</strong></p>
        <ul>${photosHtml}</ul>
        <p><a href="${site.url}/admin">Open the admin dashboard</a></p>
      </div>`,
  });
}

import { Resend } from "resend";
import type { Order, OrderDelivery } from "./schema";
import { PRINT_FORMATS } from "@/data/pricing";
import { site } from "@/data/site";
import { isDigitalOrder, revisionWindowHours } from "@/lib/orderDeliveryRules";

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
    replyTo: ADMIN_EMAIL,
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
        <p><a href="${site.url}/admin/orders/${order.id}">Open this order in admin</a></p>
      </div>`,
  });
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function deliveryImagesHtml(urls: string[]): string {
  if (urls.length === 0) return "";
  const items = urls
    .map(
      (url, i) =>
        `<li style="margin:8px 0"><a href="${url}" style="color:#c44">View artwork ${urls.length > 1 ? i + 1 : ""}</a></li>`
    )
    .join("");
  return `<ul style="padding-left:18px;line-height:1.6">${items}</ul>`;
}

function formatDeadline(deadline: Date): string {
  return deadline.toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  });
}

export async function sendDeliveryPreviewEmail(
  order: Order,
  delivery: OrderDelivery
): Promise<void> {
  const resend = getResend();
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping delivery email");
    return;
  }

  const digital = isDigitalOrder(order);
  const hours = delivery.revisionHours;
  const deadline = delivery.revisionDeadline
    ? formatDeadline(new Date(delivery.revisionDeadline))
    : `${hours} hours from now`;
  const versionLabel =
    delivery.versionNumber > 1 ? ` (revision ${delivery.versionNumber})` : "";
  const commentBlock = delivery.comment.trim()
    ? `<p style="margin-top:16px"><strong>Note from our artist:</strong><br>${escapeHtml(delivery.comment).replace(/\n/g, "<br>")}</p>`
    : "";

  const afterWindow = digital
    ? `<p>If we don&apos;t hear from you within <strong>${hours} hours</strong>, we&apos;ll treat the artwork as approved and consider your digital order complete.</p>`
    : `<p>If we don&apos;t hear from you within <strong>${hours} hours</strong>, we&apos;ll treat the artwork as approved and move your print into production for shipping.</p>`;

  await resend.emails.send({
    from: FROM,
    to: order.email,
    replyTo: ADMIN_EMAIL,
    subject: `Your ${order.styleName} artwork is ready to review${versionLabel}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#222">
        <h1 style="font-size:22px">Your portrait is ready</h1>
        <p>We&apos;ve finished transforming your photo into a custom <strong>${escapeHtml(order.styleName)}</strong> artwork. Open the link${delivery.imageUrls.length > 1 ? "s" : ""} below to view your ${digital ? "preview" : "approved-for-print preview"}.</p>
        ${deliveryImagesHtml(delivery.imageUrls)}
        ${commentBlock}
        <p><strong>Need changes?</strong> Reply to this email within <strong>${hours} hours</strong> (by ${deadline} UTC) and tell us exactly what to adjust. Include your order ID: <strong>${order.id}</strong>.</p>
        ${afterWindow}
        ${orderSummaryHtml(order)}
        <p style="color:#777;margin-top:24px">— The ${site.name} team</p>
      </div>`,
  });
}

export async function sendRevisionReminderEmail(
  order: Order,
  delivery: OrderDelivery,
  which: 1 | 2
): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  const digital = isDigitalOrder(order);
  const deadline = delivery.revisionDeadline
    ? formatDeadline(new Date(delivery.revisionDeadline))
    : "soon";
  const hoursLeft = Math.max(
    0,
    Math.round(
      (new Date(delivery.revisionDeadline!).getTime() - Date.now()) / (60 * 60 * 1000)
    )
  );

  const urgency =
    which === 1
      ? "Friendly reminder — your artwork is waiting for feedback."
      : "Last reminder — your revision window is closing soon.";

  await resend.emails.send({
    from: FROM,
    to: order.email,
    replyTo: ADMIN_EMAIL,
    subject:
      which === 1
        ? `Reminder: review your ${order.styleName} artwork`
        : `Final reminder: ${hoursLeft}h left to request changes`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#222">
        <h1 style="font-size:20px">${urgency}</h1>
        <p>We sent your custom portrait for order <strong>${order.id}</strong>. If you&apos;d like any changes, reply to this email before <strong>${deadline} UTC</strong>.</p>
        ${deliveryImagesHtml(delivery.imageUrls)}
        <p>${
          digital
            ? `If we don&apos;t hear from you, we'll mark your digital order complete after the ${delivery.revisionHours}-hour review window.`
            : `If we don&apos;t hear from you, we'll approve the artwork and prepare your print for shipment after the ${delivery.revisionHours}-hour review window.`
        }</p>
        <p style="color:#777">— The ${site.name} team</p>
      </div>`,
  });
}

export async function sendDeliveryAutoCompletedEmail(
  order: Order,
  delivery: OrderDelivery
): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  const digital = isDigitalOrder(order);
  const images = deliveryImagesHtml(delivery.imageUrls);

  await resend.emails.send({
    from: FROM,
    to: order.email,
    replyTo: ADMIN_EMAIL,
    subject: digital
      ? `Order complete — your ${order.styleName} files`
      : `Artwork approved — preparing your ${order.styleName} print`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#222">
        <h1 style="font-size:20px">${digital ? "Your order is complete" : "We're preparing your print"}</h1>
        <p>${
          digital
            ? `The ${revisionWindowHours(order)}-hour review window has passed with no revision requests, so your digital order is now complete.`
            : `The ${revisionWindowHours(order)}-hour review window has passed with no revision requests. Your artwork is approved and we're moving your print into production for shipment.`
        }</p>
        ${images}
        <p>If you still need help, reply to this email — we'll do our best to assist.</p>
        ${orderSummaryHtml(order)}
        <p style="color:#777">— The ${site.name} team</p>
      </div>`,
  });
}

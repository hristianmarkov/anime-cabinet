import { Resend } from "resend";
import { deliveryPreviewEmailCopy } from "@/lib/deliveryPreviewEmailCopy";
import type { Order, OrderDelivery, OrderFinalFile } from "./schema";
import { PRINT_FORMATS } from "@/data/pricing";
import { site } from "@/data/site";
import { isDigitalOrder, revisionWindowHours } from "@/lib/orderDeliveryRules";
import { orderReplyToAddress } from "@/lib/emailReplyRouting";
import { trackOrderUrl } from "@/lib/trackOrderUrl";

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

const FROM = process.env.EMAIL_FROM ?? `Anime Cabinet <orders@${site.domain}>`;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? site.email;

function customerReplyTo(order: Order): string {
  return orderReplyToAddress(order.trackToken);
}

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
  const trackUrl = trackOrderUrl(order);
  await resend.emails.send({
    from: FROM,
    to: order.email,
    replyTo: customerReplyTo(order),
    subject: `Your ${order.styleName} is in the queue! 🎨`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#222">
        <h1 style="font-size:22px">Thanks for your order!</h1>
        <p>Our artists have received your photos and your <strong>${order.styleName}</strong> is officially in the drawing queue.</p>
        <p style="margin:20px 0;padding:14px 16px;background:#f5f5f5;border-radius:8px">
          <strong>Track your order anytime:</strong><br>
          <a href="${trackUrl}" style="color:#c44">${trackUrl}</a>
        </p>
        <p><strong>What happens next:</strong></p>
        <ol style="line-height:1.7">
          <li>Your order has been placed and will be assigned to an artist shortly.</li>
          <li>Within ${order.expedited ? site.expeditedHours : site.deliveryHours} hours of placing your order, you&apos;ll receive a preview.${order.expedited ? " (Priority order — 24h turnaround)" : ""}</li>
          <li>Request as many free revisions as you like.</li>
          <li>Once you approve it, we send the final high-resolution file${order.formatId !== "digital" ? " and ship your print" : ""}.</li>
        </ol>
        ${orderSummaryHtml(order)}
        <p style="margin-top:24px">Questions or extra details? Reply to this email or use the track link above — we'll see it in one thread.</p>
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

function trackOrderButton(order: Order, label = "Track your order"): string {
  return `<p style="margin:20px 0"><a href="${trackOrderUrl(order)}" style="display:inline-block;padding:12px 18px;border-radius:999px;background:#cc4444;color:#fff;text-decoration:none;font-weight:bold">${label}</a></p>`;
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
  const emailCopy = deliveryPreviewEmailCopy(order.styleName, delivery.versionNumber);
  const commentBlock = delivery.comment.trim()
    ? `<p style="margin-top:16px"><strong>Note from our artist:</strong><br>${escapeHtml(delivery.comment).replace(/\n/g, "<br>")}</p>`
    : "";

  const afterWindow = digital
    ? `<p>If we don&apos;t hear from you within <strong>${hours} hours</strong>, we&apos;ll treat the artwork as approved and prepare your final high-resolution file.</p>`
    : `<p>If we don&apos;t hear from you within <strong>${hours} hours</strong>, we&apos;ll treat the artwork as approved, prepare your final file, and then move your print into production.</p>`;

  await resend.emails.send({
    from: FROM,
    to: order.email,
    replyTo: customerReplyTo(order),
    subject: emailCopy.subject,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#222">
        <h1 style="font-size:22px">${emailCopy.heading}</h1>
        <p>${escapeHtml(emailCopy.introduction)}</p>
        ${trackOrderButton(order, "Review your artwork")}
        ${commentBlock}
        <p><strong>Need changes?</strong> Add your comments on the Track My Order page within <strong>${hours} hours</strong>. Please do not reply by email with revision notes.</p>
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
    replyTo: customerReplyTo(order),
    subject:
      which === 1
        ? `Reminder: review your ${order.styleName} artwork`
        : `Final reminder: ${hoursLeft}h left to request changes`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#222">
        <h1 style="font-size:20px">${urgency}</h1>
        <p>Your custom portrait for order <strong>${order.id}</strong> is waiting for review. If you&apos;d like any changes, add them on your secure order page before <strong>${deadline} UTC</strong>.</p>
        ${trackOrderButton(order, "Review your artwork")}
        <p>${
          digital
            ? `If we don&apos;t hear from you, we'll approve the artwork and prepare your final high-resolution file after the ${delivery.revisionHours}-hour review window.`
            : `If we don&apos;t hear from you, we'll approve the artwork and prepare its final file before print production after the ${delivery.revisionHours}-hour review window.`
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
  await resend.emails.send({
    from: FROM,
    to: order.email,
    replyTo: customerReplyTo(order),
    subject: digital
      ? `Artwork approved — preparing your ${order.styleName} file`
      : `Artwork approved — preparing your final ${order.styleName} file`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#222">
        <h1 style="font-size:20px">We're preparing your final file</h1>
        <p>${
          digital
            ? `The ${revisionWindowHours(order)}-hour review window has passed with no revision requests. Your artwork is approved; we'll send the high-resolution download separately when it is ready.`
            : `The ${revisionWindowHours(order)}-hour review window has passed with no revision requests. Your artwork is approved; we'll send the final file before moving the print into production.`
        }</p>
        ${trackOrderButton(order)}
        <p>If you still need help, use the message form on your order page.</p>
        ${orderSummaryHtml(order)}
        <p style="color:#777">— The ${site.name} team</p>
      </div>`,
  });
}

function emailShell(title: string, bodyHtml: string, order: Order): string {
  return `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#222">
      <h1 style="font-size:20px">${title}</h1>
      ${bodyHtml}
      ${orderSummaryHtml(order)}
      <p style="margin-top:20px">Questions? Reply to this email and include order ID <strong>${order.id}</strong>.</p>
      <p style="color:#777">— The ${site.name} team</p>
    </div>`;
}

export async function sendProductionStartedEmail(order: Order): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  const expedited = order.expedited
    ? `<p>Your order is <strong>24-hour expedited</strong> — we&apos;re prioritising it in the queue.</p>`
    : `<p>Your first preview will be completed within <strong>${site.deliveryHours} hours of when your order was placed</strong>. We&apos;ll email you as soon as it is ready to review.</p>`;

  await resend.emails.send({
    from: FROM,
    to: order.email,
    replyTo: customerReplyTo(order),
    subject: `We've started your ${order.styleName} portrait`,
    html: emailShell(
      "Your order is in production",
      `<p>Our artists have picked up your <strong>${escapeHtml(order.styleName)}</strong> order and are working on your custom portrait now.</p>
       ${expedited}
       <p>You don&apos;t need to do anything — sit tight and watch for our preview email.</p>`,
      order
    ),
  });
}

export async function sendRevisionWorkStartedEmail(order: Order): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  await resend.emails.send({
    from: FROM,
    to: order.email,
    replyTo: customerReplyTo(order),
    subject: `We're revising your ${order.styleName} artwork`,
    html: emailShell(
      "Revision in progress",
      `<p>Thanks for your feedback — we&apos;ve sent your notes to the artist and your portrait is back in production.</p>
       <p>We&apos;ll email a new preview when the updated version is ready (usually within ${order.expedited ? site.expeditedHours : site.deliveryHours} hours).</p>`,
      order
    ),
  });
}

export async function sendPrintArtworkApprovedEmail(
  order: Order,
  delivery: OrderDelivery | null
): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  await resend.emails.send({
    from: FROM,
    to: order.email,
    replyTo: customerReplyTo(order),
    subject: `Artwork approved — printing your ${order.styleName}`,
    html: emailShell(
      "Your print is next",
      `<p>Your artwork for <strong>${escapeHtml(order.styleName)}</strong> is approved and locked in for printing.</p>
       ${trackOrderButton(order)}
       <p>We&apos;ll email you again when your order ships${order.shippingMethodName ? ` via ${escapeHtml(order.shippingMethodName)}` : ""}.</p>`,
      order
    ),
  });
}

export async function sendPrintProductionEmail(order: Order): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  await resend.emails.send({
    from: FROM,
    to: order.email,
    replyTo: customerReplyTo(order),
    subject: `Your ${order.styleName} print is in production`,
    html: emailShell(
      "Print production started",
      `<p>Your custom print is now being produced at our print partner. Quality checks and packing come next, then shipping to your address.</p>
       ${order.gelatoOrderId ? `<p style="font-size:13px;color:#666">Production reference: ${escapeHtml(order.gelatoOrderId)}</p>` : ""}`,
      order
    ),
  });
}

export async function sendShippedEmail(order: Order): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  const trackingBlock =
    order.trackingUrl && order.trackingNumber
      ? `<p><strong>Tracking:</strong> ${escapeHtml(order.trackingNumber)}<br><a href="${order.trackingUrl}">Track your package</a></p>`
      : order.trackingUrl
        ? `<p><a href="${order.trackingUrl}">Track your package</a></p>`
        : order.trackingNumber
          ? `<p><strong>Tracking number:</strong> ${escapeHtml(order.trackingNumber)}</p>`
          : `<p>Tracking details will follow if your carrier provides them separately.</p>`;

  const shipping = order.shippingAddress;
  const shipLine =
    shipping &&
    `<p>Heading to: ${escapeHtml(shipping.firstName)} ${escapeHtml(shipping.lastName)}, ${escapeHtml(shipping.city)}, ${escapeHtml(shipping.country)}</p>`;

  await resend.emails.send({
    from: FROM,
    to: order.email,
    replyTo: customerReplyTo(order),
    subject: `Your ${order.styleName} order has shipped`,
    html: emailShell(
      "It's on the way",
      `<p>Great news — your <strong>${escapeHtml(order.styleName)}</strong> print has left our facility and is on its way to you.</p>
       ${shipLine ?? ""}
       ${trackingBlock}
       <p>Delivery times depend on your carrier${order.shippingMethodName ? ` (${escapeHtml(order.shippingMethodName)})` : ""}. If anything looks wrong when it arrives, reply to this email and we&apos;ll help.</p>`,
      order
    ),
  });
}

export async function sendOrderDeliveredEmail(
  order: Order,
  delivery: OrderDelivery | null,
  reason: "approved" | "complete" | "delivered"
): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  const digital = isDigitalOrder(order);
  const titles: Record<typeof reason, string> = {
    approved: digital ? "You're all set — enjoy your portrait" : "Order complete",
    complete: "Your order is complete",
    delivered: "Delivered — enjoy your print",
  };

  const intros: Record<typeof reason, string> = {
    approved: `<p>Thanks for approving your artwork! ${digital ? "Your digital order is complete." : "We'll update you when your print ships."}</p>`,
    complete: `<p>Your ${escapeHtml(order.styleName)} order is complete. Thanks for trusting ${site.name} with your portrait.</p>`,
    delivered: `<p>Your ${escapeHtml(order.styleName)} print should now be with you (or very close). We hope you love it on your wall.</p>`,
  };

  await resend.emails.send({
    from: FROM,
    to: order.email,
    replyTo: customerReplyTo(order),
    subject:
      reason === "delivered"
        ? `Delivered — your ${order.styleName} print`
        : `Order complete — your ${order.styleName}`,
    html: emailShell(
      titles[reason],
      `${intros[reason]}
       ${digital && delivery ? trackOrderButton(order, "View your order") : ""}
       <p>If you&apos;re happy with the result, we&apos;d love a photo tag on Instagram — it means a lot to our artists.</p>`,
      order
    ),
  });
}

export async function sendFinalFileEmail(
  order: Order,
  finalFile: OrderFinalFile
): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  const next = isDigitalOrder(order)
    ? "Your digital order is now complete."
    : "Your high-resolution file is ready, and your print will now move into production.";
  await resend.emails.send({
    from: FROM,
    to: order.email,
    replyTo: customerReplyTo(order),
    subject: `Your final ${order.styleName} file is ready`,
    html: emailShell(
      "Your high-resolution artwork is ready",
      `<p>${next}</p>
       <p>Your high-resolution download is available securely from your Track My Order page.</p>
       ${trackOrderButton(order, "Download your final artwork")}
       <p style="font-size:13px;color:#666">Please save a copy of the file to your own device.</p>`,
      order
    ),
  });
}

export async function sendOrderCancelledEmail(order: Order, note?: string): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  const noteBlock = note?.trim()
    ? `<p><strong>Message from our team:</strong><br>${escapeHtml(note).replace(/\n/g, "<br>")}</p>`
    : `<p>If you paid and believe this is a mistake, reply immediately and we&apos;ll sort it out.</p>`;

  await resend.emails.send({
    from: FROM,
    to: order.email,
    replyTo: customerReplyTo(order),
    subject: `Order update — ${order.styleName}`,
    html: emailShell(
      "Your order was cancelled",
      `<p>Your order for <strong>${escapeHtml(order.styleName)}</strong> has been cancelled on our side.</p>
       ${noteBlock}
       <p>Refunds, if applicable, follow your original payment method and may take a few business days to appear.</p>`,
      order
    ),
  });
}

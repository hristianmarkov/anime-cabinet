import Image from "next/image";
import type { PublicOrderTracking } from "@/lib/orderTrackingPublic";
import { TrackOrderContactForm } from "./TrackOrderContactForm";
import { PublicArtworkReview } from "./PublicArtworkReview";
import { FirstPreviewCountdown } from "./FirstPreviewCountdown";
import { OrderProgressTimeline } from "./OrderProgressTimeline";

export function OrderTrackingDisplay({
  tracking,
  trackToken,
}: {
  tracking: PublicOrderTracking;
  trackToken: string;
}) {
  return (
    <div className="space-y-8">
      <header className="rounded-2xl border border-line bg-surface p-6 shadow-card">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">Order status</p>
        <h1 className="font-display mt-2 text-2xl text-cream sm:text-3xl">{tracking.styleName}</h1>

        <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-faint">Placed</dt>
            <dd className="text-cream">{tracking.placedAt}</dd>
          </div>
          <div>
            <dt className="text-xs text-faint">Format</dt>
            <dd className="text-cream">{tracking.formatLabel}</dd>
          </div>
          <div>
            <dt className="text-xs text-faint">Total paid</dt>
            <dd className="text-cream">{tracking.amountDisplay}</dd>
          </div>
          {tracking.expedited && (
            <div>
              <dt className="text-xs text-faint">Priority</dt>
              <dd className="text-flame">24-hour expedited</dd>
            </div>
          )}
        </dl>
        <div className="mt-7 border-t border-line pt-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">Progress</h2>
        <div className="mt-6"><OrderProgressTimeline pipeline={tracking.pipeline} /></div>
        {tracking.customerCopy && <p className="mt-4 text-sm text-muted">{tracking.customerCopy}</p>}
        {tracking.firstPreviewDeadline && (
          <FirstPreviewCountdown deadline={tracking.firstPreviewDeadline} />
        )}
        {tracking.revisionDeadline && tracking.status === "review" && (
          <FirstPreviewCountdown
            deadline={tracking.revisionDeadline}
            label="Review time remaining"
            expiredLabel="Your review window has ended. We are preparing your final file."
          />
        )}
        </div>
      </header>



      <PublicArtworkReview tracking={tracking} trackToken={trackToken} />

      <TrackOrderContactForm trackToken={trackToken} />

      {!tracking.digital && (tracking.maskedRecipient || tracking.trackingUrl) && (
        <section className="rounded-2xl border border-line bg-surface p-6 shadow-card">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">Delivery</h2>
          {tracking.maskedRecipient && (
            <p className="mt-3 text-sm text-cream">Recipient: {tracking.maskedRecipient}</p>
          )}
          {tracking.maskedDestination && (
            <p className="mt-1 text-sm text-muted">{tracking.maskedDestination}</p>
          )}
          {tracking.shippingMethodName && (
            <p className="mt-2 text-sm text-muted">Shipping: {tracking.shippingMethodName}</p>
          )}
          {tracking.trackingUrl && (
            <a
              href={tracking.trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block text-sm font-semibold text-accent hover:underline"
            >
              Track shipment ↗
              {tracking.trackingNumber ? ` (${tracking.trackingNumber})` : ""}
            </a>
          )}
        </section>
      )}

      {tracking.finalFile && (
        <section className="rounded-2xl border border-line bg-surface p-6 shadow-card">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">Your final artwork</h2>
          <Image
            src={tracking.finalFile.previewUrl}
            alt={`Preview of ${tracking.styleName}`}
            width={800}
            height={800}
            sizes="(max-width: 768px) 100vw, 768px"
            className="mt-4 max-h-64 w-full rounded-xl object-contain"
          />
          <a
            href={tracking.finalFile.downloadUrl}
            download
            className="mt-4 inline-block rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white"
          >
            Download high-resolution file
          </a>
        </section>
      )}

      {tracking.milestones.length > 0 && (
        <section className="rounded-2xl border border-line bg-surface p-6 shadow-card">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">Recent updates</h2>
          <ul className="mt-4 space-y-3">
            {tracking.milestones.map((m, i) => (
              <li key={`${m.at}-${i}`} className="border-l-2 border-line pl-4">
                <p className="text-sm text-cream">{m.label}</p>
                <p className="text-xs text-faint">{m.at}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

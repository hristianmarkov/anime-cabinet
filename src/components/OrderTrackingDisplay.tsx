import type { PublicOrderTracking } from "@/lib/orderTrackingPublic";
import { TrackOrderContactForm } from "./TrackOrderContactForm";

import type { PipelineStep } from "@/lib/orderWorkflow";

function stepClass(state: PipelineStep["state"]): string {
  if (state === "done") return "bg-[#4ade80]/20 text-[#4ade80]";
  if (state === "current") return "bg-accent/25 text-accent ring-2 ring-accent/40";
  return "bg-line/30 text-faint";
}

function TrackingSteps({ steps, start = 1 }: { steps: PipelineStep[]; start?: number }) {
  return <ol className="space-y-3 sm:flex sm:space-y-0 sm:gap-4">
    {steps.map((step, i) => (
      <li key={step.id} className="flex flex-1 items-center gap-3">
        <span aria-current={step.state === "current" ? "step" : undefined} className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${stepClass(step.state)}`}>
          {step.state === "done" ? "✓" : start + i}
        </span>
        <span className={step.state === "current" ? "font-semibold text-cream" : "text-muted"}>{step.label}</span>
      </li>
    ))}
  </ol>;
}

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
        <p className="mt-2 inline-block rounded-full bg-accent/15 px-3 py-1 text-sm font-semibold text-accent">
          {tracking.statusLabel}
        </p>
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
      </header>

      <section className="rounded-2xl border border-line bg-surface p-6 shadow-card">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">Progress</h2>
        <div className="mt-6"><TrackingSteps steps={tracking.pipeline.shared} /></div>
        <div className="ml-4 h-5 border-l-2 border-line sm:mx-auto sm:w-1/2 sm:border-x-2 sm:border-t-2" aria-hidden />
        <div className={`grid gap-4 ${tracking.pipeline.branches.shipping ? "sm:grid-cols-2" : "sm:mx-auto sm:max-w-md"}`}>
          {[{ id: "digital", title: "Digital", steps: tracking.pipeline.branches.digital }, ...(tracking.pipeline.branches.shipping ? [{ id: "shipping", title: "Print & shipping", steps: tracking.pipeline.branches.shipping }] : [])].map((branch) => (
            <section key={branch.id} aria-labelledby={`tracking-${branch.id}`} className="rounded-xl border border-line/70 p-4">
              <h3 id={`tracking-${branch.id}`} className="mb-4 text-xs font-bold uppercase tracking-wider text-muted">{branch.title}</h3>
              <TrackingSteps steps={branch.steps} start={tracking.pipeline.shared.length + 1} />
            </section>
          ))}
        </div>
        {tracking.productionStartsAt && tracking.status === "paid" && (
          <p className="mt-4 text-sm text-muted">
            Our artists start on the next UK working day at{" "}
            <span className="font-semibold text-cream">{tracking.productionStartsAt}</span>.
          </p>
        )}
        {tracking.revisionDeadline && tracking.status === "review" && (
          <p className="mt-4 text-sm text-flame">
            Preview review window until{" "}
            {new Date(tracking.revisionDeadline).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}{" "}
            UTC
            {tracking.revisionHours ? ` (${tracking.revisionHours}h)` : ""}
          </p>
        )}
      </section>

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

      <TrackOrderContactForm trackToken={trackToken} />
    </div>
  );
}

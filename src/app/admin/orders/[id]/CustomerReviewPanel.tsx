import type { OrderDelivery, OrderReviewMessage } from "@/lib/schema";
import { approveArtwork, logCustomerFeedback, requestRevision } from "../../actions";

export function CustomerReviewPanel({
  orderId,
  messages,
  deliveries,
  showActions,
}: {
  orderId: string;
  messages: OrderReviewMessage[];
  deliveries: OrderDelivery[];
  showActions: boolean;
}) {
  return (
    <article className="rounded-2xl border border-flame/30 bg-surface p-6 shadow-card">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-flame">Customer review</h2>
      <p className="mt-2 text-xs text-muted">
        The chronological customer and artist conversation, linked to each artwork version.
      </p>

      {messages.length > 0 && (
        <ul className="mt-4 space-y-3">
          {messages.map((item) => (
            <li key={item.id} className="rounded-xl border border-line bg-ink p-4">
              <p className="text-xs text-faint">
                {new Date(item.createdAt).toLocaleString("en-GB")} · {item.author} · {item.direction}
                {item.deliveryId
                  ? ` · Version ${deliveries.find((delivery) => delivery.id === item.deliveryId)?.versionNumber ?? "?"}`
                  : ""}
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-cream">{item.body}</p>
            </li>
          ))}
        </ul>
      )}

      <form action={logCustomerFeedback} className="mt-4 space-y-2">
        <input type="hidden" name="orderId" value={orderId} />
        <label htmlFor="feedback-body" className="text-xs font-semibold text-faint">
          Log customer message
        </label>
        <textarea
          id="feedback-body"
          name="body"
          rows={4}
          placeholder="Paste their email or summary…"
          className="w-full rounded-xl border border-line bg-ink px-4 py-3 text-sm text-cream focus:border-accent focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-full border border-line px-4 py-2 text-xs font-semibold text-muted hover:text-cream"
        >
          Save message
        </button>
      </form>

      {showActions && (
        <div className="mt-6 flex flex-wrap gap-3 border-t border-line pt-4">
          <form action={approveArtwork}>
            <input type="hidden" name="orderId" value={orderId} />
            <button
              type="submit"
              className="rounded-full bg-[#4ade80]/20 px-5 py-2.5 text-sm font-semibold text-[#4ade80] hover:bg-[#4ade80]/30"
            >
              Approve & close
            </button>
          </form>
          <form action={requestRevision}>
            <input type="hidden" name="orderId" value={orderId} />
            <button
              type="submit"
              className="rounded-full bg-flame/20 px-5 py-2.5 text-sm font-semibold text-flame hover:bg-flame/30"
            >
              Send back for revision
            </button>
          </form>
        </div>
      )}
    </article>
  );
}

import type { OrderCustomerFeedback } from "@/lib/schema";
import { approveArtwork, logCustomerFeedback, requestRevision } from "../../actions";

export function CustomerReviewPanel({
  orderId,
  feedback,
  showActions,
}: {
  orderId: string;
  feedback: OrderCustomerFeedback[];
  showActions: boolean;
}) {
  return (
    <article className="rounded-2xl border border-flame/30 bg-surface p-6 shadow-card">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-flame">Customer review</h2>
      <p className="mt-2 text-xs text-muted">
        Paste email replies here for your records. Approve to close the order (digital) or move to print
        (physical). Request revision to send the order back to production.
      </p>

      {feedback.length > 0 && (
        <ul className="mt-4 space-y-3">
          {feedback.map((item) => (
            <li key={item.id} className="rounded-xl border border-line bg-ink p-4">
              <p className="text-xs text-faint">
                {new Date(item.createdAt).toLocaleString("en-GB")} · {item.source}
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

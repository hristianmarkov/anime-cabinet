import type { Order } from "@/lib/schema";
import { isGelatoConfigured } from "@/lib/gelato";
import { submitGelatoOrder, updatePrintFulfillment } from "../../actions";
import { statusLabels } from "../../order-ui";

export function PrintFulfillmentPanel({ order }: { order: Order }) {
  const gelatoReady = isGelatoConfigured();

  return (
    <article className="rounded-2xl border border-line bg-surface p-6 shadow-card">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">Print & shipping</h2>
      <p className="mt-2 text-xs text-faint">
        Upload a print-ready file URL (public HTTPS), submit to Gelato, then sync tracking via cron or manual
        fields below.
      </p>

      <form action={updatePrintFulfillment} className="mt-4 grid gap-4 sm:grid-cols-2">
        <input type="hidden" name="orderId" value={order.id} />
        <div className="sm:col-span-2">
          <label htmlFor="printFileUrl" className="text-xs text-faint">
            Print-ready file URL
          </label>
          <input
            id="printFileUrl"
            name="printFileUrl"
            type="url"
            defaultValue={order.printFileUrl ?? ""}
            placeholder="https://… final print PDF/PNG"
            className="mt-1 w-full rounded-lg border border-line bg-ink px-3 py-2 text-sm text-cream"
          />
        </div>
        <div>
          <label htmlFor="gelatoOrderId" className="text-xs text-faint">
            Gelato order ID
          </label>
          <input
            id="gelatoOrderId"
            name="gelatoOrderId"
            defaultValue={order.gelatoOrderId ?? ""}
            className="mt-1 w-full rounded-lg border border-line bg-ink px-3 py-2 text-sm text-cream"
          />
        </div>
        <div>
          <label htmlFor="fulfillment-status" className="text-xs text-faint">
            Stage
          </label>
          <select
            id="fulfillment-status"
            name="status"
            defaultValue={order.shippingFulfillmentStatus}
            className="mt-1 w-full rounded-lg border border-line bg-ink px-3 py-2 text-sm text-cream"
          >
            {(["approved", "printing", "shipped", "delivered"] as const).map((s) => (
              <option key={s} value={s}>
                {statusLabels[s]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="trackingNumber" className="text-xs text-faint">
            Tracking number
          </label>
          <input
            id="trackingNumber"
            name="trackingNumber"
            defaultValue={order.trackingNumber ?? ""}
            className="mt-1 w-full rounded-lg border border-line bg-ink px-3 py-2 text-sm text-cream"
          />
        </div>
        <div>
          <label htmlFor="trackingUrl" className="text-xs text-faint">
            Tracking URL
          </label>
          <input
            id="trackingUrl"
            name="trackingUrl"
            type="url"
            defaultValue={order.trackingUrl ?? ""}
            className="mt-1 w-full rounded-lg border border-line bg-ink px-3 py-2 text-sm text-cream"
          />
        </div>
        {order.gelatoFulfillmentStatus && (
          <p className="sm:col-span-2 text-xs text-muted">
            Gelato status: {order.gelatoFulfillmentStatus}
          </p>
        )}
        <div className="sm:col-span-2 flex flex-wrap gap-3">
          <button
            type="submit"
            className="rounded-full bg-surface-raised px-5 py-2 text-sm font-semibold text-cream hover:bg-line"
          >
            Save fulfillment
          </button>
          {order.trackingUrl && (
            <a
              href={order.trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="self-center text-sm font-semibold text-accent hover:underline"
            >
              Open tracking ↗
            </a>
          )}
        </div>
      </form>

      {!order.gelatoOrderId && (
        <form action={submitGelatoOrder} className="mt-6 border-t border-line pt-4">
          <input type="hidden" name="orderId" value={order.id} />
          <p className="text-xs text-muted">
            Submit creates a live Gelato print order using the print file URL above (save first).
          </p>
          <button
            type="submit"
            disabled={!gelatoReady || !order.printFileUrl}
            className="mt-3 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-bright disabled:cursor-not-allowed disabled:opacity-40"
          >
            Submit to Gelato
          </button>
          {!gelatoReady && (
            <p className="mt-2 text-xs text-flame">Set GELATO_API_KEY to enable submit.</p>
          )}
        </form>
      )}
    </article>
  );
}

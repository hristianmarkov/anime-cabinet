"use client";

import { useEffect, useRef, useState } from "react";
import { loadStripe } from "@stripe/stripe-js/pure";
import type { StripeEmbeddedCheckout } from "@stripe/stripe-js";

export type PrintCheckoutSession = { clientSecret: string; publishableKey: string };

export function PrintCheckout({ clientSecret, publishableKey, onBack }: PrintCheckoutSession & { onBack: () => void }) {
  const container = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let stopped = false;
    let checkout: StripeEmbeddedCheckout | undefined;
    const controller = new AbortController();

    async function mount() {
      const stripe = await loadStripe(publishableKey);
      if (stopped) return;
      if (!stripe) throw new Error("Stripe could not load");
      checkout = await stripe.createEmbeddedCheckoutPage({
        clientSecret,
        async onShippingDetailsChange({ checkoutSessionId, shippingDetails }) {
          try {
            const response = await fetch("/api/checkout/shipping", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${clientSecret}`,
              },
              body: JSON.stringify({ sessionId: checkoutSessionId, shippingDetails }),
              signal: controller.signal,
            });
            if (response.ok) return { type: "accept" };
            const data = await response.json();
            return { type: "reject", errorMessage: data.error };
          } catch {
            return { type: "reject", errorMessage: "Could not load delivery options. Please try again." };
          }
        },
      });
      if (!stopped && container.current) checkout.mount(container.current);
      else checkout.destroy();
    }

    void mount().catch(() => {
      if (!stopped) setError(true);
    });
    return () => {
      stopped = true;
      controller.abort();
      checkout?.destroy();
    };
  }, [clientSecret, publishableKey]);

  return (
    <section aria-label="Secure checkout" className="rounded-2xl border border-line bg-surface p-3 sm:p-6">
      <button type="button" onClick={onBack} className="mb-4 text-sm font-semibold text-accent underline">
        Back to portrait options
      </button>
      {error && <p role="alert" className="text-sm text-accent">Checkout could not load. Go back and try again.</p>}
      <div ref={container} />
    </section>
  );
}

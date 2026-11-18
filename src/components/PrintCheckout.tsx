"use client";

import { useEffect, useRef, useState } from "react";
import { loadStripe } from "@stripe/stripe-js/pure";
import type { StripeCheckoutForm, StripeCheckoutFormValue } from "@stripe/stripe-js";

export type PrintCheckoutSession = { clientSecret: string; publishableKey: string };

function shippingAddress(form: StripeCheckoutFormValue) {
  return form.status.shippingAddress?.complete ? form.value.shippingAddress : undefined;
}

export function PrintCheckout({ clientSecret, publishableKey, onBack }: PrintCheckoutSession & { onBack: () => void }) {
  const container = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingRates, setLoadingRates] = useState(false);

  useEffect(() => {
    let stopped = false;
    let form: StripeCheckoutForm | undefined;
    const controller = new AbortController();

    async function mount() {
      const stripe = await loadStripe(publishableKey);
      if (stopped) return;
      if (!stripe || !container.current) throw new Error("Stripe could not load");

      const sdk = stripe.initCheckoutFormSdk({ clientSecret });
      const actionsResult = await sdk.loadActions();
      if (stopped) return;
      if (actionsResult.type === "error") throw new Error(actionsResult.error.message);

      const { actions } = actionsResult;
      const checkoutForm = sdk.createForm({
        expressCheckout: {
          paymentMethods: { applePay: "never", googlePay: "never", link: "never", amazonPay: "never", paypal: "never", klarna: "never" },
        },
      });
      form = checkoutForm;
      let quotedAddress = "";
      let pendingAddress = "";
      let latestAddress: ReturnType<typeof shippingAddress>;
      let confirming = false;

      async function updateRates(details: NonNullable<typeof latestAddress>) {
        const key = JSON.stringify(details);
        if (stopped || pendingAddress || key === quotedAddress) return;
        pendingAddress = key;
        setLoadingRates(true);
        setError(null);
        try {
          const result = await actions.runServerUpdate(async () => {
            const response = await fetch("/api/checkout/shipping", {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${clientSecret}` },
              body: JSON.stringify({ sessionId: actions.getSession().id, shippingDetails: details }),
              signal: controller.signal,
            });
            if (!response.ok) {
              const data = await response.json();
              throw new Error(data.error);
            }
          });
          if (result.type === "error") throw new Error(result.error.message);
          quotedAddress = key;
        } catch (error) {
          quotedAddress = "";
          if (!stopped) setError(error instanceof Error ? error.message : "Could not load delivery options.");
        } finally {
          pendingAddress = "";
          if (!stopped) setLoadingRates(false);
          if (latestAddress && JSON.stringify(latestAddress) !== key) void updateRates(latestAddress);
        }
      }

      checkoutForm.on("change", (event) => {
        latestAddress = shippingAddress(event);
        if (latestAddress && !confirming) void updateRates(latestAddress);
      });
      checkoutForm.on("confirm", async (event) => {
        if (confirming) return;
        confirming = true;
        try {
          const details = shippingAddress(await checkoutForm.getValue());
          if (!details || pendingAddress || JSON.stringify(details) !== quotedAddress) {
            if (details && !pendingAddress) await updateRates(details);
            if (!stopped) setError("Review the delivery options, then select Pay again.");
            return;
          }
          setError(null);
          const result = await actions.confirm({ formConfirmEvent: event });
          if (result.type === "error" && !stopped) setError(result.error.message);
        } catch {
          if (!stopped) setError("Could not complete checkout. Please try again.");
        } finally {
          confirming = false;
        }
      });
      checkoutForm.on("loaderror", () => {
        if (!stopped) setError("Checkout could not load. Go back and try again.");
      });
      checkoutForm.mount(container.current!);
    }

    void mount().catch(() => {
      if (!stopped) setError("Checkout could not load. Go back and try again.");
    });
    return () => {
      stopped = true;
      controller.abort();
      form?.destroy();
    };
  }, [clientSecret, publishableKey]);

  return (
    <section aria-label="Secure checkout" className="rounded-2xl border border-line bg-surface p-3 sm:p-6">
      <button type="button" onClick={onBack} className="mb-4 text-sm font-semibold text-accent underline">
        Back to portrait options
      </button>
      {loadingRates && <p role="status" className="mb-3 text-sm text-muted">Updating delivery options…</p>}
      {error && <p role="alert" className="mb-3 text-sm text-accent">{error}</p>}
      <div ref={container} />
    </section>
  );
}

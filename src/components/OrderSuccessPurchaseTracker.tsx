"use client";

import { useEffect, useRef } from "react";
import { trackPurchase } from "@/lib/analytics";

const STORAGE_KEY = "ac_ga_purchase_tracked";

export function OrderSuccessPurchaseTracker({ sessionId }: { sessionId: string | null }) {
  const started = useRef(false);

  useEffect(() => {
    if (!sessionId || started.current) return;
    started.current = true;

    const dedupeKey = `${STORAGE_KEY}:${sessionId}`;
    if (sessionStorage.getItem(dedupeKey)) return;

    (async () => {
      try {
        const res = await fetch(
          `/api/checkout/confirmation?session_id=${encodeURIComponent(sessionId)}`
        );
        if (!res.ok) return;
        const data = (await res.json()) as {
          transaction_id: string;
          value: number;
          currency: string;
          item_id: string;
          item_name: string;
          item_category?: string;
        };
        trackPurchase({
          transaction_id: data.transaction_id,
          value: data.value,
          currency: data.currency.toUpperCase(),
          item: {
            item_id: data.item_id,
            item_name: data.item_name,
            item_category: data.item_category,
          },
        });
        sessionStorage.setItem(dedupeKey, "1");
      } catch {
        /* ignore */
      }
    })();
  }, [sessionId]);

  return null;
}

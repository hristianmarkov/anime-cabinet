"use client";

import { useEffect, useRef } from "react";
import { AnalyticsEvents, trackFunnel } from "@/lib/analytics";

export function PortraitsAnalytics({ styleCount }: { styleCount: number }) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    trackFunnel(AnalyticsEvents.viewStyleGallery, {
      item_list_name: "all_portrait_styles",
      item_list_id: "portraits",
      style_count: styleCount,
    });
  }, [styleCount]);

  return null;
}

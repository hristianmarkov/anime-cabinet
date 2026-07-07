"use client";

import { useEffect, useState } from "react";
import { site } from "@/data/site";

const staticStats = [
  { value: site.satisfiedBuyersBase.toLocaleString(), label: "Satisfied buyers", dynamic: true },
  { value: site.artistCount, label: "Artists" },
  { value: "Professional", label: "Artist team" },
  { value: `${site.statsDeliveryHours} Hours`, label: "Standard delivery" },
  { value: "Unlimited", label: "Free revisions" },
];

export function StatsBar() {
  const [buyerCount, setBuyerCount] = useState<number>(site.satisfiedBuyersBase);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data: { satisfiedBuyers?: number }) => {
        if (typeof data.satisfiedBuyers === "number") {
          setBuyerCount(data.satisfiedBuyers);
        }
      })
      .catch(() => {});
  }, []);

  const stats = staticStats.map((s) =>
    s.dynamic ? { ...s, value: buyerCount.toLocaleString() } : s
  );

  return (
    <section className="border-y border-line bg-ink-soft">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-8 sm:px-6 lg:grid-cols-5 lg:gap-6 lg:py-10">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <p className="font-display text-2xl text-cream sm:text-3xl">{s.value}</p>
            <p className="mt-1 text-xs text-muted sm:text-sm">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

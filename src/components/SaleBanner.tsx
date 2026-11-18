"use client";

import { useEffect, useState } from "react";

const SECONDS_PER_DAY = 24 * 60 * 60;

export function SaleBanner() {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const update = () => {
      const seconds = Math.floor(Date.now() / 1000);
      setRemaining(SECONDS_PER_DAY - (seconds % SECONDS_PER_DAY));
    };

    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const parts = [
    { unit: "hrs", value: remaining === null ? null : Math.floor(remaining / 3600) },
    { unit: "min", value: remaining === null ? null : Math.floor(remaining / 60) % 60 },
    { unit: "sec", value: remaining === null ? null : remaining % 60 },
  ];

  return (
    <aside aria-label="Ultimate Sale" className="bg-red-800 px-3 py-2 text-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-center">
        <p className="text-sm font-bold uppercase">
          ULTIMATE SALE <span className="ml-1 text-xs font-medium normal-case">Countdown resets in</span>
        </p>
        <div role="timer" aria-live="off" aria-label={parts.map(({ unit, value }) => `${value ?? "–"} ${unit}`).join(" ")}>
          <div aria-hidden="true" className="flex items-center gap-1.5">
            {parts.map(({ unit, value }) => (
              <span key={unit} className="grid min-w-8 rounded bg-white px-1.5 py-0.5 text-center text-zinc-950">
                <span className="text-sm font-bold leading-none tabular-nums">
                  {value === null ? "–" : String(value).padStart(2, "0")}
                </span>
                <span className="text-[9px] font-medium uppercase leading-tight">{unit}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

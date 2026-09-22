"use client";

import { useEffect, useState } from "react";

function remainingParts(deadline: string) {
  const milliseconds = Math.max(0, new Date(deadline).getTime() - Date.now());
  const totalSeconds = Math.floor(milliseconds / 1000);
  return {
    expired: milliseconds === 0,
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

export function FirstPreviewCountdown({ deadline }: { deadline: string }) {
  const [remaining, setRemaining] = useState<ReturnType<typeof remainingParts> | null>(null);

  useEffect(() => {
    const update = () => setRemaining(remainingParts(deadline));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [deadline]);

  if (!remaining) {
    return <p className="mt-3 text-sm text-muted">Calculating time remaining…</p>;
  }

  if (remaining.expired) {
    return <p className="mt-3 font-semibold text-flame">Your first preview is due now.</p>;
  }

  return (
    <div className="mt-4" aria-live="polite" aria-label="Time until first preview">
      <p className="text-xs font-semibold uppercase tracking-wider text-faint">First preview in</p>
      <p className="font-display mt-1 text-2xl text-cream tabular-nums">
        {remaining.hours}h {String(remaining.minutes).padStart(2, "0")}m{" "}
        {String(remaining.seconds).padStart(2, "0")}s
      </p>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

function formatRemaining(ms: number): string {
  if (ms <= 0) return "Window ended";
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h >= 24) {
    const d = Math.floor(h / 24);
    const rh = h % 24;
    return `${d}d ${rh}h ${m}m left`;
  }
  return `${h}h ${m}m ${s}s left`;
}

export function ReviewCountdown({
  deadlineIso,
  revisionHours,
}: {
  deadlineIso: string;
  revisionHours: number;
}) {
  const deadlineMs = new Date(deadlineIso).getTime();
  const [remaining, setRemaining] = useState(() => deadlineMs - Date.now());

  useEffect(() => {
    const t = setInterval(() => setRemaining(deadlineMs - Date.now()), 1000);
    return () => clearInterval(t);
  }, [deadlineMs]);

  const urgent = remaining > 0 && remaining < 6 * 60 * 60 * 1000;

  return (
    <div
      className={`rounded-xl border px-4 py-3 ${
        remaining <= 0
          ? "border-faint/40 bg-faint/10"
          : urgent
            ? "border-flame/40 bg-flame/10"
            : "border-accent/30 bg-accent/10"
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-muted">Review timer</p>
      <p className={`mt-1 text-lg font-semibold ${urgent ? "text-flame" : "text-cream"}`}>
        {formatRemaining(remaining)}
      </p>
      <p className="mt-1 text-xs text-faint">
        {revisionHours}-hour revision window · ends{" "}
        {new Date(deadlineIso).toLocaleString("en-GB")} UTC
      </p>
    </div>
  );
}

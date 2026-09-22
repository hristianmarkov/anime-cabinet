const LONDON = "Europe/London";

/**
 * Production starts on the next Monday-Friday London calendar day after payment,
 * at exactly 09:00 local time. The payment day itself is never included.
 */
export const PRODUCTION_SCHEDULE_LABEL = "09:00 Europe/London (next working day)";

export interface LondonYmd {
  y: number;
  m: number;
  d: number;
  weekday: number; // 0 Sun .. 6 Sat
}

export function getLondonYmd(date: Date): LondonYmd {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: LONDON,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).formatToParts(date);

  const pick = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  return {
    y: Number(pick("year")),
    m: Number(pick("month")),
    d: Number(pick("day")),
    weekday: weekdayMap[pick("weekday")] ?? 0,
  };
}

function daysInMonth(y: number, m: number): number {
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

export function addCalendarDaysYmd(ymd: LondonYmd, days: number): LondonYmd {
  let { y, m, d } = ymd;
  d += days;
  while (d > daysInMonth(y, m)) {
    d -= daysInMonth(y, m);
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
  }
  while (d < 1) {
    m -= 1;
    if (m < 1) {
      m = 12;
      y -= 1;
    }
    d += daysInMonth(y, m);
  }
  const probe = dateAtLondonTime(y, m, d, 12, 0);
  return getLondonYmd(probe);
}

/** UTC instant for a local London wall-clock time (handles GMT/BST). */
export function dateAtLondonTime(y: number, m: number, d: number, hour: number, minute: number): Date {
  let guess = new Date(Date.UTC(y, m - 1, d, hour, minute, 0));
  for (let i = 0; i < 6; i++) {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: LONDON,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(guess);

    const parts = fmt;
    const pick = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
    const ly = pick("year");
    const lm = pick("month");
    const ld = pick("day");
    const lh = pick("hour");
    const lmin = pick("minute");

    if (ly === y && lm === m && ld === d && lh === hour && lmin === minute) {
      return guess;
    }

    const targetMinutes = hour * 60 + minute;
    const actualMinutes = lh * 60 + lmin;
    guess = new Date(guess.getTime() + (targetMinutes - actualMinutes) * 60_000);
  }
  return guess;
}

/** Next UK working day after `from` (London calendar), at 09:00 Europe/London. */
export function nextWorkingDayAtNineLondon(from: Date = new Date()): Date {
  let ymd = getLondonYmd(from);
  ymd = addCalendarDaysYmd(ymd, 1);
  while (ymd.weekday === 0 || ymd.weekday === 6) {
    ymd = addCalendarDaysYmd(ymd, 1);
  }
  return dateAtLondonTime(ymd.y, ymd.m, ymd.d, 9, 0);
}

export function formatLondonNineLabel(when: Date): string {
  return when.toLocaleString("en-GB", {
    timeZone: LONDON,
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

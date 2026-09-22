export const STANDARD_FIRST_PREVIEW_HOURS = 72;
export const EXPEDITED_FIRST_PREVIEW_HOURS = 24;

/** Returns the immutable first-preview deadline to store when payment is received. */
export function calculateFirstPreviewDeadline(paidAt: Date, expedited: boolean): Date {
  const hours = expedited ? EXPEDITED_FIRST_PREVIEW_HOURS : STANDARD_FIRST_PREVIEW_HOURS;
  return new Date(paidAt.getTime() + hours * 60 * 60 * 1000);
}

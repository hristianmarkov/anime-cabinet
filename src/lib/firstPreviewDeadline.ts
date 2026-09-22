export const STANDARD_FIRST_PREVIEW_HOURS = 72;
export const EXPEDITED_FIRST_PREVIEW_HOURS = 24;

/** Returns the first-preview deadline measured from the order's creation time. */
export function calculateFirstPreviewDeadline(createdAt: Date, expedited: boolean): Date {
  const hours = expedited ? EXPEDITED_FIRST_PREVIEW_HOURS : STANDARD_FIRST_PREVIEW_HOURS;
  return new Date(createdAt.getTime() + hours * 60 * 60 * 1000);
}

/** Use the stored immutable deadline, falling back for orders created before the column existed. */
export function resolveFirstPreviewDeadline(order: {
  createdAt: Date | string;
  expedited: boolean;
  firstPreviewDeadline: Date | string | null;
}): Date {
  return order.firstPreviewDeadline
    ? new Date(order.firstPreviewDeadline)
    : calculateFirstPreviewDeadline(new Date(order.createdAt), order.expedited);
}

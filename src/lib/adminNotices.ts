export type NoticeItem = {
  direction: "customer" | "admin";
  createdAt: Date;
};

export function unansweredCount(items: NoticeItem[]): number {
  const ordered = [...items].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  let count = 0;
  for (const item of ordered) {
    if (item.direction === "admin") break;
    count += 1;
  }
  return count;
}

export function orderNotice(input: {
  messages: NoticeItem[];
  latestDecision?: { kind: string; createdAt: Date };
}): string | null {
  const newestMessage = [...input.messages].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  )[0];
  if (
    input.latestDecision?.kind === "artwork_approved" &&
    (!newestMessage || input.latestDecision.createdAt >= newestMessage.createdAt)
  ) return "Approved";
  if (
    input.latestDecision?.kind === "revision_requested" &&
    (!newestMessage || input.latestDecision.createdAt >= newestMessage.createdAt)
  ) return "Rejected";
  const count = unansweredCount(input.messages);
  return count > 0 ? String(count) : null;
}

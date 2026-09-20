export const statusColors: Record<string, string> = {
  pending: "bg-faint/20 text-muted",
  paid: "bg-gold/20 text-gold",
  in_progress: "bg-electric/20 text-electric",
  review: "bg-flame/20 text-flame",
  delivered: "bg-[#4ade80]/20 text-[#4ade80]",
  cancelled: "bg-accent/20 text-accent",
};

export const statusLabels: Record<string, string> = {
  pending: "Pending payment",
  paid: "Paid — new",
  in_progress: "In progress",
  review: "Sent for review",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

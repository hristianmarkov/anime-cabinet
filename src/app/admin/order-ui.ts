import type { OrderStatus } from "@/lib/schema";

export const statusColors: Record<OrderStatus, string> = {
  pending: "bg-faint/20 text-muted",
  paid: "bg-gold/20 text-gold",
  in_progress: "bg-electric/20 text-electric",
  review: "bg-flame/20 text-flame",
  digital_file: "bg-[#4ade80]/20 text-[#4ade80]",
  approved: "bg-[#a78bfa]/20 text-[#c4b5fd]",
  printing: "bg-gold/20 text-gold",
  shipped: "bg-electric/20 text-electric",
  delivered: "bg-[#4ade80]/20 text-[#4ade80]",
  cancelled: "bg-accent/20 text-accent",
};

export const statusLabels: Record<OrderStatus, string> = {
  pending: "Pending payment",
  paid: "Paid — new",
  in_progress: "In production",
  review: "Customer review",
  digital_file: "Digital file ready",
  approved: "Artwork approved",
  printing: "Printing",
  shipped: "Dispatched",
  delivered: "Completed",
  cancelled: "Cancelled",
};

export const FILTER_STATUSES: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: statusLabels.pending },
  { value: "paid", label: statusLabels.paid },
  { value: "in_progress", label: statusLabels.in_progress },
  { value: "review", label: statusLabels.review },
  { value: "digital_file", label: statusLabels.digital_file },
  { value: "approved", label: statusLabels.approved },
  { value: "printing", label: statusLabels.printing },
  { value: "shipped", label: statusLabels.shipped },
  { value: "delivered", label: statusLabels.delivered },
  { value: "cancelled", label: statusLabels.cancelled },
];

const statusMap: Record<string, { label: string; className: string }> = {
  // Property
  pending: { label: "Pending Review", className: "pill-pending" },
  approved: { label: "Approved", className: "pill-approved" },
  rejected: { label: "Rejected", className: "pill-rejected" },
  // Lead
  new: { label: "New", className: "pill-pending" },
  contacted: { label: "Contacted", className: "pill-neutral" },
  qualified: { label: "Qualified", className: "pill-approved" },
  shared: { label: "Shared", className: "pill-approved" },
  disqualified: { label: "Disqualified", className: "pill-rejected" },
  // PlanPurchase
  pending_activation: { label: "Pending Activation", className: "pill-pending" },
  active: { label: "Active", className: "pill-approved" },
  expired: { label: "Expired", className: "pill-neutral" },
  refunded: { label: "Refunded", className: "pill-rejected" },
  cancelled: { label: "Cancelled", className: "pill-rejected" },
  // BuyerRequest
  in_progress: { label: "In Progress", className: "pill-neutral" },
  matched: { label: "Matched", className: "pill-approved" },
  closed: { label: "Closed", className: "pill-neutral" },
  // Refund status
  none: { label: "No Refund", className: "pill-neutral" },
  requested: { label: "Refund Requested", className: "pill-pending" },
};

export default function StatusPill({ status }: { status: string }) {
  const entry = statusMap[status] || { label: status, className: "pill-neutral" };
  return <span className={`pill ${entry.className}`}>{entry.label}</span>;
}

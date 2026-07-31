export function formatPrice(price: number, priceUnit: "total" | "per_month"): string {
  const formatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

  return priceUnit === "per_month" ? `${formatted}/mo` : formatted;
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateString));
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

// Where a logged-in user lands based on their role — used right after
// login/register, and by the Navbar's "Dashboard" link.
export function dashboardPathFor(role?: string): string {
  switch (role) {
    case "seller":
      return "/dashboard/seller";
    case "buyer":
      return "/dashboard/buyer";
    case "admin":
      return "/dashboard/admin";
    case "superadmin":
      return "/dashboard/superadmin";
    default:
      return "/";
  }
}

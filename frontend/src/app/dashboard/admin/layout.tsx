"use client";

import { LayoutDashboard, Home, Heart, CreditCard, Search, FileText, ArrowLeftCircle } from "lucide-react";
import { useProtectedRoute } from "@/lib/hooks";
import { useAdminNotifications } from "@/lib/useAdminNotifications";
import DashboardSidebar, { DashboardNavItem } from "@/components/dashboard/DashboardSidebar";
import DashboardTopbar from "@/components/dashboard/DashboardTopbar";
import Spinner from "@/components/Spinner";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useProtectedRoute(["admin", "superadmin"]);
  const notifications = useAdminNotifications();

  const navItems: DashboardNavItem[] = [
    { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/admin/properties", label: "Properties", icon: Home, showDot: notifications.pendingProperties > 0 },
    { href: "/dashboard/admin/leads", label: "Leads", icon: Heart, showDot: notifications.newLeads > 0 },
    {
      href: "/dashboard/admin/plan-purchases",
      label: "Plan Purchases",
      icon: CreditCard,
      showDot: notifications.pendingPlanPurchases > 0 || notifications.refundRequests > 0,
    },
    {
      href: "/dashboard/admin/buyer-requests",
      label: "Buyer Requests",
      icon: Search,
      showDot: notifications.newBuyerRequests > 0,
    },
    { href: "/dashboard/admin/blogs", label: "Blog", icon: FileText },
    // Only a superadmin viewing the shared Admin dashboard needs a way back
    ...(user?.role === "superadmin"
      ? [{ href: "/dashboard/superadmin", label: "Back to Super Admin", icon: ArrowLeftCircle }]
      : []),
  ];

  return (
    <div className="min-h-screen">
      <DashboardTopbar />
      {isLoading || !user ? (
        <Spinner label="Loading dashboard…" />
      ) : (
        <div className="container-page flex flex-col gap-8 py-10 md:flex-row">
          <DashboardSidebar items={navItems} roleLabel="Admin Dashboard" />
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      )}
    </div>
  );
}

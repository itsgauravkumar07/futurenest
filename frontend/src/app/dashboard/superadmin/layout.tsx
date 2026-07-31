"use client";

import { LayoutDashboard, CreditCard, ShieldCheck, Users, BarChart3, LayoutList } from "lucide-react";
import { useProtectedRoute } from "@/lib/hooks";
import { useAdminNotifications } from "@/lib/useAdminNotifications";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardTopbar from "@/components/dashboard/DashboardTopbar";
import Spinner from "@/components/Spinner";

export default function SuperAdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useProtectedRoute(["superadmin"]);
  const notifications = useAdminNotifications();

  const navItems = [
    { href: "/dashboard/superadmin", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/superadmin/plans", label: "Plans", icon: CreditCard },
    { href: "/dashboard/superadmin/admins", label: "Admins", icon: ShieldCheck },
    { href: "/dashboard/superadmin/users", label: "Users", icon: Users },
    { href: "/dashboard/superadmin/revenue", label: "Revenue", icon: BarChart3, showDot: notifications.refundRequests > 0 },
    {
      href: "/dashboard/admin",
      label: "Operations (Admin view)",
      icon: LayoutList,
      showDot: notifications.total > 0,
    },
  ];

  return (
    <div className="min-h-screen">
      <DashboardTopbar />
      {isLoading || !user ? (
        <Spinner label="Loading dashboard…" />
      ) : (
        <div className="container-page flex flex-col gap-8 py-10 md:flex-row">
          <DashboardSidebar items={navItems} roleLabel="Super Admin" />
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      )}
    </div>
  );
}

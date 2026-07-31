"use client";

import { LayoutDashboard, Home, PlusCircle, CreditCard, Heart } from "lucide-react";
import { useProtectedRoute } from "@/lib/hooks";
import { useSellerNotifications } from "@/lib/useSellerNotifications";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardTopbar from "@/components/dashboard/DashboardTopbar";
import Spinner from "@/components/Spinner";

export default function SellerDashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useProtectedRoute(["seller"]);
  const notifications = useSellerNotifications();

  const navItems = [
    { href: "/dashboard/seller", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/seller/properties", label: "My Properties", icon: Home },
    { href: "/dashboard/seller/properties/new", label: "Add Property", icon: PlusCircle },
    {
      href: "/dashboard/seller/leads",
      label: "Shared Leads",
      icon: Heart,
      showDot: notifications.sharedLeads > 0,
    },
    { href: "/dashboard/seller/plans", label: "My Plan", icon: CreditCard },
  ];

  return (
    <div className="min-h-screen">
      <DashboardTopbar />
      {isLoading || !user ? (
        <Spinner label="Loading dashboard…" />
      ) : (
        <div className="container-page flex flex-col gap-8 py-10 md:flex-row">
          <DashboardSidebar items={navItems} roleLabel="Seller Dashboard" />
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      )}
    </div>
  );
}

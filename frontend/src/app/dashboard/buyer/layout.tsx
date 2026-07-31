"use client";

import { LayoutDashboard, Heart, Search, CreditCard, Home } from "lucide-react";
import { useProtectedRoute } from "@/lib/hooks";
import { useBuyerNotifications } from "@/lib/useBuyerNotifications";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardTopbar from "@/components/dashboard/DashboardTopbar";
import Spinner from "@/components/Spinner";

export default function BuyerDashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useProtectedRoute(["buyer"]);
  const notifications = useBuyerNotifications();

  const navItems = [
    { href: "/dashboard/buyer", label: "Overview", icon: LayoutDashboard },
    {
      href: "/dashboard/buyer/leads",
      label: "My Interests",
      icon: Heart,
      showDot: notifications.updatedLeads > 0,
    },
    {
      href: "/dashboard/buyer/requests",
      label: "Assisted Search",
      icon: Search,
      showDot: notifications.matchedRequests > 0,
    },
    { href: "/dashboard/buyer/plans", label: "My Plan", icon: CreditCard },
    // Not a dashboard route — takes the buyer back to the public site to
    // browse more listings, per their request for a way back to Home.
    { href: "/properties", label: "Browse Properties", icon: Home },
  ];

  return (
    <div className="min-h-screen">
      <DashboardTopbar />
      {isLoading || !user ? (
        <Spinner label="Loading dashboard…" />
      ) : (
        <div className="container-page flex flex-col gap-8 py-10 md:flex-row">
          <DashboardSidebar items={navItems} roleLabel="Buyer Dashboard" />
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      )}
    </div>
  );
}

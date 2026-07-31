"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import PropertyForm from "@/components/dashboard/PropertyForm";

export default function NewPropertyPage() {
  const { user } = useAuth();
  const canAddProperty = user?.planStatus === "active" && user.listingsRemaining > 0;

  if (user && !canAddProperty) {
    return (
      <div>
        <h1 className="text-2xl">Add a Property</h1>
        <div className="card mt-6 p-8 text-center">
          <p className="text-lg font-medium">
            {user.planStatus !== "active" ? "You need an active plan first" : "You've reached your listing limit"}
          </p>
          <p className="mt-1 text-sm text-slate">
            {user.planStatus !== "active"
              ? "Purchase a plan to start listing properties."
              : "Upgrade your plan to list more properties."}
          </p>
          <Link href="/dashboard/seller/plans" className="btn-accent mt-5 inline-flex">
            View Plans
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl">Add a Property</h1>
      <p className="mt-1 text-sm text-slate">It&apos;ll go live once our team reviews and approves it.</p>
      <PropertyForm mode="create" />
    </div>
  );
}

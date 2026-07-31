"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import StatusPill from "@/components/StatusPill";
import type { Property } from "@/types";

export default function SellerOverviewPage() {
  const { user, refreshUser } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refreshUser();
    api
      .get("/properties/mine/all")
      .then((res) => setProperties(res.data.properties))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!user) return null;

  const pendingCount = properties.filter((p) => p.status === "pending").length;
  const approvedCount = properties.filter((p) => p.status === "approved").length;

  return (
    <div>
      <h1 className="text-2xl">Welcome back, {user.name.split(" ")[0]}</h1>

      {/* Plan status */}
      <div className="card mt-6 p-6">
        <div className="flex items-center justify-between">
          <p className="eyebrow">Your Plan</p>
          <StatusPill status={user.planStatus} />
        </div>

        {user.planStatus === "none" ? (
          <div className="mt-3">
            <p className="text-sm text-slate">You don&apos;t have an active plan yet — purchase one to start listing.</p>
            <Link href="/dashboard/seller/plans" className="btn-accent mt-4 inline-flex">
              Browse plans
            </Link>
          </div>
        ) : user.planStatus === "pending_activation" ? (
          <p className="mt-3 text-sm text-slate">
            Your plan purchase is awaiting admin activation after payment confirmation.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div>
              <p className="font-mono text-2xl text-ink">{user.listingsRemaining}</p>
              <p className="text-xs text-slate">Listings left</p>
            </div>
            <div>
              <p className="font-mono text-2xl text-ink">{user.leadsRemaining}</p>
              <p className="text-xs text-slate">Leads left</p>
            </div>
            <div>
              <p className="font-mono text-2xl text-ink">{formatDate(user.planExpiryDate)}</p>
              <p className="text-xs text-slate">Expires</p>
            </div>
          </div>
        )}
      </div>

      {/* Property snapshot */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="card p-6">
          <p className="font-mono text-3xl text-ink">{loading ? "—" : pendingCount}</p>
          <p className="mt-1 text-sm text-slate">Properties pending review</p>
        </div>
        <div className="card p-6">
          <p className="font-mono text-3xl text-ink">{loading ? "—" : approvedCount}</p>
          <p className="mt-1 text-sm text-slate">Properties live</p>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Link href="/dashboard/seller/properties/new" className="btn-accent">
          Add a property
        </Link>
        <Link href="/dashboard/seller/properties" className="btn-outline">
          Manage properties
        </Link>
      </div>
    </div>
  );
}

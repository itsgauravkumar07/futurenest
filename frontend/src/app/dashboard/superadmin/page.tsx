"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

export default function SuperAdminOverviewPage() {
  const [revenue, setRevenue] = useState<{ totalRevenue: number; totalActivations: number } | null>(null);
  const [planCount, setPlanCount] = useState<number | null>(null);
  const [adminCount, setAdminCount] = useState<number | null>(null);

  useEffect(() => {
    api.get("/admin/plan-purchases/revenue").then((res) => setRevenue(res.data));
    api.get("/superadmin/plans").then((res) => setPlanCount(res.data.plans.length));
    api.get("/superadmin/admins").then((res) => setAdminCount(res.data.admins.length));
  }, []);

  return (
    <div>
      <h1 className="text-2xl">Super Admin Overview</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Link href="/dashboard/superadmin/revenue" className="card p-6 hover:shadow-lifted">
          <p className="font-mono text-3xl text-ink">
            {revenue ? `₹${revenue.totalRevenue}` : "—"}
          </p>
          <p className="mt-1 text-sm text-slate">Total revenue ({revenue?.totalActivations ?? 0} activations)</p>
        </Link>
        <Link href="/dashboard/superadmin/plans" className="card p-6 hover:shadow-lifted">
          <p className="font-mono text-3xl text-ink">{planCount ?? "—"}</p>
          <p className="mt-1 text-sm text-slate">Plans configured</p>
        </Link>
        <Link href="/dashboard/superadmin/admins" className="card p-6 hover:shadow-lifted">
          <p className="font-mono text-3xl text-ink">{adminCount ?? "—"}</p>
          <p className="mt-1 text-sm text-slate">Admin accounts</p>
        </Link>
      </div>

      <div className="card mt-6 p-6">
        <p className="text-sm text-slate">
          Day-to-day operations — approving properties, qualifying leads, activating plans — happen in the{" "}
          <Link href="/dashboard/admin" className="text-accent-dark hover:underline">
            Admin dashboard
          </Link>
          , which your Super Admin account also has access to.
        </p>
      </div>
    </div>
  );
}

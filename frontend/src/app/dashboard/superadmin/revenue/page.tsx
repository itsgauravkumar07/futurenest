"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import Spinner from "@/components/Spinner";
import StatusPill from "@/components/StatusPill";
import type { User } from "@/types";

interface Purchaser {
  _id: string;
  account: User;
  planName: string;
  price: number;
  status: string;
  activatedAt: string | null;
}

interface RevenueReport {
  totalRevenue: number;
  totalActivations: number;
  byPlan: Record<string, number>;
  byAudience: { seller: number; buyer: number };
  purchasers: Purchaser[];
}

export default function RevenuePage() {
  const [report, setReport] = useState<RevenueReport | null>(null);

  useEffect(() => {
    api.get("/admin/plan-purchases/revenue").then((res) => setReport(res.data));
  }, []);

  if (!report) return <Spinner label="Loading revenue report…" />;

  return (
    <div>
      <h1 className="text-2xl">Revenue</h1>
      <p className="mt-1 text-sm text-slate">From activated plan purchases (active or expired) — refunded purchases excluded.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="card p-6">
          <p className="font-mono text-3xl text-ink">₹{report.totalRevenue}</p>
          <p className="mt-1 text-sm text-slate">Total revenue ({report.totalActivations} activations)</p>
        </div>
        <div className="card p-6">
          <p className="font-mono text-lg text-ink">
            Sellers: ₹{report.byAudience.seller} &nbsp;·&nbsp; Buyers: ₹{report.byAudience.buyer}
          </p>
          <p className="mt-1 text-sm text-slate">Split by who purchased</p>
        </div>
      </div>

      <p className="eyebrow mb-3 mt-8">By Plan</p>
      <div className="card divide-y divide-line overflow-hidden">
        {Object.entries(report.byPlan).map(([planName, amount]) => (
          <div key={planName} className="flex items-center justify-between p-4">
            <p className="text-sm text-ink">{planName}</p>
            <p className="font-mono text-sm text-ink">₹{amount}</p>
          </div>
        ))}
      </div>

      <p className="eyebrow mb-3 mt-8">Who Bought What</p>
      {report.purchasers.length === 0 ? (
        <p className="text-sm text-slate">No completed purchases yet.</p>
      ) : (
        <div className="card divide-y divide-line overflow-hidden">
          {report.purchasers.map((p) => (
            <div key={p._id} className="flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-ink">{p.account?.name}</p>
                  <StatusPill status={p.status} />
                </div>
                <p className="text-xs text-slate">
                  {p.account?.email} · {p.planName} · {formatDate(p.activatedAt)}
                </p>
              </div>
              <p className="font-mono text-sm text-ink">₹{p.price}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

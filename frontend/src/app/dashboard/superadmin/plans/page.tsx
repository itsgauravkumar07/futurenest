"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PlusCircle, Pencil } from "lucide-react";
import { api, getErrorMessage } from "@/lib/api";
import Spinner from "@/components/Spinner";
import type { Plan } from "@/types";

export default function SuperAdminPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    api
      .get("/superadmin/plans")
      .then((res) => setPlans(res.data.plans))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const toggleActive = async (id: string) => {
    setActioningId(id);
    try {
      await api.put(`/superadmin/plans/${id}/toggle-active`);
      load();
    } catch (error) {
      alert(getErrorMessage(error));
    } finally {
      setActioningId(null);
    }
  };

  if (loading) return <Spinner label="Loading plans…" />;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl">Plans</h1>
        <Link href="/dashboard/superadmin/plans/new" className="btn-accent">
          <PlusCircle size={16} /> New Plan
        </Link>
      </div>

      {plans.length === 0 ? (
        <p className="mt-8 text-sm text-slate">No plans yet.</p>
      ) : (
        <div className="card mt-6 divide-y divide-line overflow-hidden">
          {plans.map((plan) => (
            <div key={plan._id} className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-ink">{plan.name}</p>
                  <span className={`pill ${plan.isActive ? "pill-approved" : "pill-neutral"}`}>
                    {plan.isActive ? "Active" : "Retired"}
                  </span>
                  <span className="pill pill-neutral">{plan.audience}</span>
                  <span className="pill pill-neutral">{plan.targetListingType}</span>
                </div>
                <p className="mt-1 text-sm text-slate">
                  ₹{plan.price} · {plan.audience === "seller" && `${plan.listingLimit} listings, `}
                  {plan.qualifiedLeadsLimit} {plan.audience === "seller" ? "leads" : "matches"} ·{" "}
                  {plan.validityDays ? `${plan.validityDays} days` : "no expiry"}
                  {plan.upiId && " · QR/UPI set"}
                </p>
              </div>

              <div className="flex shrink-0 gap-2">
                <button onClick={() => toggleActive(plan._id)} disabled={actioningId === plan._id} className="btn-outline">
                  {plan.isActive ? "Retire" : "Reactivate"}
                </button>
                <Link href={`/dashboard/superadmin/plans/${plan._id}/edit`} className="btn-outline px-3">
                  <Pencil size={15} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

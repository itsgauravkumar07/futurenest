"use client";

import { useEffect, useState } from "react";
import { api, getErrorMessage } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import StatusPill from "@/components/StatusPill";
import StatusTabs from "@/components/dashboard/StatusTabs";
import Spinner from "@/components/Spinner";
import type { PlanPurchase, User } from "@/types";

const tabs = [
  { value: "pending_activation", label: "Pending Activation" },
  { value: "refunds", label: "Refund Requests" },
  { value: "active", label: "Active" },
];

export default function AdminPlanPurchasesPage() {
  const [tab, setTab] = useState("pending_activation");
  const [purchases, setPurchases] = useState<PlanPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const load = (currentTab: string) => {
    setLoading(true);
    const url = currentTab === "refunds" ? "/admin/plan-purchases/refund-requests" : `/admin/plan-purchases?status=${currentTab}`;
    api
      .get(url)
      .then((res) => setPurchases(res.data.purchases))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const handleActivate = async (id: string) => {
    setActioningId(id);
    try {
      await api.put(`/admin/plan-purchases/${id}/activate`);
      load(tab);
    } catch (error) {
      alert(getErrorMessage(error));
    } finally {
      setActioningId(null);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Cancel this pending purchase?")) return;
    setActioningId(id);
    try {
      await api.put(`/admin/plan-purchases/${id}/cancel`);
      load(tab);
    } catch (error) {
      alert(getErrorMessage(error));
    } finally {
      setActioningId(null);
    }
  };

  const handleRefund = async (id: string, approve: boolean) => {
    const reason = prompt(approve ? "Confirm refund reason:" : "Reason for rejecting the refund:");
    if (reason === null) return;
    setActioningId(id);
    try {
      await api.put(`/admin/plan-purchases/${id}/refund`, { approve, reason });
      load(tab);
    } catch (error) {
      alert(getErrorMessage(error));
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl">Plan Purchases</h1>
      <div className="mt-4">
        <StatusTabs tabs={tabs} active={tab} onChange={setTab} />
      </div>

      {loading ? (
        <Spinner />
      ) : purchases.length === 0 ? (
        <p className="mt-8 text-sm text-slate">Nothing here.</p>
      ) : (
        <div className="card mt-6 divide-y divide-line overflow-hidden">
          {purchases.map((purchase) => {
            const account = purchase.purchasedBy as User;
            return (
              <div key={purchase._id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-ink">{purchase.planSnapshot.name}</p>
                    <StatusPill status={purchase.status} />
                    {purchase.refundStatus !== "none" && <StatusPill status={purchase.refundStatus} />}
                  </div>
                  <p className="mt-1 text-sm text-slate">
                    ₹{purchase.planSnapshot.price} ({purchase.planSnapshot.audience}) · Requested{" "}
                    {formatDate(purchase.requestedAt)}
                  </p>
                  <p className="mt-1 text-xs text-slate">
                    {account?.name} ({account?.email}, {account?.phone})
                  </p>
                  {purchase.refundReason && <p className="mt-1 text-xs italic text-slate">&quot;{purchase.refundReason}&quot;</p>}
                  {purchase.paymentScreenshot?.url && (
                    <a
                      href={purchase.paymentScreenshot.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-xs text-accent-dark underline"
                    >
                      View payment screenshot
                    </a>
                  )}
                </div>

                <div className="flex shrink-0 gap-2">
                  {tab === "pending_activation" && (
                    <>
                      <button
                        onClick={() => handleActivate(purchase._id)}
                        disabled={actioningId === purchase._id}
                        className="btn-accent"
                      >
                        Activate
                      </button>
                      <button
                        onClick={() => handleCancel(purchase._id)}
                        disabled={actioningId === purchase._id}
                        className="btn-outline text-brick hover:border-brick"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {tab === "refunds" && (
                    <>
                      <button
                        onClick={() => handleRefund(purchase._id, true)}
                        disabled={actioningId === purchase._id}
                        className="btn-accent"
                      >
                        Approve Refund
                      </button>
                      <button
                        onClick={() => handleRefund(purchase._id, false)}
                        disabled={actioningId === purchase._id}
                        className="btn-outline text-brick hover:border-brick"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

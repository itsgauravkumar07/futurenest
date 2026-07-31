"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Loader2, Upload, Copy, Check } from "lucide-react";
import { api, getErrorMessage, uploadImage } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { formatDate } from "@/lib/utils";
import StatusPill from "@/components/StatusPill";
import Spinner from "@/components/Spinner";
import type { Plan, PlanPurchase } from "@/types";

// Shown after a buyer picks a plan, before any purchase exists in the
// database. Nothing is saved until the screenshot upload succeeds — that
// single request both creates the purchase AND attaches the proof.
function PaymentUploadCard({
  plan,
  onComplete,
  onCancel,
}: {
  plan: Plan;
  onComplete: (message: string) => void;
  onCancel: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const { url } = await uploadImage(file);
      const res = await api.post(`/plans/${plan._id}/purchase`, { screenshotUrl: url });
      onComplete(res.data.message);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const copyUpi = () => {
    if (!plan.upiId) return;
    navigator.clipboard.writeText(plan.upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="card mb-8 border-amber bg-amber-light/40 p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="eyebrow">Complete Payment</p>
          <h2 className="mt-1 text-xl">Pay for &quot;{plan.name}&quot; — ₹{plan.price}</h2>
        </div>
        <button onClick={onCancel} className="text-sm text-slate hover:text-ink">
          Cancel
        </button>
      </div>
      <p className="mt-1 text-sm text-slate">
        Scan the QR code or pay via UPI, then upload your payment screenshot to submit this purchase.
      </p>

      <div className="mt-5 flex flex-col gap-6 sm:flex-row">
        {plan.paymentQr?.url ? (
          <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-md border border-line bg-white">
            <Image src={plan.paymentQr.url} alt="Payment QR code" fill className="object-contain p-2" />
          </div>
        ) : (
          <div className="flex h-40 w-40 shrink-0 items-center justify-center rounded-md border border-dashed border-line text-center text-xs text-slate-light">
            No QR code set for this plan
          </div>
        )}

        <div className="flex-1">
          {plan.upiId && (
            <div className="mb-4">
              <p className="label mb-1">UPI ID</p>
              <button onClick={copyUpi} className="btn-outline">
                {copied ? <Check size={15} /> : <Copy size={15} />}
                <span className="font-mono">{plan.upiId}</span>
              </button>
            </div>
          )}

          <label className="btn-accent inline-flex cursor-pointer">
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            {uploading ? "Submitting…" : "Upload payment screenshot"}
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
          </label>
          {error && <p className="mt-2 text-sm text-brick">{error}</p>}
        </div>
      </div>
    </div>
  );
}

export default function BuyerPlansPage() {
  const { user, refreshUser } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [purchases, setPurchases] = useState<PlanPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const load = () => {
    setLoading(true);
    Promise.all([api.get("/plans?audience=buyer"), api.get("/plans/my-purchases")])
      .then(([plansRes, purchasesRes]) => {
        setPlans(plansRes.data.plans);
        setPurchases(purchasesRes.data.purchases);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handlePaymentComplete = async (successMessage: string) => {
    setMessage(successMessage);
    setSelectedPlan(null);
    await refreshUser();
    load();
  };

  const handleRefundRequest = async (purchaseId: string) => {
    const reason = prompt("Why are you requesting a refund?");
    if (reason === null) return;
    setActioningId(purchaseId);
    try {
      await api.post(`/plans/my-purchases/${purchaseId}/refund-request`, { reason });
      load();
    } catch (error) {
      alert(getErrorMessage(error));
    } finally {
      setActioningId(null);
    }
  };

  const handleCancelPurchase = async (purchaseId: string) => {
    if (!confirm("Cancel this pending purchase?")) return;
    setActioningId(purchaseId);
    try {
      await api.put(`/plans/my-purchases/${purchaseId}/cancel`);
      await refreshUser();
      load();
    } catch (error) {
      alert(getErrorMessage(error));
    } finally {
      setActioningId(null);
    }
  };

  if (loading) return <Spinner label="Loading plans…" />;

  const hasPendingPurchase = purchases.some((p) => p.status === "pending_activation");
  // Once a buyer has ANY purchased plan (pending or active), block buying
  // another until it resolves (activated+expired/refunded, or cancelled).
  const disablePurchasing = hasPendingPurchase || user?.planStatus === "active";

  return (
    <div>
      <h1 className="text-2xl">Assisted Search Plan</h1>
      <p className="mt-1 text-sm text-slate">
        Purchase a plan to have our team actively source and share matching properties with you.
      </p>

      {message && <p className="mt-3 rounded-md bg-paper-dim px-4 py-3 text-sm text-ink">{message}</p>}

      {selectedPlan && (
        <div className="mt-6">
          <PaymentUploadCard plan={selectedPlan} onComplete={handlePaymentComplete} onCancel={() => setSelectedPlan(null)} />
        </div>
      )}

      <p className="eyebrow mb-3 mt-8">Available Plans</p>
      {plans.length === 0 ? (
        <p className="text-sm text-slate">No plans available right now — check back soon.</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <div key={plan._id} className="card flex flex-col p-5">
              <p className="font-display text-lg">{plan.name}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-slate">
                {plan.targetListingType === "both" ? "Buy + Rent" : plan.targetListingType === "rental" ? "For Renting" : "For Buying"}
              </p>
              <p className="mt-2 font-mono text-2xl text-ink">₹{plan.price}</p>
              <ul className="mt-3 flex-1 space-y-1 text-sm text-slate">
                <li>{plan.qualifiedLeadsLimit} curated matches</li>
                <li>{plan.validityDays ? `Valid ${plan.validityDays} days` : "No expiry"}</li>
              </ul>
              <button
                onClick={() => setSelectedPlan(plan)}
                disabled={disablePurchasing}
                className="btn-accent mt-4"
                title={disablePurchasing ? "You already have an active or pending plan" : undefined}
              >
                {hasPendingPurchase ? "Purchase pending" : user?.planStatus === "active" ? "Plan active" : "Purchase"}
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="eyebrow mb-3 mt-10">Purchase History</p>
      {purchases.length === 0 ? (
        <p className="text-sm text-slate">No purchases yet.</p>
      ) : (
        <div className="card divide-y divide-line overflow-hidden">
          {purchases.map((purchase) => (
            <div key={purchase._id} className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-ink">{purchase.planSnapshot.name}</p>
                  <StatusPill status={purchase.status} />
                </div>
                <p className="mt-1 text-sm text-slate">
                  ₹{purchase.planSnapshot.price} · Requested {formatDate(purchase.requestedAt)}
                  {purchase.expiresAt && ` · Expires ${formatDate(purchase.expiresAt)}`}
                </p>
                {purchase.refundStatus !== "none" && (
                  <div className="mt-1 text-xs text-slate">
                    <span className="mr-1">Refund:</span>
                    <StatusPill status={purchase.refundStatus} />
                    {purchase.refundReason && <p className="mt-1 italic">&quot;{purchase.refundReason}&quot;</p>}
                  </div>
                )}
              </div>

              <div className="flex shrink-0 gap-2">
                {purchase.status === "pending_activation" && (
                  <button
                    onClick={() => handleCancelPurchase(purchase._id)}
                    disabled={actioningId === purchase._id}
                    className="btn-outline text-brick hover:border-brick"
                  >
                    Cancel
                  </button>
                )}
                {(purchase.status === "active" || purchase.status === "expired") && purchase.refundStatus === "none" && (
                  <button
                    onClick={() => handleRefundRequest(purchase._id)}
                    disabled={actioningId === purchase._id}
                    className="btn-outline text-brick hover:border-brick"
                  >
                    Request refund
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

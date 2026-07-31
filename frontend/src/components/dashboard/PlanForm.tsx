"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { api, getErrorMessage } from "@/lib/api";
import ImageUpload from "@/components/ImageUpload";
import type { Plan, PlanAudience, TargetListingType } from "@/types";

interface Props {
  mode: "create" | "edit";
  planId?: string;
  initialData?: Plan;
}

export default function PlanForm({ mode, planId, initialData }: Props) {
  const router = useRouter();
  const [name, setName] = useState(initialData?.name || "");
  const [audience, setAudience] = useState<PlanAudience>(initialData?.audience || "seller");
  const [targetListingType, setTargetListingType] = useState<TargetListingType>(
    initialData?.targetListingType || "both"
  );
  const [listingLimit, setListingLimit] = useState(initialData?.listingLimit?.toString() || "");
  const [qualifiedLeadsLimit, setQualifiedLeadsLimit] = useState(initialData?.qualifiedLeadsLimit?.toString() || "");
  const [validityDays, setValidityDays] = useState(initialData?.validityDays?.toString() || "");
  const [price, setPrice] = useState(initialData?.price?.toString() || "");
  const [qrUrl, setQrUrl] = useState(initialData?.paymentQr?.url || "");
  const [upiId, setUpiId] = useState(initialData?.upiId || "");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const payload = {
      name,
      audience,
      targetListingType,
      listingLimit: audience === "seller" ? Number(listingLimit) : 0,
      qualifiedLeadsLimit: Number(qualifiedLeadsLimit),
      validityDays: validityDays ? Number(validityDays) : null,
      price: Number(price),
      paymentQr: qrUrl ? { url: qrUrl } : undefined,
      upiId: upiId || undefined,
    };

    try {
      if (mode === "create") {
        await api.post("/superadmin/plans", payload);
      } else {
        await api.put(`/superadmin/plans/${planId}`, payload);
      }
      router.push("/dashboard/superadmin/plans");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card mt-6 space-y-5 p-6">
      <div>
        <label className="label" htmlFor="name">
          Plan name
        </label>
        <input id="name" required className="input" value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="audience">
            Who this plan is for
          </label>
          <select
            id="audience"
            className="input"
            value={audience}
            onChange={(e) => setAudience(e.target.value as PlanAudience)}
          >
            <option value="seller">Seller (listing plan)</option>
            <option value="buyer">Buyer/Tenant (assisted search)</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="targetListingType">
            Covers
          </label>
          <select
            id="targetListingType"
            className="input"
            value={targetListingType}
            onChange={(e) => setTargetListingType(e.target.value as TargetListingType)}
          >
            <option value="both">Sale + Rental</option>
            <option value="sale">Sale only</option>
            <option value="rental">Rental only</option>
          </select>
        </div>
      </div>

      {audience === "seller" && (
        <div>
          <label className="label" htmlFor="listingLimit">
            Listing limit
          </label>
          <input
            id="listingLimit"
            type="number"
            required
            className="input"
            value={listingLimit}
            onChange={(e) => setListingLimit(e.target.value)}
          />
        </div>
      )}

      <div>
        <label className="label" htmlFor="qualifiedLeadsLimit">
          {audience === "seller" ? "Qualified leads delivered" : "Assisted property matches delivered"}
        </label>
        <input
          id="qualifiedLeadsLimit"
          type="number"
          required
          className="input"
          value={qualifiedLeadsLimit}
          onChange={(e) => setQualifiedLeadsLimit(e.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="validityDays">
            Validity (days){" "}
            <span className="font-normal text-slate-light">(optional — leave blank for no expiry)</span>
          </label>
          <input
            id="validityDays"
            type="number"
            className="input"
            value={validityDays}
            onChange={(e) => setValidityDays(e.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="price">
            Price (₹)
          </label>
          <input
            id="price"
            type="number"
            required
            className="input"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
      </div>

      <div className="border-t border-line pt-5">
        <p className="label mb-1">Payment details</p>
        <p className="mb-4 text-xs text-slate-light">
          Shown to the buyer/seller at purchase time, since payment is offline-only (UPI/bank/cash).
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <ImageUpload label="Payment QR code (optional)" value={qrUrl} onChange={setQrUrl} />
          <div>
            <label className="label" htmlFor="upiId">
              UPI ID (optional)
            </label>
            <input
              id="upiId"
              className="input font-mono text-sm"
              placeholder="yourbusiness@upi"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
            />
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-brick">{error}</p>}

      <button type="submit" disabled={submitting} className="btn-primary">
        {submitting ? "Saving…" : mode === "create" ? "Create plan" : "Save changes"}
      </button>
    </form>
  );
}

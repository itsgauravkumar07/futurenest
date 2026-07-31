"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { api, getErrorMessage } from "@/lib/api";
import type { ListingType } from "@/types";

export default function NewBuyerRequestPage() {
  const router = useRouter();
  const [listingType, setListingType] = useState<ListingType>("rental");
  const [propertyType, setPropertyType] = useState("");
  const [preferredCity, setPreferredCity] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api.post("/buyer-requests", {
        listingType,
        propertyType: propertyType || undefined,
        preferredCity,
        budgetMin: budgetMin ? Number(budgetMin) : undefined,
        budgetMax: budgetMax ? Number(budgetMax) : undefined,
        notes,
      });
      router.push("/dashboard/buyer/requests");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl">Request Assisted Search</h1>
      <p className="mt-1 text-sm text-slate">
        Requires an active assisted-search plan — our team will actively source and share matching
        properties with you.
      </p>

      <form onSubmit={handleSubmit} className="card mt-6 space-y-5 p-6">
        <div>
          <label className="label" htmlFor="listingType">
            Looking to
          </label>
          <select
            id="listingType"
            className="input"
            value={listingType}
            onChange={(e) => setListingType(e.target.value as ListingType)}
          >
            <option value="rental">Rent</option>
            <option value="sale">Buy</option>
          </select>
        </div>

        <div>
          <label className="label" htmlFor="preferredCity">
            Preferred city
          </label>
          <input
            id="preferredCity"
            required
            className="input"
            value={preferredCity}
            onChange={(e) => setPreferredCity(e.target.value)}
          />
        </div>

        <div>
          <label className="label" htmlFor="propertyType">
            Property type (optional)
          </label>
          <input
            id="propertyType"
            placeholder="e.g. 2BHK Flat, PG, Office"
            className="input"
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="budgetMin">
              Budget min ₹
            </label>
            <input
              id="budgetMin"
              type="number"
              className="input"
              value={budgetMin}
              onChange={(e) => setBudgetMin(e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="budgetMax">
              Budget max ₹
            </label>
            <input
              id="budgetMax"
              type="number"
              className="input"
              value={budgetMax}
              onChange={(e) => setBudgetMax(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="notes">
            Anything else we should know?
          </label>
          <textarea
            id="notes"
            rows={4}
            className="input resize-none"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-brick">{error}</p>}

        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? "Submitting…" : "Submit request"}
        </button>
      </form>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import StatusPill from "@/components/StatusPill";
import Spinner from "@/components/Spinner";
import PropertyCard from "@/components/PropertyCard";
import type { BuyerRequest, Property } from "@/types";

export default function BuyerRequestsPage() {
  const [requests, setRequests] = useState<BuyerRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/buyer-requests/mine")
      .then((res) => setRequests(res.data.requests))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner label="Loading your requests…" />;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl">Assisted Search</h1>
        <Link href="/dashboard/buyer/requests/new" className="btn-accent">
          <PlusCircle size={16} /> New Request
        </Link>
      </div>
      <p className="mt-1 text-sm text-slate">
        Tell us what you&apos;re looking for and our team will actively source matching properties for you.
      </p>

      {requests.length === 0 ? (
        <div className="card mt-8 p-12 text-center">
          <p className="text-lg font-medium">No requests yet</p>
          <p className="mt-1 text-sm text-slate">Requires an active assisted-search plan.</p>
          <Link href="/dashboard/buyer/requests/new" className="btn-accent mt-5 inline-flex">
            Submit a request
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {requests.map((request) => (
            <div key={request._id} className="card p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-ink">
                    {request.listingType === "rental" ? "Rental" : "Purchase"} in {request.preferredCity}
                  </p>
                  <StatusPill status={request.status} />
                </div>
                <p className="text-xs text-slate">Submitted {formatDate(request.createdAt)}</p>
              </div>

              <p className="mt-2 text-sm text-slate">
                {request.propertyType && `${request.propertyType} · `}
                {request.budgetMin && request.budgetMax
                  ? `₹${request.budgetMin} – ₹${request.budgetMax}`
                  : request.budgetMax
                  ? `Up to ₹${request.budgetMax}`
                  : ""}
              </p>
              {request.notes && <p className="mt-2 text-sm italic text-slate">&quot;{request.notes}&quot;</p>}

              {request.matchedProperties.length > 0 && (
                <div className="mt-4 border-t border-line pt-4">
                  <p className="eyebrow mb-3">Matched for you</p>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {(request.matchedProperties as Property[]).map((property) => (
                      <PropertyCard key={property._id} property={property} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

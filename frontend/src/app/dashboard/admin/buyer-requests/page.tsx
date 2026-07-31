"use client";

import { useEffect, useState } from "react";
import { api, getErrorMessage } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import StatusPill from "@/components/StatusPill";
import StatusTabs from "@/components/dashboard/StatusTabs";
import Spinner from "@/components/Spinner";
import type { BuyerRequest, User } from "@/types";

const tabs = [
  { value: "new", label: "New" },
  { value: "in_progress", label: "In Progress" },
  { value: "matched", label: "Matched" },
  { value: "closed", label: "Closed" },
];

export default function AdminBuyerRequestsPage() {
  const [status, setStatus] = useState("new");
  const [requests, setRequests] = useState<BuyerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const load = (currentStatus: string) => {
    setLoading(true);
    api
      .get(`/admin/buyer-requests?status=${currentStatus}`)
      .then((res) => setRequests(res.data.requests))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const handleStart = async (id: string) => {
    setActioningId(id);
    try {
      await api.put(`/admin/buyer-requests/${id}/start`);
      load(status);
    } catch (error) {
      alert(getErrorMessage(error));
    } finally {
      setActioningId(null);
    }
  };

  const handleMatch = async (id: string) => {
    const input = prompt("Paste matching Property IDs, comma-separated:");
    if (!input) return;
    const propertyIds = input.split(",").map((s) => s.trim()).filter(Boolean);
    setActioningId(id);
    try {
      const res = await api.put(`/admin/buyer-requests/${id}/match`, { propertyIds });
      if (res.data.warning) alert(res.data.warning);
      load(status);
    } catch (error) {
      alert(getErrorMessage(error));
    } finally {
      setActioningId(null);
    }
  };

  const handleClose = async (id: string) => {
    if (!confirm("Close this request?")) return;
    setActioningId(id);
    try {
      await api.put(`/admin/buyer-requests/${id}/close`);
      load(status);
    } catch (error) {
      alert(getErrorMessage(error));
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl">Buyer Requests</h1>
      <p className="mt-1 text-sm text-slate">Assisted-search requests from buyers and tenants.</p>
      <div className="mt-4">
        <StatusTabs tabs={tabs} active={status} onChange={setStatus} />
      </div>

      {loading ? (
        <Spinner />
      ) : requests.length === 0 ? (
        <p className="mt-8 text-sm text-slate">No {status} requests.</p>
      ) : (
        <div className="card mt-6 divide-y divide-line overflow-hidden">
          {requests.map((request) => {
            const buyer = request.buyer as User;
            return (
              <div key={request._id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-ink">
                      {request.listingType === "rental" ? "Rental" : "Purchase"} in {request.preferredCity}
                    </p>
                    <StatusPill status={request.status} />
                  </div>
                  <p className="mt-1 text-sm text-slate">
                    {request.propertyType && `${request.propertyType} · `}
                    {request.budgetMax ? `Budget up to ₹${request.budgetMax}` : ""} · Submitted{" "}
                    {formatDate(request.createdAt)}
                  </p>
                  <p className="mt-1 text-xs text-slate">
                    Buyer: {buyer?.name} ({buyer?.email}, {buyer?.phone}) · {buyer?.leadsRemaining} matches remaining
                  </p>
                  {request.notes && <p className="mt-1 text-xs italic text-slate">&quot;{request.notes}&quot;</p>}
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  {request.status === "new" && (
                    <button
                      onClick={() => handleStart(request._id)}
                      disabled={actioningId === request._id}
                      className="btn-outline"
                    >
                      Start Sourcing
                    </button>
                  )}
                  {(request.status === "new" || request.status === "in_progress") && (
                    <button
                      onClick={() => handleMatch(request._id)}
                      disabled={actioningId === request._id}
                      className="btn-accent"
                    >
                      Share Matches
                    </button>
                  )}
                  {request.status !== "closed" && (
                    <button
                      onClick={() => handleClose(request._id)}
                      disabled={actioningId === request._id}
                      className="btn-outline text-brick hover:border-brick"
                    >
                      Close
                    </button>
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

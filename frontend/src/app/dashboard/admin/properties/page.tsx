"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye } from "lucide-react";
import { api, getErrorMessage } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import StatusPill from "@/components/StatusPill";
import StatusTabs from "@/components/dashboard/StatusTabs";
import Spinner from "@/components/Spinner";
import type { Property, User } from "@/types";

const tabs = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export default function AdminPropertiesPage() {
  const [status, setStatus] = useState("pending");
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const load = (currentStatus: string) => {
    setLoading(true);
    api
      .get(`/admin/properties?status=${currentStatus}`)
      .then((res) => setProperties(res.data.properties))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const handleApprove = async (id: string) => {
    setActioningId(id);
    try {
      await api.put(`/admin/properties/${id}/approve`);
      load(status);
    } catch (error) {
      alert(getErrorMessage(error));
    } finally {
      setActioningId(null);
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt("Reason for rejection:");
    if (reason === null) return;
    setActioningId(id);
    try {
      await api.put(`/admin/properties/${id}/reject`, { reason });
      load(status);
    } catch (error) {
      alert(getErrorMessage(error));
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl">Properties</h1>
      <div className="mt-4">
        <StatusTabs tabs={tabs} active={status} onChange={setStatus} />
      </div>

      {loading ? (
        <Spinner />
      ) : properties.length === 0 ? (
        <p className="mt-8 text-sm text-slate">No {status} properties.</p>
      ) : (
        <div className="card mt-6 divide-y divide-line overflow-hidden">
          {properties.map((property) => {
            const seller = property.seller as User;
            return (
              <div key={property._id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/admin/properties/${property._id}`}
                      className="font-medium text-ink hover:underline"
                    >
                      {property.title}
                    </Link>
                    <StatusPill status={property.status} />
                  </div>
                  <p className="mt-1 text-sm text-slate">
                    {property.location.city} · {property.listingType === "rental" ? "For Rent" : "For Sale"} ·{" "}
                    {formatPrice(property.price, property.priceUnit)}
                  </p>
                  <p className="mt-1 text-xs text-slate">
                    Seller: {seller?.name} ({seller?.email}, {seller?.phone})
                  </p>
                  {property.rejectionReason && (
                    <p className="mt-1 text-xs text-brick">Rejected: {property.rejectionReason}</p>
                  )}
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  <Link href={`/dashboard/admin/properties/${property._id}`} className="btn-outline">
                    <Eye size={15} /> View Details
                  </Link>
                  {property.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleApprove(property._id)}
                        disabled={actioningId === property._id}
                        className="btn-accent"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(property._id)}
                        disabled={actioningId === property._id}
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

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Pencil, Trash2, PlusCircle } from "lucide-react";
import { api, getErrorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { formatPrice } from "@/lib/utils";
import StatusPill from "@/components/StatusPill";
import Spinner from "@/components/Spinner";
import type { Property } from "@/types";

export default function SellerPropertiesPage() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const canAddProperty = user?.planStatus === "active" && user.listingsRemaining > 0;
  const limitReasonText =
    user?.planStatus !== "active"
      ? "You need an active plan to add a property."
      : "You've used all the listings included in your plan. Upgrade to add more.";

  const load = () => {
    setLoading(true);
    api
      .get("/properties/mine/all")
      .then((res) => setProperties(res.data.properties))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this property? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await api.delete(`/properties/${id}`);
      setProperties((prev) => prev.filter((p) => p._id !== id));
    } catch (error) {
      alert(getErrorMessage(error));
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <Spinner label="Loading your properties…" />;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl">My Properties</h1>
        {canAddProperty ? (
          <Link href="/dashboard/seller/properties/new" className="btn-accent">
            <PlusCircle size={16} /> Add Property
          </Link>
        ) : (
          <button disabled title={limitReasonText} className="btn-accent opacity-50">
            <PlusCircle size={16} /> Add Property
          </button>
        )}
      </div>
      {!canAddProperty && <p className="mt-2 text-sm text-amber">{limitReasonText}</p>}

      {properties.length === 0 ? (
        <div className="card mt-8 p-12 text-center">
          <p className="text-lg font-medium">You haven&apos;t listed anything yet</p>
          <p className="mt-1 text-sm text-slate">Add your first property to start receiving qualified leads.</p>
          {canAddProperty ? (
            <Link href="/dashboard/seller/properties/new" className="btn-accent mt-5 inline-flex">
              Add Property
            </Link>
          ) : (
            <button disabled title={limitReasonText} className="btn-accent mt-5 inline-flex opacity-50">
              Add Property
            </button>
          )}
        </div>
      ) : (
        <div className="card mt-6 divide-y divide-line overflow-hidden">
          {properties.map((property) => (
            <div key={property._id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate font-medium text-ink">{property.title}</p>
                  <StatusPill status={property.status} />
                </div>
                <p className="mt-1 text-sm text-slate">
                  {property.location.city} · {property.listingType === "rental" ? "For Rent" : "For Sale"} ·{" "}
                  {formatPrice(property.price, property.priceUnit)}
                </p>
                {property.status === "rejected" && property.rejectionReason && (
                  <p className="mt-1 text-xs text-brick">Reason: {property.rejectionReason}</p>
                )}
              </div>

              <div className="flex shrink-0 gap-2">
                <Link href={`/dashboard/seller/properties/${property._id}/edit`} className="btn-outline px-3">
                  <Pencil size={15} />
                </Link>
                <button
                  onClick={() => handleDelete(property._id)}
                  disabled={deletingId === property._id}
                  className="btn-outline px-3 text-brick hover:border-brick"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

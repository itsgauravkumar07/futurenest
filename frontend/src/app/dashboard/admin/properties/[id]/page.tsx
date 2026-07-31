"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, BedDouble, Bath, Ruler, MapPin } from "lucide-react";
import { api, getErrorMessage } from "@/lib/api";
import { formatPrice, formatDate } from "@/lib/utils";
import StatusPill from "@/components/StatusPill";
import Spinner from "@/components/Spinner";
import type { Property, User } from "@/types";

export default function AdminPropertyDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [actioning, setActioning] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .get(`/admin/properties/${params.id}`)
      .then((res) => setProperty(res.data.property))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const handleApprove = async () => {
    setActioning(true);
    try {
      await api.put(`/admin/properties/${params.id}/approve`);
      load();
    } catch (error) {
      alert(getErrorMessage(error));
    } finally {
      setActioning(false);
    }
  };

  const handleReject = async () => {
    const reason = prompt("Reason for rejection:");
    if (reason === null) return;
    setActioning(true);
    try {
      await api.put(`/admin/properties/${params.id}/reject`, { reason });
      load();
    } catch (error) {
      alert(getErrorMessage(error));
    } finally {
      setActioning(false);
    }
  };

  if (loading) return <Spinner label="Loading property…" />;
  if (notFound || !property) return <p className="text-sm text-brick">Property not found.</p>;

  const seller = property.seller as User;

  return (
    <div>
      <button onClick={() => router.back()} className="inline-flex items-center gap-1.5 text-sm text-slate hover:text-ink">
        <ArrowLeft size={15} /> Back
      </button>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl">{property.title}</h1>
            <StatusPill status={property.status} />
          </div>
          <p className="mt-1 flex items-center gap-1 text-sm text-slate">
            <MapPin size={14} />
            {property.location.address}, {property.location.city}, {property.location.state}{" "}
            {property.location.pincode}
          </p>
        </div>

        {property.status === "pending" && (
          <div className="flex shrink-0 gap-2">
            <button onClick={handleApprove} disabled={actioning} className="btn-accent">
              Approve
            </button>
            <button onClick={handleReject} disabled={actioning} className="btn-outline text-brick hover:border-brick">
              Reject
            </button>
          </div>
        )}
      </div>

      {property.rejectionReason && (
        <p className="mt-3 rounded-md bg-brick-light px-4 py-3 text-sm text-brick">
          Rejected: {property.rejectionReason}
        </p>
      )}

      {/* Image gallery — all photos, not just the first */}
      {property.images?.length > 0 ? (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {property.images.map((img, i) => (
            <div key={i} className="relative aspect-square overflow-hidden rounded-md border border-line bg-ink-50">
              <Image src={img.url} alt={`${property.title} photo ${i + 1}`} fill className="object-cover" />
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-6 text-sm text-slate-light">No photos uploaded for this property.</p>
      )}

      <div className="mt-8 grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <p className="eyebrow mb-2">Description</p>
          <p className="whitespace-pre-line text-sm text-ink">{property.description}</p>

          <p className="eyebrow mb-2 mt-8">Details</p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-xs text-slate">Listing Type</p>
              <p className="text-sm font-medium text-ink">{property.listingType === "rental" ? "Rental" : "Sale"}</p>
            </div>
            <div>
              <p className="text-xs text-slate">Property Type</p>
              <p className="text-sm font-medium text-ink">{property.propertyType}</p>
            </div>
            <div>
              <p className="text-xs text-slate">Price</p>
              <p className="text-sm font-medium text-ink">{formatPrice(property.price, property.priceUnit)}</p>
            </div>
            <div>
              <p className="text-xs text-slate">Listed</p>
              <p className="text-sm font-medium text-ink">{formatDate(property.createdAt)}</p>
            </div>
          </div>

          {property.specs && (
            <div className="mt-4 flex gap-6 text-sm text-slate">
              {property.specs.bedrooms !== undefined && (
                <span className="flex items-center gap-1.5">
                  <BedDouble size={15} /> {property.specs.bedrooms} bed
                </span>
              )}
              {property.specs.bathrooms !== undefined && (
                <span className="flex items-center gap-1.5">
                  <Bath size={15} /> {property.specs.bathrooms} bath
                </span>
              )}
              {property.specs.areaSqft !== undefined && (
                <span className="flex items-center gap-1.5">
                  <Ruler size={15} /> {property.specs.areaSqft} sqft
                </span>
              )}
            </div>
          )}
        </div>

        <div>
          <p className="eyebrow mb-2">Seller</p>
          <div className="card p-4 text-sm">
            <p className="font-medium text-ink">{seller?.name}</p>
            <p className="mt-1 text-slate">{seller?.email}</p>
            <p className="text-slate">{seller?.phone}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

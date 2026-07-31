"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, getErrorMessage } from "@/lib/api";
import { formatPrice, formatDate } from "@/lib/utils";
import StatusPill from "@/components/StatusPill";
import Spinner from "@/components/Spinner";
import type { Lead, Property } from "@/types";

export default function BuyerLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    api
      .get("/leads/mine")
      .then((res) => setLeads(res.data.leads))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleCancel = async (leadId: string) => {
    if (!confirm("Cancel your interest in this property?")) return;
    setCancellingId(leadId);
    try {
      await api.put(`/leads/${leadId}/cancel`);
      load();
    } catch (error) {
      alert(getErrorMessage(error));
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) return <Spinner label="Loading your interests…" />;

  return (
    <div>
      <h1 className="text-2xl">My Interests</h1>
      <p className="mt-1 text-sm text-slate">Properties you&apos;ve expressed interest in, and where they stand.</p>

      {leads.length === 0 ? (
        <div className="card mt-8 p-12 text-center">
          <p className="text-lg font-medium">No interests yet</p>
          <p className="mt-1 text-sm text-slate">Browse properties and click &quot;I&apos;m Interested&quot; to get started.</p>
          <Link href="/properties" className="btn-accent mt-5 inline-flex">
            Browse properties
          </Link>
        </div>
      ) : (
        <div className="card mt-6 divide-y divide-line overflow-hidden">
          {leads.map((lead) => {
            const property = lead.property as Property;
            return (
              <div key={lead._id} className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Link href={`/properties/${property._id}`} className="truncate font-medium text-ink hover:underline">
                      {property.title}
                    </Link>
                    <StatusPill status={lead.status} />
                  </div>
                  <p className="mt-1 text-sm text-slate">
                    {property.location?.city} · {formatPrice(property.price, property.priceUnit)} · Raised{" "}
                    {formatDate(lead.createdAt)}
                  </p>
                </div>

                {lead.status === "new" && (
                  <button
                    onClick={() => handleCancel(lead._id)}
                    disabled={cancellingId === lead._id}
                    className="btn-outline shrink-0 text-brick hover:border-brick"
                  >
                    Cancel
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

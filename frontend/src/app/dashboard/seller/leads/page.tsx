"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatPrice, formatDate } from "@/lib/utils";
import Spinner from "@/components/Spinner";
import type { Lead, Property, User } from "@/types";

export default function SellerSharedLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/leads/mine/seller?status=shared")
      .then((res) => setLeads(res.data.leads))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner label="Loading shared leads…" />;

  return (
    <div>
      <h1 className="text-2xl">Shared Leads</h1>
      <p className="mt-1 text-sm text-slate">
        Qualified buyers and tenants our team has verified and shared with you for these properties.
      </p>

      {leads.length === 0 ? (
        <div className="card mt-8 p-12 text-center">
          <p className="text-lg font-medium">No shared leads yet</p>
          <p className="mt-1 text-sm text-slate">Once our team qualifies interest on your properties, they'll appear here with contact details.</p>
        </div>
      ) : (
        <div className="card mt-6 divide-y divide-line overflow-hidden">
          {leads.map((lead) => {
            const property = lead.property as Property;
            const buyer = lead.buyer as User;
            return (
              <div key={lead._id} className="p-5">
                <p className="font-medium text-ink">{property?.title}</p>
                <p className="mt-1 text-sm text-slate">
                  {property?.location?.city} · {property && formatPrice(property.price, property.priceUnit)} ·
                  Shared {formatDate(lead.sharedAt)}
                </p>
                <div className="mt-3 rounded-md bg-leaf-light px-4 py-3 text-sm">
                  <p className="font-medium text-leaf">{buyer?.name}</p>
                  <p className="mt-0.5 text-leaf">{buyer?.email} · {buyer?.phone}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

export default function AdminOverviewPage() {
  const [counts, setCounts] = useState({ pendingProperties: 0, newLeads: 0, pendingPlans: 0, newRequests: 0 });

  useEffect(() => {
    Promise.all([
      api.get("/admin/properties/pending"),
      api.get("/admin/leads?status=new"),
      api.get("/admin/plan-purchases?status=pending_activation"),
      api.get("/admin/buyer-requests?status=new"),
    ]).then(([properties, leads, plans, requests]) => {
      setCounts({
        pendingProperties: properties.data.properties.length,
        newLeads: leads.data.leads.length,
        pendingPlans: plans.data.purchases.length,
        newRequests: requests.data.requests.length,
      });
    });
  }, []);

  const cards = [
    { label: "Properties awaiting review", value: counts.pendingProperties, href: "/dashboard/admin/properties" },
    { label: "New leads to action", value: counts.newLeads, href: "/dashboard/admin/leads" },
    { label: "Plan purchases pending activation", value: counts.pendingPlans, href: "/dashboard/admin/plan-purchases" },
    { label: "New assisted-search requests", value: counts.newRequests, href: "/dashboard/admin/buyer-requests" },
  ];

  return (
    <div>
      <h1 className="text-2xl">Admin Overview</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <Link key={card.label} href={card.href} className="card p-6 transition-shadow hover:shadow-lifted">
            <p className="font-mono text-3xl text-ink">{card.value}</p>
            <p className="mt-1 text-sm text-slate">{card.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

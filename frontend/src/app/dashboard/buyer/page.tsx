"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import type { Lead, BuyerRequest } from "@/types";

export default function BuyerOverviewPage() {
  const { user, refreshUser } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [requests, setRequests] = useState<BuyerRequest[]>([]);

  useEffect(() => {
    refreshUser();
    api.get("/leads/mine").then((res) => setLeads(res.data.leads));
    api.get("/buyer-requests/mine").then((res) => setRequests(res.data.requests));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!user) return null;

  return (
    <div>
      <h1 className="text-2xl">Welcome back, {user.name.split(" ")[0]}</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="card p-6">
          <p className="font-mono text-3xl text-ink">{leads.length}</p>
          <p className="mt-1 text-sm text-slate">Properties you&apos;ve shown interest in</p>
        </div>
        <div className="card p-6">
          <p className="font-mono text-3xl text-ink">{requests.length}</p>
          <p className="mt-1 text-sm text-slate">Assisted search requests</p>
        </div>
      </div>

      {user.planStatus === "active" && (
        <div className="card mt-6 p-6">
          <p className="eyebrow">Assisted Search Plan</p>
          <p className="mt-2 font-mono text-2xl text-ink">{user.leadsRemaining} matches remaining</p>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/properties" className="btn-accent">
          Browse properties
        </Link>
        <Link href="/dashboard/buyer/requests/new" className="btn-outline">
          Request assisted search
        </Link>
      </div>
    </div>
  );
}

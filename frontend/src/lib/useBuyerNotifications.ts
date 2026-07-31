"use client";

import { useEffect, useState } from "react";
import { api } from "./api";

export interface BuyerNotifications {
  updatedLeads: number; // interests that moved to qualified/shared since raised
  matchedRequests: number; // assisted-search requests with new matches
  total: number;
}

const empty: BuyerNotifications = { updatedLeads: 0, matchedRequests: 0, total: 0 };

// Fetched once on mount — drives the notification dots on "My Interests"
// (qualified/shared leads) and "Assisted Search" (matched requests).
export function useBuyerNotifications() {
  const [counts, setCounts] = useState<BuyerNotifications>(empty);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([api.get("/leads/mine"), api.get("/buyer-requests/mine")])
      .then(([leadsRes, requestsRes]) => {
        const updatedLeads = leadsRes.data.leads.filter(
          (lead: { status: string }) => lead.status === "qualified" || lead.status === "shared"
        ).length;
        const matchedRequests = requestsRes.data.requests.filter(
          (req: { status: string }) => req.status === "matched"
        ).length;
        setCounts({ updatedLeads, matchedRequests, total: updatedLeads + matchedRequests });
      })
      .catch(() => setCounts(empty))
      .finally(() => setLoaded(true));
  }, []);

  return { ...counts, loaded };
}

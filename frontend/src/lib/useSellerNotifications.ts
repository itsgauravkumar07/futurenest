"use client";

import { useEffect, useState } from "react";
import { api } from "./api";

export interface SellerNotifications {
  sharedLeads: number;
  total: number;
}

const empty: SellerNotifications = { sharedLeads: 0, total: 0 };

// Fetched once on mount — drives the notification dot on the seller
// sidebar's "Shared Leads" section.
export function useSellerNotifications() {
  const [counts, setCounts] = useState<SellerNotifications>(empty);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    api
      .get("/leads/mine/seller?status=shared")
      .then((res) => {
        const sharedLeads = res.data.leads.length;
        setCounts({ sharedLeads, total: sharedLeads });
      })
      .catch(() => setCounts(empty))
      .finally(() => setLoaded(true));
  }, []);

  return { ...counts, loaded };
}

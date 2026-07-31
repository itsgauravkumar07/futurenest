"use client";

import { useEffect, useState } from "react";
import { api } from "./api";

export interface AdminNotifications {
  pendingProperties: number;
  newLeads: number;
  pendingPlanPurchases: number;
  refundRequests: number;
  newBuyerRequests: number;
  total: number;
}

const empty: AdminNotifications = {
  pendingProperties: 0,
  newLeads: 0,
  pendingPlanPurchases: 0,
  refundRequests: 0,
  newBuyerRequests: 0,
  total: 0,
};

// Polls once on mount for counts of anything an admin/superadmin needs to
// act on — drives the notification dots in both dashboards' navigation.
export function useAdminNotifications() {
  const [counts, setCounts] = useState<AdminNotifications>(empty);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get("/admin/properties/pending"),
      api.get("/admin/leads?status=new"),
      api.get("/admin/plan-purchases?status=pending_activation"),
      api.get("/admin/plan-purchases/refund-requests"),
      api.get("/admin/buyer-requests?status=new"),
    ])
      .then(([properties, leads, planPurchases, refunds, requests]) => {
        const pendingProperties = properties.data.properties.length;
        const newLeads = leads.data.leads.length;
        const pendingPlanPurchases = planPurchases.data.purchases.length;
        const refundRequests = refunds.data.purchases.length;
        const newBuyerRequests = requests.data.requests.length;

        setCounts({
          pendingProperties,
          newLeads,
          pendingPlanPurchases,
          refundRequests,
          newBuyerRequests,
          total: pendingProperties + newLeads + pendingPlanPurchases + refundRequests + newBuyerRequests,
        });
      })
      .catch(() => setCounts(empty))
      .finally(() => setLoaded(true));
  }, []);

  return { ...counts, loaded };
}

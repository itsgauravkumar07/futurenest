"use client";

import { useEffect, useState } from "react";
import { api, getErrorMessage } from "@/lib/api";
import { formatPrice, formatDate } from "@/lib/utils";
import StatusPill from "@/components/StatusPill";
import StatusTabs from "@/components/dashboard/StatusTabs";
import Spinner from "@/components/Spinner";
import type { Lead, Property, User } from "@/types";

const tabs = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "shared", label: "Shared" },
  { value: "disqualified", label: "Disqualified" },
];

export default function AdminLeadsPage() {
  const [status, setStatus] = useState("new");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const load = (currentStatus: string) => {
    setLoading(true);
    api
      .get(`/admin/leads?status=${currentStatus}`)
      .then((res) => setLeads(res.data.leads))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const runAction = async (id: string, action: "contact" | "qualify" | "share" | "disqualify", body?: object) => {
    setActioningId(id);
    try {
      const res = await api.put(`/admin/leads/${id}/${action}`, body || {});
      if (res.data.warning) alert(res.data.warning);
      load(status);
    } catch (error) {
      alert(getErrorMessage(error));
    } finally {
      setActioningId(null);
    }
  };

  const handleDisqualify = (id: string) => {
    const reason = prompt("Reason for disqualifying this lead:");
    if (reason === null) return;
    runAction(id, "disqualify", { reason });
  };

  return (
    <div>
      <h1 className="text-2xl">Leads</h1>
      <div className="mt-4">
        <StatusTabs tabs={tabs} active={status} onChange={setStatus} />
      </div>

      {loading ? (
        <Spinner />
      ) : leads.length === 0 ? (
        <p className="mt-8 text-sm text-slate">No {status} leads.</p>
      ) : (
        <div className="card mt-6 divide-y divide-line overflow-hidden">
          {leads.map((lead) => {
            const property = lead.property as Property;
            const buyer = lead.buyer as User;
            const seller = lead.seller as User;
            return (
              <div key={lead._id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-ink">{property?.title}</p>
                    <StatusPill status={lead.status} />
                  </div>
                  <p className="mt-1 text-sm text-slate">
                    {property && formatPrice(property.price, property.priceUnit)} · Raised {formatDate(lead.createdAt)}
                  </p>
                  <p className="mt-1 text-xs text-slate">
                    Buyer: {buyer?.name} ({buyer?.email}, {buyer?.phone})
                  </p>
                  <p className="text-xs text-slate">
                    Seller: {seller?.name} ({seller?.email}, {seller?.phone})
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  {lead.status === "new" && (
                    <>
                      <button
                        onClick={() => runAction(lead._id, "contact")}
                        disabled={actioningId === lead._id}
                        className="btn-outline"
                      >
                        Mark Contacted
                      </button>
                      <button
                        onClick={() => handleDisqualify(lead._id)}
                        disabled={actioningId === lead._id}
                        className="btn-outline text-brick hover:border-brick"
                      >
                        Disqualify
                      </button>
                    </>
                  )}
                  {lead.status === "contacted" && (
                    <>
                      <button
                        onClick={() => runAction(lead._id, "qualify")}
                        disabled={actioningId === lead._id}
                        className="btn-accent"
                      >
                        Qualify
                      </button>
                      <button
                        onClick={() => handleDisqualify(lead._id)}
                        disabled={actioningId === lead._id}
                        className="btn-outline text-brick hover:border-brick"
                      >
                        Disqualify
                      </button>
                    </>
                  )}
                  {lead.status === "qualified" && (
                    <button
                      onClick={() => runAction(lead._id, "share")}
                      disabled={actioningId === lead._id}
                      className="btn-accent"
                    >
                      Mark Shared
                    </button>
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

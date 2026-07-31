"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import PlanForm from "@/components/dashboard/PlanForm";
import Spinner from "@/components/Spinner";
import type { Plan } from "@/types";

export default function EditPlanPage() {
  const params = useParams<{ id: string }>();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api
      .get("/superadmin/plans")
      .then((res) => {
        const found = (res.data.plans as Plan[]).find((p) => p._id === params.id);
        if (found) setPlan(found);
        else setNotFound(true);
      })
      .catch(() => setNotFound(true));
  }, [params.id]);

  if (notFound) return <p className="text-sm text-brick">Plan not found.</p>;
  if (!plan) return <Spinner label="Loading plan…" />;

  return (
    <div>
      <h1 className="text-2xl">Edit Plan</h1>
      <PlanForm mode="edit" planId={plan._id} initialData={plan} />
    </div>
  );
}

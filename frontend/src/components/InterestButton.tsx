"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api, getErrorMessage } from "@/lib/api";

export default function InterestButton({ propertyId }: { propertyId: string }) {
  const { user, isLoading } = useAuth();
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleClick = async () => {
    setStatus("loading");
    try {
      const res = await api.post("/leads", { propertyId });
      setMessage(res.data.message);
      setStatus("done");
    } catch (error) {
      setMessage(getErrorMessage(error));
      setStatus("error");
    }
  };

  if (isLoading) return null;

  // Not logged in — send them to register as a buyer, remembering where to come back to
  if (!user) {
    return (
      <Link href={`/register?role=buyer&redirect=/properties/${propertyId}`} className="btn-accent w-full">
        Log in to express interest
      </Link>
    );
  }

  // Logged in as the wrong role (seller/admin) — this action is buyer-only
  if (user.role !== "buyer") {
    return <p className="text-sm text-slate">Only buyer/tenant accounts can express interest in a property.</p>;
  }

  if (status === "done") {
    return (
      <div className="flex items-center gap-2 rounded-md bg-leaf-light px-4 py-3 text-sm text-leaf">
        <CheckCircle2 size={18} />
        {message}
      </div>
    );
  }

  return (
    <div>
      <button onClick={handleClick} disabled={status === "loading"} className="btn-accent w-full">
        {status === "loading" ? <Loader2 size={16} className="animate-spin" /> : null}
        I&apos;m Interested
      </button>
      {status === "error" && <p className="mt-2 text-sm text-brick">{message}</p>}
    </div>
  );
}

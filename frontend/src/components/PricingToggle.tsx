"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import type { Plan } from "@/types";

export default function PricingToggle({ sellerPlans, buyerPlans }: { sellerPlans: Plan[]; buyerPlans: Plan[] }) {
  const [audience, setAudience] = useState<"seller" | "buyer">("seller");
  const plans = audience === "seller" ? sellerPlans : buyerPlans;

  // If there are 3+ plans, the middle-priced one gets the "highlighted" card
  // treatment — matches the visual pattern without hardcoding a specific plan.
  const highlightIndex = plans.length >= 3 ? Math.floor(plans.length / 2) : -1;

  if (plans.length === 0) return null;

  return (
    <div>
      <div className="mx-auto flex w-fit rounded-md border border-line bg-white p-1">
        <button
          onClick={() => setAudience("seller")}
          className={`rounded px-5 py-2 text-sm font-medium transition-colors ${
            audience === "seller" ? "bg-ink text-paper" : "text-slate"
          }`}
        >
          Sellers &amp; Landlords
        </button>
        <button
          onClick={() => setAudience("buyer")}
          className={`rounded px-5 py-2 text-sm font-medium transition-colors ${
            audience === "buyer" ? "bg-ink text-paper" : "text-slate"
          }`}
        >
          Buyers &amp; Tenants
        </button>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {plans.map((plan, i) => {
          const highlighted = i === highlightIndex;
          return (
            <div
              key={plan._id}
              className={`flex flex-col rounded-lg p-6 ${
                highlighted ? "bg-ink text-paper shadow-lifted" : "card"
              }`}
            >
              {highlighted && (
                <span className="mb-3 w-fit rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-paper">
                  Most Popular
                </span>
              )}
              <p className={`font-display text-lg ${highlighted ? "text-paper" : "text-ink"}`}>{plan.name}</p>
              <p className={`mt-1 font-mono text-3xl ${highlighted ? "text-accent" : "text-ink"}`}>₹{plan.price}</p>

              <ul className={`mt-5 flex-1 space-y-2.5 text-sm ${highlighted ? "text-paper/90" : "text-slate"}`}>
                {plan.audience === "seller" && (
                  <li className="flex items-center gap-2">
                    <Check size={15} className={highlighted ? "text-accent" : "text-leaf"} />
                    {plan.listingLimit} property listings
                  </li>
                )}
                <li className="flex items-center gap-2">
                  <Check size={15} className={highlighted ? "text-accent" : "text-leaf"} />
                  {plan.qualifiedLeadsLimit} {plan.audience === "seller" ? "qualified leads" : "curated matches"}
                </li>
                <li className="flex items-center gap-2">
                  <Check size={15} className={highlighted ? "text-accent" : "text-leaf"} />
                  {plan.validityDays ? `Valid ${plan.validityDays} days` : "Never expires"}
                </li>
                <li className="flex items-center gap-2">
                  <Check size={15} className={highlighted ? "text-accent" : "text-leaf"} />
                  Money-back guarantee
                </li>
              </ul>

              <Link
                href={`/register?role=${plan.audience}`}
                className={highlighted ? "btn-accent mt-6" : "btn-outline mt-6"}
              >
                Get Started
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}

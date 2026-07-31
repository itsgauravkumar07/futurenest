"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function FaqAccordion({ items }: { items: { question: string; answer: string }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="divide-y divide-line border-t border-line">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={item.question}>
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 py-5 text-left"
              aria-expanded={isOpen}
            >
              <span className="text-base font-medium text-ink">{item.question}</span>
              <ChevronDown
                size={18}
                className={`shrink-0 text-slate transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </button>
            {isOpen && <p className="pb-5 pr-8 text-sm leading-relaxed text-slate">{item.answer}</p>}
          </div>
        );
      })}
    </div>
  );
}

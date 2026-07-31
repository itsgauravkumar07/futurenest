"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

export interface DashboardNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  showDot?: boolean;
}

export default function DashboardSidebar({
  items,
  roleLabel,
}: {
  items: DashboardNavItem[];
  roleLabel: string;
}) {
  const pathname = usePathname();

  return (
    <aside className="w-full shrink-0 border-b border-line md:w-56 md:border-b-0 md:border-r">
      <p className="eyebrow px-5 py-4 md:px-6">{roleLabel}</p>
      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:overflow-visible md:px-3">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-md px-3 py-2.5 text-sm transition-colors ${
                active ? "bg-ink text-paper" : "text-ink hover:bg-ink-50"
              }`}
            >
              <span className="relative">
                <item.icon size={16} />
                {item.showDot && (
                  <span
                    className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-accent"
                    aria-label="New activity"
                  />
                )}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

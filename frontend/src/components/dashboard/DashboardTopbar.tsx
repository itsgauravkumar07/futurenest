"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function DashboardTopbar() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <header className="border-b border-line bg-white">
      <div className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="font-display text-lg font-medium text-ink">
          FutureNest
        </Link>

        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-ink">{user.name}</span>
          <button onClick={logout} className="btn-outline">
            <LogOut size={15} />
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}

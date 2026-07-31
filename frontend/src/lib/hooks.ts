"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-context";
import type { Role } from "@/types";

/**
 * Redirects to /login if not authenticated, or to / if logged in as the
 * wrong role. Returns { user, isLoading } — pages should render nothing
 * (or a loading state) while isLoading is true or user is null, to avoid
 * a flash of protected content before the redirect happens.
 */
export function useProtectedRoute(allowedRoles: Role[]) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!allowedRoles.includes(user.role)) {
      router.replace("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isLoading]);

  return { user, isLoading };
}

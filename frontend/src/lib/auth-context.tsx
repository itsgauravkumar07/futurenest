"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { api, getErrorMessage } from "./api";
import type { Role, User } from "@/types";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: { name: string; email: string; password: string; phone?: string; role: Role }) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // On first load, if a token exists, fetch the current user to restore the session.
  useEffect(() => {
    const token = localStorage.getItem("futurenest_token");
    if (!token) {
      setIsLoading(false);
      return;
    }

    api
      .get("/auth/me")
      .then((res) => setUser(res.data.user))
      .catch(() => {
        localStorage.removeItem("futurenest_token");
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("futurenest_token", res.data.token);
      setUser(res.data.user);
      return res.data.user as User;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  };

  const register = async (data: { name: string; email: string; password: string; phone?: string; role: Role }) => {
    try {
      const res = await api.post("/auth/register", data);
      localStorage.setItem("futurenest_token", res.data.token);
      setUser(res.data.user);
      return res.data.user as User;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  };

  const logout = () => {
    localStorage.removeItem("futurenest_token");
    setUser(null);
    router.push("/");
  };

  const refreshUser = async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data.user);
    } catch {
      // token invalid/expired — leave user cleared by the response interceptor
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

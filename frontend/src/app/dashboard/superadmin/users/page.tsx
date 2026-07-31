"use client";

import { useEffect, useState } from "react";
import { api, getErrorMessage } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import Spinner from "@/components/Spinner";
import type { User, Role } from "@/types";

export default function SuperAdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<Role | "">("");
  const [search, setSearch] = useState("");
  const [actioningId, setActioningId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (role) params.set("role", role);
    if (search) params.set("search", search);
    api
      .get(`/superadmin/users?${params.toString()}`)
      .then((res) => setUsers(res.data.users))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    load();
  };

  const toggleStatus = async (user: User) => {
    setActioningId(user._id);
    try {
      await api.put(`/superadmin/users/${user._id}/status`, { isActive: !user.isActive });
      load();
    } catch (error) {
      alert(getErrorMessage(error));
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl">Users</h1>

      <div className="mt-4 flex flex-wrap gap-3">
        <select value={role} onChange={(e) => setRole(e.target.value as Role | "")} className="input w-40">
          <option value="">All roles</option>
          <option value="buyer">Buyer</option>
          <option value="seller">Seller</option>
          <option value="admin">Admin</option>
        </select>
        <form onSubmit={handleSearchSubmit} className="flex flex-1 gap-2">
          <input
            placeholder="Search name or email"
            className="input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn-outline shrink-0">
            Search
          </button>
        </form>
      </div>

      {loading ? (
        <Spinner />
      ) : users.length === 0 ? (
        <p className="mt-8 text-sm text-slate">No users found.</p>
      ) : (
        <div className="card mt-6 divide-y divide-line overflow-hidden">
          {users.map((u) => (
            <div key={u._id} className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-ink">{u.name}</p>
                  <span className="pill pill-neutral">{u.role}</span>
                  {!u.isActive && <span className="pill pill-rejected">Deactivated</span>}
                </div>
                <p className="mt-1 text-sm text-slate">
                  {u.email} · {u.phone} · Joined {formatDate(u.createdAt)}
                </p>
              </div>
              <button
                onClick={() => toggleStatus(u)}
                disabled={actioningId === u._id}
                className={`btn-outline shrink-0 ${u.isActive ? "text-brick hover:border-brick" : ""}`}
              >
                {u.isActive ? "Deactivate" : "Activate"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

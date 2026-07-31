"use client";

import { useEffect, useState, FormEvent } from "react";
import { api, getErrorMessage } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import Spinner from "@/components/Spinner";
import type { User } from "@/types";

export default function SuperAdminAdminsPage() {
  const [admins, setAdmins] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .get("/superadmin/admins")
      .then((res) => setAdmins(res.data.admins))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api.post("/superadmin/admins", { name, email, phone, password });
      setName("");
      setEmail("");
      setPhone("");
      setPassword("");
      setShowForm(false);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner label="Loading admins…" />;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl">Admins</h1>
        <button onClick={() => setShowForm((v) => !v)} className="btn-accent">
          {showForm ? "Cancel" : "New Admin"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card mt-6 space-y-4 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="name">
                Name
              </label>
              <input id="name" required className="input" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="phone">
                Phone
              </label>
              <input id="phone" className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="password">
                Temporary password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          {error && <p className="text-sm text-brick">{error}</p>}
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? "Creating…" : "Create admin account"}
          </button>
        </form>
      )}

      <div className="card mt-6 divide-y divide-line overflow-hidden">
        {admins.map((admin) => (
          <div key={admin._id} className="flex items-center justify-between p-5">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-ink">{admin.name}</p>
                <span className="pill pill-neutral">{admin.role}</span>
                {!admin.isActive && <span className="pill pill-rejected">Deactivated</span>}
              </div>
              <p className="mt-1 text-sm text-slate">
                {admin.email} · {admin.phone} · Joined {formatDate(admin.createdAt)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

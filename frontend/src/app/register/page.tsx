"use client";

import { Suspense, useState, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { dashboardPathFor } from "@/lib/utils";
import type { Role } from "@/types";

function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get("role") === "seller" ? "seller" : "buyer";

  const [role, setRole] = useState<Role>(defaultRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await register({ name, email, password, phone, role });
      router.push(searchParams.get("redirect") || dashboardPathFor(user.role));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    // <div className="container-page flex min-h-[70vh] items-center justify-center py-16">
    //   <div className="card w-full max-w-sm p-8">
    //     <h1 className="text-2xl">Create an account</h1>
    //     <p className="mt-1 text-sm text-slate">Takes less than a minute.</p>

    //     {/* Role toggle */}
    //     <div className="mt-6 grid grid-cols-2 gap-2 rounded-md border border-line bg-paper-dim p-1">
    //       <button
    //         type="button"
    //         onClick={() => setRole("buyer")}
    //         className={`rounded px-3 py-2 text-sm font-medium transition-colors ${
    //           role === "buyer" ? "bg-white text-ink shadow-card" : "text-slate"
    //         }`}
    //       >
    //         Buy / Rent a property
    //       </button>
    //       <button
    //         type="button"
    //         onClick={() => setRole("seller")}
    //         className={`rounded px-3 py-2 text-sm font-medium transition-colors ${
    //           role === "seller" ? "bg-white text-ink shadow-card" : "text-slate"
    //         }`}
    //       >
    //         Sell / List a property
    //       </button>
    //     </div>

    //     <form onSubmit={handleSubmit} className="mt-5 space-y-4">
    //       <div>
    //         <label className="label" htmlFor="name">
    //           Full name
    //         </label>
    //         <input id="name" required className="input" value={name} onChange={(e) => setName(e.target.value)} />
    //       </div>
    //       <div>
    //         <label className="label" htmlFor="email">
    //           Email
    //         </label>
    //         <input
    //           id="email"
    //           type="email"
    //           required
    //           className="input"
    //           value={email}
    //           onChange={(e) => setEmail(e.target.value)}
    //         />
    //       </div>
    //       <div>
    //         <label className="label" htmlFor="phone">
    //           Phone
    //         </label>
    //         <input id="phone" className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
    //       </div>
    //       <div>
    //         <label className="label" htmlFor="password">
    //           Password
    //         </label>
    //         <input
    //           id="password"
    //           type="password"
    //           required
    //           minLength={6}
    //           className="input"
    //           value={password}
    //           onChange={(e) => setPassword(e.target.value)}
    //         />
    //       </div>

    //       {error && <p className="text-sm text-brick">{error}</p>}

    //       <button type="submit" disabled={loading} className="btn-primary w-full">
    //         {loading ? "Creating account…" : "Create account"}
    //       </button>
    //     </form>

    //     <p className="mt-6 text-center text-sm text-slate">
    //       Already have an account?{" "}
    //       <Link href="/login" className="text-accent-dark hover:underline">
    //         Log in
    //       </Link>
    //     </p>
    //   </div>
    // </div>

    <div className="container-page py-12 md:py-20">
  <div className="overflow-hidden rounded-3xl border border-line bg-white shadow-sm lg:grid lg:grid-cols-2">

    {/* Left Image */}

    <div className="relative hidden min-h-[760px] lg:block">

      <Image
        src="/sign-up.jpeg"
        alt="FutureNest"
        fill
        priority
        className="object-cover"
      />

      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/50 to-transparent" />

<div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/10" />

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      <div className="absolute bottom-0 left-0 p-10 text-white">

        <p className="text-sm uppercase tracking-[0.2em] text-white/80">
          Welcome to
        </p>

        <h2 className="mt-4 text-5xl font-semibold text-accent">
          FutureNest
        </h2>

        <p className="mt-5 max-w-sm leading-7 text-white/80">
          Buy, rent and sell verified properties with confidence.
        </p>

        <div className="mt-10 space-y-4">

          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
              ✓
            </div>
            Verified Properties
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
              ✓
            </div>
            Trusted Owners
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
              ✓
            </div>
            Secure Enquiries
          </div>

        </div>

      </div>

    </div>

    {/* Right Form */}

    <div className="p-8 md:p-12">

      <h1 className="text-3xl">
        Create an account
      </h1>

      <p className="mt-2 text-slate">
        Takes less than a minute.
      </p>

      <div className="mt-8 grid grid-cols-2 rounded-xl border border-line bg-paper-dim p-1">

        <button
          type="button"
          onClick={() => setRole("buyer")}
          className={`rounded-lg py-3 text-sm font-medium transition ${
            role === "buyer"
              ? "bg-white shadow-card text-ink"
              : "text-slate"
          }`}
        >
          Buy / Rent
        </button>

        <button
          type="button"
          onClick={() => setRole("seller")}
          className={`rounded-lg py-3 text-sm font-medium transition ${
            role === "seller"
              ? "bg-white shadow-card text-ink"
              : "text-slate"
          }`}
        >
          Sell / List
        </button>

      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-5"
      >

        <div>
          <label className="label">Full name</label>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="label">Email</label>
          <input
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label className="label">Phone</label>
          <input
            className="input"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div>
          <label className="label">Password</label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && (
          <p className="text-sm text-brick">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="btn-primary w-full"
          disabled={loading}
        >
          {loading ? "Creating account..." : "Create account"}
        </button>

      </form>

      <p className="mt-8 text-center text-sm text-slate">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-accent-dark hover:underline"
        >
          Log in
        </Link>
      </p>

    </div>

  </div>
</div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}

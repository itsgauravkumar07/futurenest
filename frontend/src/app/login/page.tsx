"use client";

import { Suspense, useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { dashboardPathFor } from "@/lib/utils";
import Image from "next/image";

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(email, password);
      router.push(searchParams.get("redirect") || dashboardPathFor(user.role));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    // <div className="container-page flex min-h-[70vh] items-center justify-center py-16">
    //   <div className="card w-full max-w-sm p-8">
    //     <h1 className="text-2xl">Log in</h1>
    //     <p className="mt-1 text-sm text-slate">Welcome back to FutureNest.</p>

    //     <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
    //         <label className="label" htmlFor="password">
    //           Password
    //         </label>
    //         <input
    //           id="password"
    //           type="password"
    //           required
    //           className="input"
    //           value={password}
    //           onChange={(e) => setPassword(e.target.value)}
    //         />
    //       </div>

    //       {error && <p className="text-sm text-brick">{error}</p>}

    //       <button type="submit" disabled={loading} className="btn-primary w-full">
    //         {loading ? "Logging in…" : "Log in"}
    //       </button>
    //     </form>

    //     <p className="mt-6 text-center text-sm text-slate">
    //       New to FutureNest?{" "}
    //       <Link href="/register" className="text-accent-dark hover:underline">
    //         Create an account
    //       </Link>
    //     </p>
    //   </div>
    // </div>

    <div className="container-page py-12 md:py-20">
  <div className="overflow-hidden rounded-3xl border border-line bg-white shadow-sm lg:grid lg:grid-cols-2">

    {/* Left Side */}

    <div className="relative hidden min-h-[760px] lg:block">

      <Image
        src="/sign-up.jpeg"
        alt="FutureNest"
        fill
        priority
        className="object-cover"
      />

      {/* Gradient Overlay */}

      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/55 to-transparent" />

      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />

      {/* Content */}

      <div className="absolute bottom-10 left-10 max-w-md text-white">

        <p className="text-sm uppercase tracking-[0.25em] text-white/80">
          Welcome Back
        </p>

        <h1 className="mt-4 text-5xl font-semibold leading-tight text-accent">
          Continue Your
          <br />
          Property Journey
        </h1>

        <p className="mt-6 leading-7 text-white/80">
          Access your saved properties, manage listings, respond to enquiries,
          and continue where you left off.
        </p>

        <div className="mt-10 space-y-5">

          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur">
              ✓
            </div>
            <span>Manage Your Properties</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur">
              ✓
            </div>
            <span>Track Buyer Enquiries</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur">
              ✓
            </div>
            <span>Secure & Verified Platform</span>
          </div>

        </div>

      </div>

    </div>

    {/* Right Side */}

    <div className="flex items-center justify-center p-8 md:p-14">

      <div className="w-full max-w-md">

        <h2 className="text-3xl font-semibold">
          Log in
        </h2>

        <p className="mt-2 text-slate">
          Welcome back to FutureNest.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5"
        >

          <div>
            <label htmlFor="email" className="label">
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
            <div className="mb-2 flex items-center justify-between">

              <label
                htmlFor="password"
                className="label"
              >
                Password
              </label>

              <Link
                href="/forgot-password"
                className="text-sm text-accent-dark hover:underline"
              >
                Forgot password?
              </Link>

            </div>

            <input
              id="password"
              type="password"
              required
              className="input"
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
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>

        </form>

        <div className="my-8 h-px bg-line" />

        <p className="text-center text-sm text-slate">
          New to FutureNest?{" "}
          <Link
            href="/register"
            className="font-medium text-accent-dark hover:underline"
          >
            Create an account
          </Link>
        </p>

      </div>

    </div>

  </div>
</div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

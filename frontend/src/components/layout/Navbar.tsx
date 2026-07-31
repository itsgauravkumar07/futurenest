"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, User as UserIcon } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { dashboardPathFor } from "@/lib/utils";
import Image from "next/image";

const navLinks = [
  { href: "/properties?listingType=sale", label: "Buy" },
  { href: "/properties?listingType=rental", label: "Rent" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const { user, logout, isLoading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
       <Link
          href="/"
          className="font-display text-xl font-medium text-ink flex items-center"
        >
          <Image
            src="/logo.webp"
            alt="FutureNest"
            width={420}
            height={110}
            className="h-11 w-auto"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`text-sm text-ink transition-colors hover:text-accent-dark ${
                pathname === link.href.split("?")[0] ? "text-accent-dark" : ""
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isLoading ? null : user ? (
            <>
              <Link href={dashboardPathFor(user.role)} className="btn-ghost">
                <UserIcon size={16} />
                {user.name.split(" ")[0]}
              </Link>
              <button onClick={logout} className="btn-outline">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost">
                Log in
              </Link>
              <Link href="/register" className="btn-accent">
                Get started
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-line bg-paper md:hidden">
          <nav className="container-page flex flex-col gap-1 py-3">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="rounded px-2 py-2.5 text-sm text-ink hover:bg-ink-50"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-line pt-3">
              {user ? (
                <>
                  <Link href={dashboardPathFor(user.role)} className="btn-ghost justify-start">
                    Dashboard
                  </Link>
                  <button onClick={logout} className="btn-outline justify-start">
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="btn-ghost justify-start">
                    Log in
                  </Link>
                  <Link href="/register" className="btn-accent justify-start">
                    Get started
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

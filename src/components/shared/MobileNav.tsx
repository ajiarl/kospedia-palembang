"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import LogoutButton from "@/components/auth/LogoutButton";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/kos", label: "Cari Kos" },
  { href: "/favorit", label: "Favorit" },
];

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      {open ? (
        <>
          <path d="M6 6l12 12" />
          <path d="M18 6L6 18" />
        </>
      ) : (
        <>
          <path d="M4 7h16" />
          <path d="M4 12h16" />
          <path d="M4 17h16" />
        </>
      )}
    </svg>
  );
}

export default function MobileNav({
  isLoggedIn,
  userEmail,
}: {
  isLoggedIn: boolean;
  userEmail?: string | null;
}) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label={open ? "Tutup menu" : "Buka menu"}
        className={cn(
          "rounded-lg border p-2 shadow-sm backdrop-blur-md transition",
          isHomePage
            ? "border-white/25 bg-white/10 text-white hover:bg-white/20"
            : "border-white/20 bg-white/55 text-foreground/80 hover:bg-white/70"
        )}
      >
        <MenuIcon open={open} />
      </button>

      {open ? (
        <div
          className={cn(
            "absolute inset-x-0 top-14 z-50 px-4 py-4 shadow-lg backdrop-blur-xl",
            isHomePage
              ? "border-b border-white/10 bg-black/80 text-white"
              : "border-b border-white/15 bg-background/80"
          )}
        >
          <nav className="space-y-2">
            {navLinks.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "block rounded-lg px-3 py-2 text-sm font-medium transition",
                    isActive
                      ? isHomePage
                        ? "bg-primary/12 text-primary"
                        : "bg-primary/10 text-primary"
                      : isHomePage
                        ? "text-primary hover:bg-primary/10 hover:text-primary-600"
                        : "text-foreground/75 hover:bg-muted hover:text-foreground"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-4 border-t pt-4">
            {isLoggedIn ? (
              <div className="space-y-3">
                <p className={cn("truncate text-sm", isHomePage ? "text-primary" : "text-muted-foreground")}>
                  {userEmail}
                </p>
                <LogoutButton
                  className={cn(
                    isHomePage
                      ? "border-primary/55 bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary-600"
                      : "hover:bg-muted"
                  )}
                />
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className={cn(
                  "inline-flex rounded-lg px-4 py-2 text-sm font-semibold transition",
                  isHomePage
                    ? "bg-primary text-white hover:bg-primary-600"
                    : "bg-primary text-white hover:bg-primary-600"
                )}
              >
                Masuk
              </Link>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

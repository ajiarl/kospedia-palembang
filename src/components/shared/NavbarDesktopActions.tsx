"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import LogoutButton from "@/components/auth/LogoutButton";
import NavLinks from "@/components/shared/NavLinks";
import { cn } from "@/lib/utils";

export default function NavbarDesktopActions({
  isLoggedIn,
  userEmail,
}: {
  isLoggedIn: boolean;
  userEmail?: string | null;
}) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  return (
    <nav className="hidden items-center gap-5 md:flex">
      <NavLinks />

      {isLoggedIn ? (
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "hidden max-w-28 truncate text-sm sm:inline",
              isHomePage ? "text-primary" : "text-muted-foreground"
            )}
          >
            {userEmail}
          </span>
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
          className={cn(
            "rounded-lg px-4 py-1.5 text-sm font-semibold shadow-sm transition",
            isHomePage
              ? "border border-white/25 bg-white text-primary hover:bg-white/90"
              : "bg-primary text-white hover:bg-primary-600"
          )}
        >
          Masuk
        </Link>
      )}
    </nav>
  );
}

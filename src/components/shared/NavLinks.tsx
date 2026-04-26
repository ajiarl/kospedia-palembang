"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/kos", label: "Cari Kos" },
  { href: "/favorit", label: "Favorit" },
];

export default function NavLinks() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  return (
    <>
      {navLinks.map((link) => {
        const isActive = pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "relative py-1 text-sm font-medium transition-colors",
              isActive
                ? isHomePage
                  ? "text-primary hover:text-primary-600"
                  : "text-primary"
                : isHomePage
                  ? "text-primary hover:text-primary-600"
                  : "text-foreground/70 hover:text-foreground"
            )}
          >
            {link.label}
            {isActive && (
              <span
                className={cn(
                  "absolute -bottom-px left-0 right-0 h-0.5 rounded-full",
                  isHomePage ? "bg-primary" : "bg-primary"
                )}
              />
            )}
          </Link>
        );
      })}
    </>
  );
}

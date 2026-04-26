"use client";

import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export default function NavbarShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        isHomePage
          ? "border-b border-white/10 bg-[#f5f0eb]/18 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl"
          : "border-b border-white/10 bg-[#f5f0eb]/70 shadow-[0_8px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl"
      )}
    >
      {children}
    </header>
  );
}

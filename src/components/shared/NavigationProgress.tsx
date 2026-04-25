"use client";

import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

NProgress.configure({ showSpinner: false, speed: 400, minimum: 0.15 });

export default function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Selesaikan bar saat halaman selesai render
  useEffect(() => {
    NProgress.done();
  }, [pathname, searchParams]);

  // Mulai bar saat link internal diklik
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest("a");
      if (
        target &&
        target.href &&
        target.origin === window.location.origin &&
        !target.hasAttribute("target") &&
        !target.hasAttribute("download")
      ) {
        NProgress.start();
      }
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return null;
}

"use client";

import Link from "next/link";

function HomeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </svg>
  );
}

export default function NavbarBrand() {
  return (
    <Link href="/" className="flex items-center gap-1.5 text-lg font-bold text-primary transition-colors md:text-xl">
      <HomeIcon />
      KosPedia
    </Link>
  );
}

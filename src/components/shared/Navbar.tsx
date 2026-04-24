import Link from "next/link";

import LogoutButton from "@/components/auth/LogoutButton";
import NavLinks from "@/components/shared/NavLinks";
import { getCurrentUser } from "@/lib/auth";

function HomeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
      viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </svg>
  );
}

export default async function Navbar() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md shadow-sm">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-1.5 text-xl font-bold text-primary">
          <HomeIcon />
          KosPedia
        </Link>

        <nav className="flex items-center gap-5">
          <NavLinks />

          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden max-w-40 truncate text-sm text-muted-foreground sm:inline">
                {user.email}
              </span>
              <LogoutButton />
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-primary px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-primary-600"
            >
              Masuk
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

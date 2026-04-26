import Link from "next/link";

import LogoutButton from "@/components/auth/LogoutButton";
import MobileNav from "@/components/shared/MobileNav";
import NavLinks from "@/components/shared/NavLinks";
import NavbarShell from "@/components/shared/NavbarShell";
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
    <NavbarShell>
      <div className="container flex h-14 items-center justify-between gap-3 md:h-16 md:gap-4">
        <Link href="/" className="flex items-center gap-1.5 text-lg font-bold text-primary md:text-xl">
          <HomeIcon />
          KosPedia
        </Link>

        <nav className="hidden items-center gap-5 md:flex">
          <NavLinks />

          {user ? (
            <div className="flex items-center gap-2">
              <span className="hidden max-w-28 truncate text-sm text-muted-foreground lg:inline">
                {user.email}
              </span>
              <LogoutButton />
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-primary px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-600"
            >
              Masuk
            </Link>
          )}
        </nav>

        <MobileNav isLoggedIn={Boolean(user)} userEmail={user?.email} />
      </div>
    </NavbarShell>
  );
}

import Link from "next/link";

import LogoutButton from "@/components/auth/LogoutButton";
import { getCurrentUser } from "@/lib/auth";

export default async function Navbar() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-50 border-b bg-white">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="text-xl font-bold text-primary">
          KosPedia
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/kos" className="transition-colors hover:text-primary">
            Cari Kos
          </Link>
          <Link href="/favorit" className="transition-colors hover:text-primary">
            Favorit
          </Link>
          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden max-w-40 truncate text-muted-foreground sm:inline">
                {user.email}
              </span>
              <LogoutButton />
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-md bg-primary px-4 py-1.5 font-medium text-white transition-colors hover:bg-primary-600"
            >
              Masuk
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

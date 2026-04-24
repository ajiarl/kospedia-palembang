import Link from "next/link";

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="mt-auto border-t bg-card">
      <div className="container py-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-1.5 text-base font-bold text-primary">
              <HomeIcon />
              KosPedia Palembang
            </div>
            <p className="mt-1 max-w-xs text-xs text-muted-foreground">
              Platform pencari kos untuk mahasiswa di sekitar kampus-kampus kota Palembang.
            </p>
          </div>

          {/* Links */}
          <nav className="flex gap-6 text-sm">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Jelajahi</p>
              <div className="flex flex-col gap-1.5">
                <Link href="/kos" className="text-sm text-foreground/70 transition-colors hover:text-foreground">Cari Kos</Link>
                <Link href="/favorit" className="text-sm text-foreground/70 transition-colors hover:text-foreground">Favorit</Link>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Akun</p>
              <div className="flex flex-col gap-1.5">
                <Link href="/login" className="text-sm text-foreground/70 transition-colors hover:text-foreground">Masuk</Link>
                <Link href="/register" className="text-sm text-foreground/70 transition-colors hover:text-foreground">Daftar</Link>
              </div>
            </div>
          </nav>
        </div>

        <div className="mt-6 flex items-center justify-between border-t pt-5 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} KosPedia Palembang. Dibuat untuk mahasiswa.</p>
          <p className="hidden sm:block">Data kos diperbarui secara berkala.</p>
        </div>
      </div>
    </footer>
  );
}

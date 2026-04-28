import Link from "next/link";

import { hasPublicContact, siteProfile } from "@/lib/siteProfile";

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </svg>
  );
}

export default function Footer() {
  const showPublicContact = hasPublicContact();

  return (
    <footer className="mt-auto border-t border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(245,240,235,0.96))]">
      <div className="container py-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-md">
            <div className="flex items-center gap-1.5 text-base font-bold text-primary">
              <HomeIcon />
              KosPedia Palembang
            </div>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Direktori kos mahasiswa yang membantu pencarian area tinggal sekitar kampus-kampus
              Palembang dengan alur yang lebih ringkas, visual, dan langsung ke pemilik.
            </p>
            <p className="mt-3 text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Kurasi listing
            </p>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              {siteProfile.listing.updateSummary}
            </p>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Pendaftaran kos baru dan koreksi data saat ini masih dikurasi manual agar informasi
              yang tampil tetap lebih konsisten.
            </p>
          </div>

          <nav className="grid gap-8 text-sm sm:grid-cols-3">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Jelajahi
              </p>
              <div className="flex flex-col gap-1.5">
                <Link href="/kos" className="text-sm text-foreground/70 transition-colors hover:text-foreground">
                  Cari Kos
                </Link>
                <Link href="/favorit" className="text-sm text-foreground/70 transition-colors hover:text-foreground">
                  Favorit
                </Link>
                <Link href="/faq" className="text-sm text-foreground/70 transition-colors hover:text-foreground">
                  FAQ
                </Link>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Informasi
              </p>
              <div className="flex flex-col gap-1.5">
                <Link href="/tentang" className="text-sm text-foreground/70 transition-colors hover:text-foreground">
                  Tentang Kami
                </Link>
                <Link href="/kontak" className="text-sm text-foreground/70 transition-colors hover:text-foreground">
                  Kontak
                </Link>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Legal
              </p>
              <div className="flex flex-col gap-1.5">
                <Link href="/privasi" className="text-sm text-foreground/70 transition-colors hover:text-foreground">
                  Kebijakan Privasi
                </Link>
                <Link
                  href="/syarat-ketentuan"
                  className="text-sm text-foreground/70 transition-colors hover:text-foreground"
                >
                  Syarat & Ketentuan
                </Link>
                <Link href="/login" className="text-sm text-foreground/70 transition-colors hover:text-foreground">
                  Masuk
                </Link>
              </div>
            </div>
          </nav>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-black/5 pt-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {siteProfile.siteName}. Dibuat untuk mahasiswa.</p>
          <p className="max-w-xl">
            {showPublicContact
              ? "Butuh koreksi data atau ingin mendaftarkan kos? Kunjungi halaman Kontak."
              : "Kanal kontak resmi belum dipublikasikan untuk umum."}
          </p>
        </div>
      </div>
    </footer>
  );
}

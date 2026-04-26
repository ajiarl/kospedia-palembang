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
    <footer className="mt-auto border-t bg-card">
      <div className="container py-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-base font-bold text-primary">
              <HomeIcon />
              KosPedia Palembang
            </div>
            <p className="mt-1 max-w-xs text-xs text-muted-foreground">
              Platform pencari kos untuk mahasiswa di sekitar kampus-kampus kota Palembang.
            </p>
            <p className="mt-2 max-w-sm text-xs text-muted-foreground">
              {siteProfile.listing.updateSummary}
            </p>
            <p className="mt-2 max-w-sm text-xs text-muted-foreground">
              Pendaftaran kos baru dan koreksi data saat ini masih ditangani manual.
              Detail operasional bisa diperbarui dari `src/lib/siteProfile.ts`.
            </p>
          </div>

          <nav className="flex flex-wrap gap-8 text-sm">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
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

        <div className="mt-6 flex items-center justify-between border-t pt-5 text-xs text-muted-foreground">
          <p>&copy; {siteProfile.siteName}. Dibuat untuk mahasiswa.</p>
          <p className="hidden sm:block">
            {showPublicContact
              ? "Butuh koreksi data atau ingin mendaftarkan kos? Kunjungi halaman Kontak."
              : "Kanal kontak resmi belum dipublikasikan. Isi kontak asli di src/lib/siteProfile.ts."}
          </p>
        </div>
      </div>
    </footer>
  );
}

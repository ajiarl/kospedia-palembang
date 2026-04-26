import type { Metadata } from "next";
import Link from "next/link";

import ContentPageShell from "@/components/shared/ContentPageShell";
import { hasPublicContact, siteProfile } from "@/lib/siteProfile";

export const metadata: Metadata = {
  title: "Kontak",
  description:
    "Hubungi KosPedia Palembang untuk melaporkan data kos yang salah, listing palsu, atau mengajukan pembaruan data.",
  alternates: { canonical: "/kontak" },
};

export default function HalamanKontak() {
  const showPublicContact = hasPublicContact();

  return (
    <ContentPageShell
      eyebrow="Kontak"
      title="Laporkan data atau ajukan pembaruan"
      description="Jika menemukan listing yang tidak akurat atau ingin menambahkan informasi baru, kirimkan detailnya agar kami bisa meninjau."
    >
      <p>
        Saat ini komunikasi dan koreksi data dilakukan secara manual. Sertakan nama kos,
        kampus terkait, detail perubahan, dan bukti pendukung jika ada.
      </p>
      <h2>Kapan sebaiknya menghubungi kami?</h2>
      <ul>
        <li>Kontak WhatsApp pemilik tidak valid atau tidak aktif.</li>
        <li>Harga, fasilitas, atau alamat kos tidak sesuai.</li>
        <li>Listing palsu, duplikat, atau sudah tidak tersedia.</li>
        <li>Ingin menambahkan kos baru ke platform.</li>
      </ul>
      <h2>Kanal yang tersedia</h2>
      <p>
        Kanal publik sebaiknya hanya ditampilkan setelah email atau nomor admin benar-benar
        siap dipakai. Karena itu halaman ini tidak lagi memakai contoh kontak fiktif.
      </p>
      {showPublicContact ? (
        <>
          {siteProfile.contact.email ? (
            <p>
              Email: <a href={`mailto:${siteProfile.contact.email}`}>{siteProfile.contact.email}</a>
            </p>
          ) : null}
          {siteProfile.contact.whatsapp ? (
            <p>
              WhatsApp:{" "}
              <a href="https://wa.me/6282180565443" target="_blank" rel="noreferrer">
                {siteProfile.contact.whatsapp}
              </a>
            </p>
          ) : null}
        </>
      ) : (
        <p>
          Kontak publik belum dipublikasikan. Isi data asli di <code>src/lib/siteProfile.ts</code>
          lalu halaman ini akan ikut ter-update.
        </p>
      )}
      <p>
        Kamu juga bisa kembali ke <Link href="/faq">FAQ</Link> untuk melihat jawaban umum
        seputar pencarian kos dan kontribusi data.
      </p>
    </ContentPageShell>
  );
}

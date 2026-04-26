import Link from "next/link";
import type { Metadata } from "next";

import ContentPageShell from "@/components/shared/ContentPageShell";
import { hasPublicContact, siteProfile } from "@/lib/siteProfile";

export const metadata: Metadata = {
  title: "Kebijakan Privasi",
  description:
    "Pelajari data apa yang disimpan KosPedia Palembang, bagaimana data digunakan, dan bagaimana pengguna dapat meminta koreksi.",
  alternates: { canonical: "/privasi" },
};

export default function HalamanPrivasi() {
  const showPublicContact = hasPublicContact();

  return (
    <ContentPageShell
      eyebrow="Privasi"
      title="Kebijakan Privasi"
      description="Kami hanya mengumpulkan data yang dibutuhkan untuk menjalankan fitur inti seperti login, favorit, dan review."
    >
      <h2>Data yang kami simpan</h2>
      <ul>
        <li>Alamat email akun untuk autentikasi.</li>
        <li>Data favorit agar pengguna bisa menyimpan kos pilihan.</li>
        <li>Data review dan rating yang dikirimkan pengguna.</li>
        <li>Data teknis terbatas seperti cookie sesi dan, jika disetujui, data analytics penggunaan situs.</li>
      </ul>
      <h2>Dasar pemrosesan data</h2>
      <p>
        Data akun dan sesi diproses untuk menjalankan layanan inti seperti login, penyimpanan
        favorit, dan pengiriman review. Analytics hanya diaktifkan setelah pengguna memberi
        persetujuan melalui banner consent.
      </p>
      <h2>Penggunaan data</h2>
      <p>
        Data digunakan untuk mengelola sesi login, menampilkan fitur favorit, dan
        mengaitkan review ke akun pengguna yang sah.
      </p>
      <h2>Cookie dan analytics</h2>
      <p>
        Situs ini menggunakan cookie esensial untuk autentikasi Supabase dan kestabilan sesi.
        Jika kamu menerima analytics, kami juga dapat memproses data interaksi seperti pageview,
        klik tombol WhatsApp, aksi favorit, review, dan pemilihan filter kampus untuk analisis
        performa produk.
      </p>
      <p>
        Kamu dapat menolak analytics tanpa kehilangan akses ke fitur inti. Untuk perubahan
        preferensi setelah banner ditutup, hubungi kami lewat <Link href="/kontak">halaman kontak</Link>.
      </p>
      <h2>Berbagi data</h2>
      <p>
        Kami tidak menjual data pengguna. Informasi yang ditampilkan publik terbatas
        pada konten review yang memang pengguna kirimkan ke platform.
      </p>
      <p>
        Untuk kebutuhan infrastruktur, data dapat diproses oleh penyedia layanan yang kami gunakan,
        termasuk Supabase untuk autentikasi/database dan Google Analytics 4 bila analytics diaktifkan.
      </p>
      <h2>Masa simpan data</h2>
      <ul>
        <li>Data akun disimpan selama akun masih aktif atau sampai pengguna meminta penghapusan.</li>
        <li>Data favorit disimpan selama akun aktif atau hingga pengguna menghapusnya.</li>
        <li>Review disimpan sampai pengguna memperbarui, menghapus, atau meminta peninjauan penghapusan.</li>
        <li>Data analytics hanya dikumpulkan setelah consent dan mengikuti retensi bawaan penyedia analytics yang aktif.</li>
      </ul>
      <h2>Hak pengguna</h2>
      <p>
        Pengguna dapat meminta akses, koreksi, pembaruan, atau penghapusan data yang terkait
        dengan akun mereka. Kami akan meninjau permintaan yang masuk sesuai kemampuan operasional
        platform ini.
      </p>
      <h2>Permintaan koreksi atau penghapusan</h2>
      <p>
        Jika ingin mengoreksi data kos, menghapus review, atau meminta peninjauan data
        akun, gunakan halaman kontak agar kami bisa menindaklanjuti.
      </p>
      <p>
        Kontak utama saat ini:{" "}
        <a href={`mailto:${siteProfile.contact.email}`}>{siteProfile.contact.email}</a>
      </p>
      <h2>Catatan kepatuhan</h2>
      <p>
        Kebijakan ini disusun sebagai baseline operasional untuk mendukung kepatuhan privasi,
        termasuk prinsip umum perlindungan data di Indonesia dan consent untuk analytics non-esensial.
        Dokumen ini bukan nasihat hukum formal dan sebaiknya ditinjau ulang jika platform berkembang
        menjadi layanan komersial penuh.
      </p>
      {!showPublicContact ? (
        <p>
          Catatan: kanal kontak publik belum dipublikasikan di aplikasi ini, jadi detail
          permintaan privasi sebaiknya dilengkapi setelah data kontak resmi tersedia.
        </p>
      ) : null}
    </ContentPageShell>
  );
}

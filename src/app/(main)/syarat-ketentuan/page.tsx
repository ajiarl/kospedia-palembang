import type { Metadata } from "next";

import ContentPageShell from "@/components/shared/ContentPageShell";
import { siteProfile } from "@/lib/siteProfile";

export const metadata: Metadata = {
  title: "Syarat dan Ketentuan",
  description:
    "Aturan penggunaan KosPedia Palembang untuk pengguna yang mencari kos, menyimpan favorit, dan mengirim review.",
  alternates: { canonical: "/syarat-ketentuan" },
};

export default function HalamanSyaratKetentuan() {
  return (
    <ContentPageShell
      eyebrow="Aturan Penggunaan"
      title="Syarat dan Ketentuan"
      description="Dengan memakai KosPedia Palembang, pengguna setuju menggunakan platform secara wajar dan tidak menyalahgunakan fitur yang tersedia."
    >
      <h2>Penggunaan akun</h2>
      <p>
        Pengguna bertanggung jawab atas keamanan akun masing-masing dan wajib menjaga
        kerahasiaan akses login.
      </p>
      <h2>Cakupan layanan</h2>
      <p>
        {siteProfile.siteName} menyediakan informasi kos, fitur favorit, dan review untuk membantu
        pengguna mencari tempat tinggal. Platform ini bertindak sebagai penyedia informasi, bukan
        pihak pemilik atau pengelola langsung dari seluruh kos yang ditampilkan.
      </p>
      <h2>Review dan kontribusi</h2>
      <p>
        Review harus berdasarkan pengalaman yang relevan dan tidak boleh memuat konten
        menyesatkan, menyerang pribadi, atau spam.
      </p>
      <h2>Akurasi data kos</h2>
      <p>
        Kami berupaya menjaga akurasi listing, tetapi detail seperti harga, ketersediaan,
        dan kontak tetap perlu dikonfirmasi langsung ke pemilik kos.
      </p>
      <h2>Hak moderasi</h2>
      <p>
        Kami dapat memperbarui, menyembunyikan, atau menghapus data dan konten yang
        dinilai tidak akurat, melanggar aturan, atau merugikan pengguna lain.
      </p>
      <h2>Pembatasan tanggung jawab</h2>
      <p>
        Kami berupaya menjaga informasi tetap berguna, tetapi tidak menjamin semua data selalu lengkap,
        terbaru, atau bebas kesalahan. Pengguna tetap bertanggung jawab melakukan verifikasi akhir
        sebelum melakukan pembayaran, booking, atau keputusan sewa.
      </p>
      <h2>Penggunaan data dan consent</h2>
      <p>
        Dengan menggunakan fitur akun, pengguna memahami bahwa data minimum tertentu diperlukan untuk
        menjalankan autentikasi, favorit, dan review. Analytics non-esensial hanya diaktifkan jika
        pengguna menyetujuinya melalui banner consent.
      </p>
      <h2>Perubahan layanan</h2>
      <p>
        Kami dapat memperbarui fitur, kebijakan, maupun isi halaman legal ini sewaktu-waktu.
        Versi terbaru yang dipublikasikan di situs akan menjadi acuan operasional yang berlaku.
      </p>
      <h2>Kontak</h2>
      <p>
        Pertanyaan terkait penggunaan layanan ini dapat dikirim ke{" "}
        <a href={`mailto:${siteProfile.contact.email}`}>{siteProfile.contact.email}</a>.
      </p>
    </ContentPageShell>
  );
}

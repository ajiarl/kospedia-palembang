import type { Metadata } from "next";
import Link from "next/link";

import ContentPageShell from "@/components/shared/ContentPageShell";
import { siteProfile } from "@/lib/siteProfile";

export const metadata: Metadata = {
  title: "Tentang Kami",
  description:
    "Kenali tujuan KosPedia Palembang, bagaimana data kos dikumpulkan, dan kenapa platform ini dibuat untuk mahasiswa.",
  alternates: { canonical: "/tentang" },
};

export default function HalamanTentang() {
  return (
    <ContentPageShell
      eyebrow="Tentang KosPedia"
      title="Platform kos mahasiswa yang lebih jujur dan praktis"
      description="KosPedia Palembang membantu mahasiswa menemukan kos dekat kampus dengan informasi yang mudah dipahami dan akses kontak langsung ke pemilik."
    >
      <p>
        {siteProfile.siteName} dibuat untuk memudahkan mahasiswa mencari kos tanpa harus
        berpindah-pindah grup chat, peta, dan daftar kontak yang tidak terverifikasi.
      </p>
      <h2>Misi kami</h2>
      <p>
        Kami ingin membuat pencarian kos di Palembang terasa lebih cepat, transparan,
        dan relevan untuk kebutuhan mahasiswa sehari-hari.
      </p>
      <h2>Siapa pengelolanya?</h2>
      <p>
        {siteProfile.operatorName
          ? `${siteProfile.siteName} saat ini dikelola oleh ${siteProfile.operatorName}.`
          : "Identitas pengelola resmi belum dipublikasikan di aplikasi ini."}
      </p>
      <p>{siteProfile.operatorSummary}</p>
      <p>
        Profil pengembang:{" "}
        <a
          href="https://github.com/ajiarl"
          target="_blank"
          rel="noreferrer"
        >
          github.com/ajiarl
        </a>
      </p>
      <h2>Sumber data</h2>
      <p>
        Data kos dapat berasal dari input manual, seed pengembangan, dan sumber lapangan
        yang diperbarui berkala. Jika ada data yang tidak akurat, pengguna dapat
        melaporkannya lewat halaman kontak.
      </p>
      <h2>Kenapa bisa dipercaya</h2>
      <ul>
        <li>Setiap kos ditampilkan dengan alamat, harga, tipe, fasilitas, dan konteks kampus terdekat.</li>
        <li>Pengguna terdaftar dapat menyimpan favorit dan memperbarui review mereka sendiri.</li>
        <li>Informasi operasional yang belum pasti tidak dipalsukan dan ditandai apa adanya.</li>
        <li>Kami terbuka pada koreksi data agar listing tetap relevan dan jujur.</li>
      </ul>
      <p>
        Kalau kamu menemukan data yang keliru atau ingin menambahkan listing baru, lanjut ke{" "}
        <Link href="/kontak">halaman kontak</Link>.
      </p>
    </ContentPageShell>
  );
}

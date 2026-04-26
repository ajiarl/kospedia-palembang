import type { Metadata } from "next";

import ContentPageShell from "@/components/shared/ContentPageShell";
import { hasPublicContact } from "@/lib/siteProfile";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Pertanyaan yang sering muncul tentang cara mencari kos, menyimpan favorit, menulis review, dan mendaftarkan listing.",
  alternates: { canonical: "/faq" },
};

const faqItems = [
  {
    question: "Bagaimana cara mencari kos dekat kampus tertentu?",
    answer:
      "Gunakan pencarian kampus di beranda atau filter kampus di halaman Cari Kos untuk menampilkan listing yang paling relevan.",
  },
  {
    question: "Apakah saya bisa menyimpan kos yang menarik?",
    answer:
      "Bisa. Masuk ke akunmu lalu gunakan tombol favorit pada card atau halaman detail kos.",
  },
  {
    question: "Apakah satu akun bisa menulis banyak review untuk kos yang sama?",
    answer:
      "Tidak. Satu akun hanya memiliki satu review aktif per kos, tetapi review itu bisa diperbarui kapan saja.",
  },
  {
    question: "Bagaimana cara mendaftarkan atau memperbarui data kos?",
    answer:
      "Saat ini pendaftaran listing belum self-service. Gunakan halaman kontak untuk mengirim koreksi, penambahan, atau pembaruan data kos.",
  },
  {
    question: "Bagaimana kalau data kos salah atau kontaknya tidak aktif?",
    answer:
      "Laporkan lewat halaman kontak agar kami bisa meninjau dan memperbarui listing tersebut.",
  },
];

export default function HalamanFaq() {
  const showPublicContact = hasPublicContact();

  return (
    <ContentPageShell
      eyebrow="Bantuan"
      title="Pertanyaan yang Sering Ditanyakan"
      description="Jawaban singkat untuk pertanyaan paling umum dari pengguna KosPedia Palembang."
    >
      {!showPublicContact ? (
        <p>
          Catatan: halaman ini sengaja tidak menampilkan email atau nomor admin fiktif.
          Setelah kontak asli diisi, jawaban terkait pelaporan dan pendaftaran kos bisa
          diarahkan ke kanal tersebut.
        </p>
      ) : null}
      {faqItems.map((item) => (
        <section key={item.question} className="not-prose mb-4 rounded-xl border bg-card p-5 shadow-sm last:mb-0">
          <h2 className="text-base font-semibold">{item.question}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{item.answer}</p>
        </section>
      ))}
    </ContentPageShell>
  );
}

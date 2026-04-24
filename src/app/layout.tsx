import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KosPedia Palembang - Cari Kos Dekat Kampus",
  description:
    "Platform pencari kos untuk mahasiswa di sekitar kampus-kampus kota Palembang.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}

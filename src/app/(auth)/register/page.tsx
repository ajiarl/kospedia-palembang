import { Suspense } from "react";
import type { Metadata } from "next";

import AuthForm from "@/components/auth/AuthForm";

export const metadata: Metadata = {
  title: "Daftar",
  description: "Buat akun KosPedia Palembang untuk menyimpan kos favorit dan membagikan review.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function HalamanRegister() {
  return (
    <Suspense fallback={<div className="rounded-lg bg-white p-6 shadow-sm">Memuat...</div>}>
      <AuthForm mode="register" />
    </Suspense>
  );
}

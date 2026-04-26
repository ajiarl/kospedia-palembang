import { Suspense } from "react";
import type { Metadata } from "next";

import AuthForm from "@/components/auth/AuthForm";

export const metadata: Metadata = {
  title: "Masuk",
  description: "Masuk ke akun KosPedia Palembang untuk menyimpan kos favorit dan memberi review.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function HalamanLogin() {
  return (
    <Suspense fallback={<div className="rounded-lg bg-white p-6 shadow-sm">Memuat...</div>}>
      <AuthForm mode="login" />
    </Suspense>
  );
}

import { Suspense } from "react";

import AuthForm from "@/components/auth/AuthForm";

export default function HalamanRegister() {
  return (
    <Suspense fallback={<div className="rounded-lg bg-white p-6 shadow-sm">Memuat...</div>}>
      <AuthForm mode="register" />
    </Suspense>
  );
}

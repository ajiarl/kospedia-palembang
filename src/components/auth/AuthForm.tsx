"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Mode = "login" | "register";

function getAuthErrorMessage(message: string) {
  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes("invalid login credentials")) {
    return "Email atau password yang kamu masukkan belum cocok.";
  }
  if (normalizedMessage.includes("email not confirmed")) {
    return "Email belum dikonfirmasi. Cek inbox atau folder spam kamu.";
  }
  if (normalizedMessage.includes("user already registered")) {
    return "Email ini sudah terdaftar. Coba masuk atau gunakan email lain.";
  }
  if (normalizedMessage.includes("password should be at least")) {
    return "Password minimal 6 karakter.";
  }
  if (normalizedMessage.includes("unable to validate email address")) {
    return "Format email belum valid.";
  }
  if (normalizedMessage.includes("signup is disabled")) {
    return "Pendaftaran akun sedang dinonaktifkan sementara.";
  }

  return "Terjadi kendala saat memproses akunmu. Coba lagi sebentar.";
}

function KosPediaLogo() {
  return (
    <div className="flex flex-col items-center gap-2 mb-2">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-md">
        <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </svg>
      </div>
      <span className="text-lg font-bold text-primary">KosPedia</span>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

export default function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createSupabaseBrowserClient();
  const next = searchParams.get("next") ?? "/kos";
  const initialError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pesan, setPesan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(initialError);
  const [loading, setLoading] = useState(false);
  const isLogin = mode === "login";

  async function handleEmailAuth(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setPesan(null);

    const result = isLogin
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
          },
        });

    setLoading(false);

    if (result.error) {
      setError(getAuthErrorMessage(result.error.message));
      return;
    }

    if (isLogin) {
      router.replace(next);
      router.refresh();
      return;
    }

    setPesan("Akun dibuat. Cek email jika Supabase meminta konfirmasi akun.");
  }

  async function handleGoogleAuth() {
    setLoading(true);
    setError(null);

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });

    if (oauthError) {
      setError(getAuthErrorMessage(oauthError.message));
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border bg-white p-7 shadow-lg">
      {/* Logo */}
      <KosPediaLogo />

      {/* Heading */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold">{isLogin ? "Selamat datang kembali" : "Buat akun baru"}</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {isLogin
            ? "Masuk untuk menyimpan favorit dan menulis review."
            : "Gratis. Tidak perlu kartu kredit."}
        </p>
      </div>

      {/* Google Button */}
      <button
        type="button"
        onClick={handleGoogleAuth}
        disabled={loading}
        suppressHydrationWarning
        className="flex w-full items-center justify-center gap-3 rounded-xl border px-4 py-2.5 text-sm font-semibold transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
      >
        <GoogleIcon />
        Lanjut dengan Google
      </button>

      {/* Divider */}
      <div className="my-5 flex items-center gap-3 text-xs uppercase text-muted-foreground">
        <div className="h-px flex-1 bg-border" />
        atau dengan email
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Email Form */}
      <form onSubmit={handleEmailAuth} className="space-y-4">
        <div>
          <label htmlFor="email" className="text-sm font-medium">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1.5 w-full rounded-xl border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            placeholder="nama@email.com"
            suppressHydrationWarning
          />
        </div>

        <div>
          <label htmlFor="password" className="text-sm font-medium">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="mt-1.5 w-full rounded-xl border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            placeholder="Minimal 6 karakter"
            suppressHydrationWarning
          />
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-xl border border-destructive/40 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"
          >
            {error}
          </p>
        )}

        {pesan && (
          <p className="rounded-xl border border-primary/30 bg-primary-50 px-3 py-2.5 text-sm text-primary-700">
            {pesan}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          suppressHydrationWarning
          className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.98]"
        >
          {loading ? "Memproses..." : isLogin ? "Masuk" : "Daftar Sekarang"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}{" "}
        <Link
          href={isLogin ? "/register" : "/login"}
          className="font-semibold text-primary hover:underline"
        >
          {isLogin ? "Daftar gratis" : "Masuk"}
        </Link>
      </p>
    </div>
  );
}

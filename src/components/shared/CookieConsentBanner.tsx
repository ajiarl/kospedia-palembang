"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

import { readCookieConsent, saveCookieConsent, subscribeCookieConsent } from "@/lib/consent";

export default function CookieConsentBanner() {
  const consent = useSyncExternalStore(subscribeCookieConsent, readCookieConsent, () => null);

  if (consent) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-[90] border-t bg-background/95 backdrop-blur-md">
      <div className="container flex flex-col gap-3 py-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold">Privasi & Cookies</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Kami memakai cookie esensial untuk login Supabase dan fungsi inti situs. Dengan izinmu,
            kami juga mengaktifkan analytics untuk mengukur penggunaan fitur seperti klik WhatsApp,
            favorit, dan review. Detailnya ada di{" "}
            <Link href="/privasi" className="font-medium text-primary hover:underline">
              Kebijakan Privasi
            </Link>.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              saveCookieConsent("rejected");
            }}
            className="rounded-lg border px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted"
          >
            Tolak analytics
          </button>
          <button
            type="button"
            onClick={() => {
              saveCookieConsent("accepted");
            }}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-600"
          >
            Terima
          </button>
        </div>
      </div>
    </div>
  );
}

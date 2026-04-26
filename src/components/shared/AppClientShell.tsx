"use client";

import { Suspense } from "react";

import AnalyticsProvider from "@/components/shared/AnalyticsProvider";
import CookieConsentBanner from "@/components/shared/CookieConsentBanner";
import NavigationProgress from "@/components/shared/NavigationProgress";

export default function AppClientShell() {
  return (
    <>
      <Suspense fallback={null}>
        <AnalyticsProvider />
      </Suspense>
      <Suspense fallback={null}>
        <NavigationProgress />
      </Suspense>
      <CookieConsentBanner />
    </>
  );
}

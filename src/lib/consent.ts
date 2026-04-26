export const COOKIE_CONSENT_KEY = "kospedia-cookie-consent";

export type CookieConsentStatus = "accepted" | "rejected";

export function readCookieConsent(): CookieConsentStatus | null {
  if (typeof window === "undefined") {
    return null;
  }

  const value = window.localStorage.getItem(COOKIE_CONSENT_KEY);
  return value === "accepted" || value === "rejected" ? value : null;
}

export function saveCookieConsent(status: CookieConsentStatus) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(COOKIE_CONSENT_KEY, status);
  window.dispatchEvent(new CustomEvent("cookie-consent-changed", { detail: status }));
}

export function subscribeCookieConsent(onChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handler = () => onChange();
  window.addEventListener("cookie-consent-changed", handler);
  return () => window.removeEventListener("cookie-consent-changed", handler);
}

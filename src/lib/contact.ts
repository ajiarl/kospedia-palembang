export function normalizeWhatsAppNumber(value: string) {
  const digitsOnly = value.replace(/\D/g, "");

  if (!/^62\d{8,15}$/.test(digitsOnly)) {
    return null;
  }

  return digitsOnly;
}

const fasilitasIcons: Record<string, string> = {
  wifi:
    "M1.41 1.41A19.94 19.94 0 0 0 2 20l2-2a16.94 16.94 0 0 1-.5-14.09L1.41 1.41zm4.24 4.25A13.97 13.97 0 0 0 4 12.01L6 14a11.98 11.98 0 0 1 1.64-7.35L5.65 5.66zm4.24 4.25A8 8 0 0 0 9 12l2 2a6 6 0 0 1 .64-3.1l-1.75-1.99zM12 20a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm7.77-14.34A19.94 19.94 0 0 1 22 12l-2-2a17 17 0 0 0-3.41-10.24l1.18-1.1zm-4.24 4.25A11.98 11.98 0 0 1 17 14l-2-2a9.98 9.98 0 0 0-1.32-5.35l1.85-1.74z",
  ac: "M17 7H7v10h10V7zm-5 9a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm0-6a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83",
  parkir:
    "M5 2h14a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm4 5v10h2v-4h3a3 3 0 0 0 0-6H9zm2 4V9h3a1 1 0 0 1 0 2h-3z",
  dapur:
    "M6.5 3a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 0-.5-.5h-11zM3 7h18v14H3V7zm2 2v10h14V9H5z",
  kasur:
    "M2 12h20M2 7h3a3 3 0 0 1 3 3v2H2V7zm17 0h3v5H16v-2a3 3 0 0 1 3-3zM2 17h20v4H2v-4z",
  lemari: "M5 2h14a2 2 0 0 1 2 2v18H3V4a2 2 0 0 1 2-2zM3 20h18M12 2v18M8 10v4M16 10v4",
  listrik: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  air: "M12 2C6 10 4 14 4 18a8 8 0 0 0 16 0c0-4-2-8-8-16zM9 18a3 3 0 0 1-3-3",
  tv: "M2 7h20v15H2V7zM7 3l5 4 5-4",
  laundry:
    "M12 2a9 9 0 0 1 9 9c0 4.2-2.9 7.7-6.8 8.7L12 22l-2.2-2.3C5.9 18.7 3 15.2 3 11A9 9 0 0 1 12 2zm0 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
  mushola: "M12 2L2 7v2h20V7L12 2zM4 9v10h16V9M8 9v10M16 9v10M12 9v10",
  fallback:
    "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
};

export function getFasilitasIcon(nama: string): string {
  const normalizedName = nama.toLowerCase();

  if (/wi.?fi|internet/i.test(normalizedName)) return fasilitasIcons.wifi;
  if (/\bac\b|pendingin/i.test(normalizedName)) return fasilitasIcons.ac;
  if (/parkir/i.test(normalizedName)) return fasilitasIcons.parkir;
  if (/dapur|kitchen/i.test(normalizedName)) return fasilitasIcons.dapur;
  if (/kasur|tempat.?tidur|bed/i.test(normalizedName)) return fasilitasIcons.kasur;
  if (/lemari|wardrobe/i.test(normalizedName)) return fasilitasIcons.lemari;
  if (/listrik|token/i.test(normalizedName)) return fasilitasIcons.listrik;
  if (/air|shower|kamar.?mandi|km/i.test(normalizedName)) return fasilitasIcons.air;
  if (/\btv\b|televisi/i.test(normalizedName)) return fasilitasIcons.tv;
  if (/laundry|cuci|laundri/i.test(normalizedName)) return fasilitasIcons.laundry;
  if (/mushola|masjid/i.test(normalizedName)) return fasilitasIcons.mushola;

  return fasilitasIcons.fallback;
}

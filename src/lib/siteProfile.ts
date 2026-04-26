import { SITE_NAME } from "@/lib/seo";

export const siteProfile = {
  siteName: SITE_NAME,
  city: "Palembang",
  audience: "mahasiswa",
  operatorName: "Aji Arlando",
  operatorSummary:
    "KosPedia Palembang dibuat oleh Aji Arlando sebagai proyek eksplorasi untuk mempermudah pencarian kos mahasiswa. Walau berawal dari proyek iseng, platform ini dirancang supaya tetap bisa dikembangkan menjadi layanan publik yang lebih serius bila kebutuhannya makin jelas.",
  contact: {
    email: "ajiarlando127@gmail.com",
    whatsapp: "082180565443",
  },
  listing: {
    submissionMode: "manual",
    updateSummary:
      "Data kos ditinjau berkala berdasarkan seed pengembangan, kurasi internal, dan laporan koreksi dari pengguna.",
  },
} as const;

export function hasPublicContact() {
  return Boolean(siteProfile.contact.email || siteProfile.contact.whatsapp);
}

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility wajib shadcn/ui — gabung class Tailwind dengan aman
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format harga ke Rupiah
export function formatRupiah(angka: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka);
}

export const KAMPUS_ALIASES: Record<string, string> = {
  "Universitas Sriwijaya": "Unsri",
  "Universitas Sriwijaya Kampus Palembang": "Unsri Plg",
  "Universitas Muhammadiyah Palembang": "UMP",
  "Politeknik Negeri Sriwijaya": "Polsri",
  "UIN Raden Fatah Palembang": "UIN RF",
  "Universitas MDP": "MDP",
  "Universitas Bina Darma": "Bina Darma",
  "Universitas IBA": "IBA",
};

export function singkatNamaKampus(nama: string): string {
  if (KAMPUS_ALIASES[nama]) return KAMPUS_ALIASES[nama];
  if (nama.length > 20) return `${nama.slice(0, 18)}...`;
  return nama;
}
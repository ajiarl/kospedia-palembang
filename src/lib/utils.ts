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
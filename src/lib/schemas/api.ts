// src/lib/schemas/api.ts

import { z } from "zod";

// ─── Shared ────────────────────────────────────────────────────────────────

const kosIdField = z.string().uuid("kosId harus berupa UUID yang valid");

// ─── /api/favorit POST ─────────────────────────────────────────────────────

export const favoritPostSchema = z.object({
  kosId: kosIdField,
});

export type FavoritPostInput = z.infer<typeof favoritPostSchema>;

// ─── /api/review POST ──────────────────────────────────────────────────────

export const reviewPostSchema = z.object({
  kosId: kosIdField,

  rating: z
    .number({
      message: "Rating harus berupa angka dan wajib diisi",
    })
    .int("Rating harus bilangan bulat")
    .min(1, "Rating minimal 1")
    .max(5, "Rating maksimal 5"),

  komentar: z
    .string()
    .max(500, "Komentar maksimal 500 karakter")
    // Strip control characters, collapse whitespace, trim edges
    .transform((val) =>
      val
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
        .replace(/\s+/g, " ")
        .trim()
    )
    .nullish()
    .transform((val) => val ?? null), // normalise undefined → null
});

export type ReviewPostInput = z.infer<typeof reviewPostSchema>;

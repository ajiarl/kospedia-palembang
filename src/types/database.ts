export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      kampus: {
        Row: {
          id: string;
          nama: string;
          slug: string;
          lat: number;
          lng: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          nama: string;
          slug: string;
          lat: number;
          lng: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          nama?: string;
          slug?: string;
          lat?: number;
          lng?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      kos: {
        Row: {
          id: string;
          kampus_id: string | null;
          nama: string;
          deskripsi: string;
          alamat: string;
          lat: number;
          lng: number;
          harga_min: number;
          harga_max: number;
          jenis: "putra" | "putri" | "campur";
          fasilitas: string[];
          foto: string[];
          kontak: string;
          sumber_data: "manual" | "seed" | "places";
          tersedia: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          kampus_id?: string | null;
          nama: string;
          deskripsi: string;
          alamat: string;
          lat: number;
          lng: number;
          harga_min: number;
          harga_max: number;
          jenis: "putra" | "putri" | "campur";
          fasilitas?: string[];
          foto?: string[];
          kontak: string;
          sumber_data?: "manual" | "seed" | "places";
          tersedia?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          kampus_id?: string | null;
          nama?: string;
          deskripsi?: string;
          alamat?: string;
          lat?: number;
          lng?: number;
          harga_min?: number;
          harga_max?: number;
          jenis?: "putra" | "putri" | "campur";
          fasilitas?: string[];
          foto?: string[];
          kontak?: string;
          sumber_data?: "manual" | "seed" | "places";
          tersedia?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "kos_kampus_id_fkey";
            columns: ["kampus_id"];
            isOneToOne: false;
            referencedRelation: "kampus";
            referencedColumns: ["id"];
          },
        ];
      };
      favorit: {
        Row: {
          id: string;
          user_id: string;
          kos_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          kos_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          kos_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "favorit_kos_id_fkey";
            columns: ["kos_id"];
            isOneToOne: false;
            referencedRelation: "kos";
            referencedColumns: ["id"];
          },
        ];
      };
      review: {
        Row: {
          id: string;
          user_id: string;
          kos_id: string;
          rating: number;
          komentar: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          kos_id: string;
          rating: number;
          komentar?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          kos_id?: string;
          rating?: number;
          komentar?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "review_kos_id_fkey";
            columns: ["kos_id"];
            isOneToOne: false;
            referencedRelation: "kos";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      jenis_kos: "putra" | "putri" | "campur";
      sumber_data_kos: "manual" | "seed" | "places";
    };
    CompositeTypes: Record<string, never>;
  };
};

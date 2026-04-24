// Daftar kampus besar di Palembang beserta koordinat GPS

export interface Kampus {
  id: string;
  nama: string;
  singkatan: string;
  lat: number;
  lng: number;
}

export const DAFTAR_KAMPUS: Kampus[] = [
  {
    id: "unsri",
    nama: "Universitas Sriwijaya",
    singkatan: "Unsri",
    lat: -2.9763,
    lng: 104.6249,
  },
  {
    id: "ump",
    nama: "Universitas Muhammadiyah Palembang",
    singkatan: "UMP",
    lat: -2.9901,
    lng: 104.7561,
  },
  {
    id: "polsri",
    nama: "Politeknik Negeri Sriwijaya",
    singkatan: "Polsri",
    lat: -2.9832,
    lng: 104.7183,
  },
  {
    id: "uin-raden-fatah",
    nama: "UIN Raden Fatah Palembang",
    singkatan: "UIN Raden Fatah",
    lat: -2.9789,
    lng: 104.7512,
  },
  {
    id: "unpal",
    nama: "Universitas Palembang",
    singkatan: "Unpal",
    lat: -2.9712,
    lng: 104.7634,
  },
  {
    id: "stie-mdp",
    nama: "STIE MDP Palembang",
    singkatan: "STIE MDP",
    lat: -2.9853,
    lng: 104.7498,
  },
];

// Koordinat tengah kota Palembang (untuk default view peta)
export const PUSAT_PALEMBANG = {
  lat: -2.9761,
  lng: 104.7754,
  zoom: 13,
};
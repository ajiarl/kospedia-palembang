-- Bootstrap seed awal untuk development lokal.
-- Data aktif aplikasi sekarang dikelola manual di Supabase, jadi file ini
-- tidak selalu identik dengan isi database terbaru.

insert into public.kampus (nama, slug, lat, lng) values
  ('Universitas Sriwijaya Kampus Palembang', 'unsri-palembang', -2.9763, 104.7249),
  ('Universitas Muhammadiyah Palembang', 'ump', -2.9901, 104.7561),
  ('Politeknik Negeri Sriwijaya', 'polsri', -2.9832, 104.7183),
  ('UIN Raden Fatah Palembang', 'uin-raden-fatah', -2.9789, 104.7512),
  ('Universitas MDP', 'mdp', -2.9853, 104.7498)
on conflict (slug) do nothing;

insert into public.kos (
  kampus_id,
  slug,
  nama,
  deskripsi,
  alamat,
  lat,
  lng,
  harga_min,
  harga_max,
  jenis,
  fasilitas,
  foto,
  kontak,
  sumber_data
)
select
  kampus.id,
  data.slug,
  data.nama,
  data.deskripsi,
  data.alamat,
  data.lat,
  data.lng,
  data.harga_min,
  data.harga_max,
  data.jenis::public.jenis_kos,
  data.fasilitas,
  data.foto,
  data.kontak,
  'seed'::public.sumber_data_kos
from (
  values
    (
      'polsri',
      'kos-bukit-ceria',
      'Kos Bukit Ceria',
      'Kos nyaman untuk mahasiswa dengan akses cepat ke area Bukit Besar dan Polsri.',
      'Jl. Srijaya Negara, Bukit Besar, Palembang',
      -2.9841,
      104.7193,
      650000,
      850000,
      'putra',
      array['wifi', 'kamar mandi luar', 'parkir motor', 'dapur bersama'],
      array[]::text[],
      '6281234567801'
    ),
    (
      'polsri',
      'kos-putri-lunjuk-jaya',
      'Kos Putri Lunjuk Jaya',
      'Kos putri dengan lingkungan tenang, cocok untuk mahasiswa yang ingin dekat kampus.',
      'Jl. Lunjuk Jaya, Bukit Lama, Palembang',
      -2.9895,
      104.7165,
      750000,
      1100000,
      'putri',
      array['wifi', 'ac', 'kamar mandi dalam', 'laundry sekitar'],
      array[]::text[],
      '6281234567802'
    ),
    (
      'ump',
      'kos-ahmad-yani-residence',
      'Kos Ahmad Yani Residence',
      'Pilihan kos campur dekat koridor utama Plaju dengan akses transportasi mudah.',
      'Jl. Jenderal Ahmad Yani, 13 Ulu, Palembang',
      -2.993,
      104.7582,
      700000,
      1200000,
      'campur',
      array['wifi', 'ac', 'parkir motor', 'akses 24 jam'],
      array[]::text[],
      '6281234567803'
    ),
    (
      'uin-raden-fatah',
      'kos-putra-sudirman',
      'Kos Putra Sudirman',
      'Kos sederhana dekat pusat kota dan akses angkot ke area kampus.',
      'Jl. Jend. Sudirman, Palembang',
      -2.9768,
      104.7522,
      550000,
      800000,
      'putra',
      array['wifi', 'kipas angin', 'parkir motor'],
      array[]::text[],
      '6281234567804'
    ),
    (
      'mdp',
      'kos-mdp-executive',
      'Kos MDP Executive',
      'Kos modern dengan kamar mandi dalam dan akses cepat ke area Rajawali.',
      'Jl. Rajawali, Palembang',
      -2.9844,
      104.7506,
      1200000,
      1800000,
      'campur',
      array['wifi', 'ac', 'kamar mandi dalam', 'meja belajar', 'cctv'],
      array[]::text[],
      '6281234567805'
    ),
    (
      'unsri-palembang',
      'kos-bukit-lama-hemat',
      'Kos Bukit Lama Hemat',
      'Kos ekonomis untuk mahasiswa yang mencari kamar bersih dengan harga terjangkau.',
      'Jl. Padang Selasa, Bukit Lama, Palembang',
      -2.9792,
      104.7237,
      500000,
      700000,
      'putri',
      array['wifi', 'kipas angin', 'dapur bersama'],
      array[]::text[],
      '6281234567806'
    )
) as data(
  kampus_slug,
  slug,
  nama,
  deskripsi,
  alamat,
  lat,
  lng,
  harga_min,
  harga_max,
  jenis,
  fasilitas,
  foto,
  kontak
)
join public.kampus on kampus.slug = data.kampus_slug;

create extension if not exists "pgcrypto";

create type public.jenis_kos as enum ('putra', 'putri', 'campur');
create type public.sumber_data_kos as enum ('manual', 'seed', 'places');

create table public.kampus (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  slug text not null unique,
  lat double precision not null,
  lng double precision not null,
  created_at timestamptz not null default now()
);

create table public.kos (
  id uuid primary key default gen_random_uuid(),
  kampus_id uuid references public.kampus(id) on delete set null,
  slug text not null unique,
  nama text not null,
  deskripsi text not null,
  alamat text not null,
  lat double precision not null,
  lng double precision not null,
  harga_min integer not null check (harga_min >= 0),
  harga_max integer not null check (harga_max >= harga_min),
  jenis public.jenis_kos not null,
  fasilitas text[] not null default '{}',
  foto text[] not null default '{}',
  kontak text not null,
  sumber_data public.sumber_data_kos not null default 'manual',
  tersedia boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.favorit (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kos_id uuid not null references public.kos(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, kos_id)
);

create table public.review (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kos_id uuid not null references public.kos(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  komentar text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, kos_id)
);

create index kampus_slug_idx on public.kampus(slug);
create index kos_slug_idx on public.kos(slug);
create index kos_kampus_id_idx on public.kos(kampus_id);
create index kos_jenis_idx on public.kos(jenis);
create index kos_harga_idx on public.kos(harga_min, harga_max);
create index favorit_user_id_idx on public.favorit(user_id);
create index review_kos_id_idx on public.review(kos_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger kos_set_updated_at
before update on public.kos
for each row execute function public.set_updated_at();

create trigger review_set_updated_at
before update on public.review
for each row execute function public.set_updated_at();

alter table public.kampus enable row level security;
alter table public.kos enable row level security;
alter table public.favorit enable row level security;
alter table public.review enable row level security;

create policy "Kampus bisa dibaca publik"
on public.kampus for select
using (true);

create policy "Kos tersedia bisa dibaca publik"
on public.kos for select
using (tersedia = true);

create policy "User bisa membaca favorit sendiri"
on public.favorit for select
using (auth.uid() = user_id);

create policy "User bisa menambah favorit sendiri"
on public.favorit for insert
with check (auth.uid() = user_id);

create policy "User bisa menghapus favorit sendiri"
on public.favorit for delete
using (auth.uid() = user_id);

create policy "Review bisa dibaca publik"
on public.review for select
using (true);

create policy "User bisa menulis review sendiri"
on public.review for insert
with check (auth.uid() = user_id);

create policy "User bisa mengubah review sendiri"
on public.review for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "User bisa menghapus review sendiri"
on public.review for delete
using (auth.uid() = user_id);

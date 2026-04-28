alter table public.kos
  add column if not exists geocode_confidence text
    check (geocode_confidence in ('exact', 'approximate', 'area', 'needs_review')),
  add column if not exists geocoded_address text,
  add column if not exists geocode_updated_at timestamptz;

create table if not exists public.kos_geocode_staging (
  id uuid primary key references public.kos(id) on delete cascade,
  lat double precision not null,
  lng double precision not null,
  confidence text not null
    check (confidence in ('exact', 'approximate', 'area', 'needs_review')),
  geocoded_address text,
  geocode_source text,
  top_score integer,
  consensus_dist_m integer,
  top_type text,
  reason text,
  reviewed boolean not null default false,
  reviewed_by text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_kos_geocode_confidence
  on public.kos (geocode_confidence);

create index if not exists idx_kos_staging_reviewed
  on public.kos_geocode_staging (reviewed);

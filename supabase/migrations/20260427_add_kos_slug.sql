create extension if not exists "pgcrypto";

alter table public.kos
add column if not exists slug text;

with base as (
  select
    id,
    trim(both '-' from regexp_replace(lower(nama), '[^a-z0-9]+', '-', 'g')) as base_slug
  from public.kos
),
ranked as (
  select
    id,
    case
      when coalesce(base_slug, '') = '' then 'kos'
      else base_slug
    end as normalized_slug,
    row_number() over (
      partition by case
        when coalesce(base_slug, '') = '' then 'kos'
        else base_slug
      end
      order by id
    ) as slug_rank
  from base
)
update public.kos
set slug = case
  when ranked.slug_rank = 1 then ranked.normalized_slug
  else ranked.normalized_slug || '-' || left(public.kos.id::text, 8)
end
from ranked
where public.kos.id = ranked.id
  and public.kos.slug is null;

alter table public.kos
alter column slug set not null;

create unique index if not exists kos_slug_idx on public.kos(slug);

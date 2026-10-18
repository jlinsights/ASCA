-- Additive archive foundation. Roll back with a forward migration; never drop archive data.
create function public.is_archive_path(value text) returns boolean
language sql immutable set search_path = '' as $$
  select value is null or (value <> '' and value !~ '(^/|:|[?#%])' and position(chr(92) in value) = 0
    and value !~ '(^|/)\.\.?(/|$)' and value !~ '//');
$$;

alter table public.artists
  add column art_name_ko text,
  add column art_name_hanja text,
  add column calligraphy_styles text[] not null default '{}',
  add column teacher_artist_id uuid references public.artists(id) on delete set null,
  add column teacher_name text,
  add column branch_name text,
  add column certification_grade text,
  add column certified_at date,
  add column archive_bio text,
  add column archive_bio_en text,
  add column profile_image_path text check (public.is_archive_path(profile_image_path)),
  add column visibility text not null default 'public' check (visibility in ('public','members','hidden')),
  add column claimed_by_user_id text,
  add constraint artists_teacher_not_self check (teacher_artist_id is distinct from id);
create index idx_artists_teacher on public.artists(teacher_artist_id);
create index idx_artists_claimed_by on public.artists(claimed_by_user_id);
create index idx_artists_visibility on public.artists(visibility);

create table public.artist_contacts (
  artist_id uuid primary key references public.artists(id) on delete cascade,
  email text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.artist_contacts enable row level security;
revoke all on public.artist_contacts from public, anon, authenticated;
grant all on public.artist_contacts to service_role;
create trigger update_artist_contacts_updated_at before update on public.artist_contacts
for each row execute function public.update_updated_at_column();

alter table public.artworks
  add column title_hanja text,
  add column transcription text,
  add column interpretation text,
  add column interpretation_en text,
  add column source_text text,
  add column seal_description text,
  add column width_cm numeric(10,2) check (width_cm > 0),
  add column height_cm numeric(10,2) check (height_cm > 0),
  add column created_by text not null default 'admin' check (created_by in ('artist','admin')),
  add constraint artworks_id_artist_unique unique (id, artist_id);

create table public.artwork_images (
  id uuid primary key default gen_random_uuid(),
  artwork_id uuid not null references public.artworks(id) on delete cascade,
  thumb_path text not null check (public.is_archive_path(thumb_path)),
  web_path text not null check (public.is_archive_path(web_path)),
  original_path text not null check (public.is_archive_path(original_path)),
  sort_order integer not null default 0 check (sort_order >= 0),
  is_primary boolean not null default false,
  width integer not null check (width > 0),
  height integer not null check (height > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_artwork_images_order on public.artwork_images(artwork_id, sort_order);
create unique index idx_artwork_images_primary on public.artwork_images(artwork_id) where is_primary;
create trigger update_artwork_images_updated_at before update on public.artwork_images
for each row execute function public.update_updated_at_column();

create table public.artist_records (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.artists(id) on delete cascade,
  artwork_id uuid,
  record_type text not null check (record_type in ('award','exhibition','submission','certification')),
  title text not null,
  organizer text,
  year integer check (year between 1000 and 9999),
  award_level text,
  is_asca_verified boolean not null default false,
  source text not null default 'self_reported' check (source in ('asca_archive','self_reported','admin')),
  contest_ref text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (artwork_id, artist_id) references public.artworks(id, artist_id)
    on delete set null (artwork_id)
);
create index idx_artist_records_artist_year on public.artist_records(artist_id, year desc);
create index idx_artist_records_artwork on public.artist_records(artwork_id);
create trigger update_artist_records_updated_at before update on public.artist_records
for each row execute function public.update_updated_at_column();

alter table public.events
  add column exhibition_id uuid references public.exhibitions(id) on delete set null,
  add column luma_url text check (luma_url is null or luma_url ~ '^https://(lu\.ma|luma\.com)/[^[:space:]]+$'),
  add column luma_visibility text not null default 'hidden' check (luma_visibility in ('public','members','hidden'));
alter table public.events drop constraint events_event_type_check;
alter table public.events add constraint events_event_type_check check
  (event_type in ('workshop','lecture','competition','exhibition','ceremony','meeting','other','viewing','opening','award_ceremony'));
create index idx_events_exhibition on public.events(exhibition_id, event_date);

-- Replace permissive policies, rather than adding another OR-ed SELECT policy.
drop policy artists_public_read on public.artists;
create policy artists_public_read on public.artists for select to anon, authenticated
using (visibility = 'public');
drop policy artworks_public_read on public.artworks;
create policy artworks_public_read on public.artworks for select to anon, authenticated
using (status = 'published' and exists
  (select 1 from public.artists a where a.id = artist_id and a.visibility = 'public'));
alter table public.artwork_images enable row level security;
create policy artwork_images_public_read on public.artwork_images for select to anon, authenticated
using (exists (select 1 from public.artworks a where a.id = artwork_id and a.status = 'published'));
alter table public.artist_records enable row level security;
create policy artist_records_public_read on public.artist_records for select to anon, authenticated
using (exists (select 1 from public.artists a where a.id = artist_id and a.visibility = 'public')
  and (artwork_id is null or exists
    (select 1 from public.artworks w where w.id = artwork_id and w.status = 'published')));
drop policy exhibition_artists_public_read on public.exhibition_artists;
create policy exhibition_artists_public_read on public.exhibition_artists for select to anon, authenticated
using (exists (select 1 from public.exhibitions e where e.id = exhibition_id and e.is_published)
  and exists (select 1 from public.artists a where a.id = artist_id and a.visibility = 'public'));
drop policy exhibition_artworks_public_read on public.exhibition_artworks;
create policy exhibition_artworks_public_read on public.exhibition_artworks for select to anon, authenticated
using (exists (select 1 from public.exhibitions e where e.id = exhibition_id and e.is_published)
  and exists (select 1 from public.artworks w where w.id = artwork_id and w.status = 'published'));

-- No client writes, even when a Clerk account has been claimed.
revoke insert, update, delete, truncate, references, trigger on public.artists, public.artworks,
  public.artwork_images, public.artist_records from anon, authenticated;
grant all on public.artwork_images, public.artist_records to service_role;
grant select on public.artist_records to anon, authenticated;
-- Original object keys are server-only, not just hidden by a UI mapper.
revoke select on public.artwork_images from public, anon, authenticated;
grant select (id, artwork_id, thumb_path, web_path, sort_order, is_primary, width, height,
  created_at, updated_at) on public.artwork_images to anon, authenticated;

-- Hide restricted Luma links from direct table reads. The fixed projection below
-- intentionally uses a definer view to mask this column, with an explicit row predicate.
revoke select on public.events from public, anon, authenticated;
grant select (id,title,description,content,event_date,end_date,location,venue,organizer,
  featured_image_url,gallery_images,event_type,status,is_featured,is_published,views,
  max_participants,current_participants,registration_fee,registration_required,
  registration_deadline,contact_email,contact_phone,created_at,updated_at,search_vector,
  exhibition_id,luma_visibility) on public.events to anon, authenticated;
create view public.public_events with (security_barrier = true) as
select id,title,description,content,event_date,end_date,location,venue,organizer,
  featured_image_url,gallery_images,event_type,status,is_featured,is_published,views,
  max_participants,current_participants,registration_fee,registration_required,
  registration_deadline,contact_email,contact_phone,created_at,updated_at,search_vector,
  exhibition_id,luma_visibility,case when luma_visibility = 'public' then luma_url else null end as luma_url
from public.events where is_published = true;
revoke all on public.public_events from public, anon, authenticated;
grant select on public.public_events to anon, authenticated, service_role;

-- Published timestamps also work on INSERT and null -> published transitions.
create or replace function public.set_artwork_published_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.status = 'published' and new.published_at is null then
    new.published_at = now();
  end if;
  return new;
end;
$$;
drop trigger set_artwork_published on public.artworks;
create trigger set_artwork_published before insert or update on public.artworks
for each row execute function public.set_artwork_published_at();

insert into storage.buckets(id,name,public) values
  ('archive-public','archive-public',true),('archive-private','archive-private',false)
on conflict(id) do update set public = excluded.public;
-- No storage.objects client write/read policies for these buckets. Public object
-- downloads bypass RLS by design; only published derivatives may be copied there.

-- Restrictive guard also blocks any pre-existing permissive Storage policies.
create policy archive_storage_server_only on storage.objects as restrictive
for all to anon, authenticated
using (bucket_id not in ('archive-public','archive-private'))
with check (bucket_id not in ('archive-public','archive-private'));

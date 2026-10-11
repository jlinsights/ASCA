-- ASCA-2026(caxjyimsuvjnbmjoxfad) 공개 CMS 테이블 — 빈 테이블로 시작한다.
--
-- 옛 프로젝트(fiaoduraycyjselasmdn)는 복구 불가이고, 2025-07 덤프에도 이 테이블들의 데이터는 없었다.
-- 아래는 20240101000003 / 20251226_create_artworks_table / 20251226_enhance_exhibitions_system 을
-- 이 프로젝트에 맞게 고쳐 합친 것이다. 원본과 다른 점:
--   1. 작가 FK 는 auth.users 가 아니라 public.artists(id) — 앱 로그인은 Clerk 라 auth.users 는 비어 있다.
--   2. 관리자 정책(raw_user_meta_data->>'role' = 'admin')은 넣지 않는다. user_metadata 는 사용자가 스스로
--      고칠 수 있어 권한 판단에 쓰면 안 된다. 쓰기는 서버의 service_role(RLS 우회)만 한다.
--   3. 텍스트 검색 설정 'korean' 은 Postgres 에 없어 생성 열이 만들어지지 않는다 → 'simple'.
--   4. exhibition_details 뷰의 json_agg(DISTINCT … ORDER BY …) 는 Postgres 에서 오류 → DISTINCT 제거.
--   5. 뷰는 security_invoker 로 만들어 기반 테이블의 RLS 를 그대로 따른다.

-- ── 공용 트리거 함수 ───────────────────────────────────────────
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── 공지 ──────────────────────────────────────────────────────
create table public.notices (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  excerpt text,
  category text not null default 'general',
  is_pinned boolean default false,
  is_published boolean default true,
  views integer default 0,
  author_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  published_at timestamptz default now(),
  search_vector tsvector generated always as (
    to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(content, '') || ' ' || coalesce(category, ''))
  ) stored
);

create table public.notice_comments (
  id uuid primary key default gen_random_uuid(),
  notice_id uuid references public.notices(id) on delete cascade,
  author_name text,
  content text not null,
  is_approved boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── 전시 ──────────────────────────────────────────────────────
create table public.exhibitions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  description text not null,
  content text,
  start_date date not null,
  end_date date not null,
  location text,
  venue text,
  curator text,
  featured_image_url text,
  gallery_images text[],
  status text default 'upcoming' check (status in ('upcoming', 'current', 'past')),
  is_featured boolean default false,
  is_published boolean default true,
  views integer default 0,
  max_capacity integer,
  current_visitors integer default 0,
  ticket_price numeric(10, 2),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  search_vector tsvector generated always as (
    to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(subtitle, '') || ' ' || coalesce(description, '') || ' ' || coalesce(curator, ''))
  ) stored
);

-- ── 행사 ──────────────────────────────────────────────────────
create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  content text,
  event_date timestamptz not null,
  end_date timestamptz,
  location text,
  venue text,
  organizer text,
  featured_image_url text,
  gallery_images text[],
  event_type text default 'workshop' check (event_type in ('workshop', 'lecture', 'competition', 'exhibition', 'ceremony', 'meeting', 'other')),
  status text default 'upcoming' check (status in ('upcoming', 'ongoing', 'completed', 'cancelled')),
  is_featured boolean default false,
  is_published boolean default true,
  views integer default 0,
  max_participants integer,
  current_participants integer default 0,
  registration_fee numeric(10, 2),
  registration_required boolean default false,
  registration_deadline timestamptz,
  contact_email text,
  contact_phone text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  search_vector tsvector generated always as (
    to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(organizer, '') || ' ' || coalesce(event_type, ''))
  ) stored
);

-- ── 작품 ──────────────────────────────────────────────────────
create type public.artwork_category as enum (
  'calligraphy', 'traditional-painting', 'modern-painting', 'sculpture', 'photography',
  'digital-art', 'mixed-media', 'installation', 'video-art'
);
create type public.artwork_status as enum ('draft', 'published', 'archived', 'in-exhibition');

create table public.artworks (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.artists(id) on delete cascade,
  title text not null,
  title_en text,
  description text not null,
  description_en text,
  category public.artwork_category not null,
  medium text not null,
  dimensions jsonb not null,
  year_created integer not null,
  images jsonb not null,
  is_for_sale boolean default false,
  price numeric(10, 2),
  currency text default 'KRW',
  exhibitions text[],
  contests text[],
  tags text[] default '{}',
  style text,
  materials text[] default '{}',
  status public.artwork_status default 'draft',
  is_featured boolean default false,
  display_order integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  published_at timestamptz,
  views integer default 0,
  likes integer default 0,
  constraint valid_year check (year_created >= 1000 and year_created <= 9999),
  constraint valid_price check (price is null or price >= 0),
  constraint valid_dimensions check (jsonb_typeof(dimensions) = 'object')
);

create or replace function public.set_artwork_published_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'published' and old.status <> 'published' and new.published_at is null then
    new.published_at = now();
  end if;
  return new;
end;
$$;

-- ── 전시-작품 / 전시-작가 연결 ──────────────────────────────────
create table public.exhibition_artworks (
  id uuid primary key default gen_random_uuid(),
  exhibition_id uuid not null references public.exhibitions(id) on delete cascade,
  artwork_id uuid not null references public.artworks(id) on delete cascade,
  display_order integer default 0,
  is_featured boolean default false,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (exhibition_id, artwork_id)
);

create table public.exhibition_artists (
  id uuid primary key default gen_random_uuid(),
  exhibition_id uuid not null references public.exhibitions(id) on delete cascade,
  artist_id uuid not null references public.artists(id) on delete cascade,
  role text default 'participant' check (role in ('organizer', 'curator', 'participant', 'guest')),
  bio text,
  display_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (exhibition_id, artist_id)
);

-- ── 인덱스 ────────────────────────────────────────────────────
create index idx_notices_search on public.notices using gin (search_vector);
create index idx_notices_category on public.notices (category);
create index idx_notices_published on public.notices (is_published, published_at desc);
create index idx_notices_pinned on public.notices (is_pinned, published_at desc);
create index idx_notice_comments_notice on public.notice_comments (notice_id, created_at desc);

create index idx_exhibitions_search on public.exhibitions using gin (search_vector);
create index idx_exhibitions_status on public.exhibitions (status);
create index idx_exhibitions_dates on public.exhibitions (start_date, end_date);
create index idx_exhibitions_published on public.exhibitions (is_published, start_date desc);

create index idx_events_search on public.events using gin (search_vector);
create index idx_events_type on public.events (event_type);
create index idx_events_status on public.events (status);
create index idx_events_date on public.events (event_date);
create index idx_events_published on public.events (is_published, event_date desc);

create index idx_artworks_artist_id on public.artworks (artist_id);
create index idx_artworks_category on public.artworks (category);
create index idx_artworks_status on public.artworks (status);
create index idx_artworks_created_at on public.artworks (created_at desc);
create index idx_artworks_is_featured on public.artworks (is_featured) where is_featured = true;
create index idx_artworks_tags on public.artworks using gin (tags);

create index idx_exhibition_artworks_exhibition on public.exhibition_artworks (exhibition_id, display_order);
create index idx_exhibition_artworks_artwork on public.exhibition_artworks (artwork_id);
create index idx_exhibition_artists_exhibition on public.exhibition_artists (exhibition_id, display_order);
create index idx_exhibition_artists_artist on public.exhibition_artists (artist_id);

-- ── 트리거 ────────────────────────────────────────────────────
create trigger update_notices_updated_at before update on public.notices
  for each row execute function public.update_updated_at_column();
create trigger update_notice_comments_updated_at before update on public.notice_comments
  for each row execute function public.update_updated_at_column();
create trigger update_exhibitions_updated_at before update on public.exhibitions
  for each row execute function public.update_updated_at_column();
create trigger update_events_updated_at before update on public.events
  for each row execute function public.update_updated_at_column();
create trigger update_artworks_updated_at before update on public.artworks
  for each row execute function public.update_updated_at_column();
create trigger set_artwork_published before update on public.artworks
  for each row execute function public.set_artwork_published_at();
create trigger update_exhibition_artworks_updated_at before update on public.exhibition_artworks
  for each row execute function public.update_updated_at_column();
create trigger update_exhibition_artists_updated_at before update on public.exhibition_artists
  for each row execute function public.update_updated_at_column();

-- ── RLS: 공개 읽기만. 쓰기 정책 없음 = service_role 만 쓴다 ───────────
alter table public.notices enable row level security;
alter table public.notice_comments enable row level security;
alter table public.exhibitions enable row level security;
alter table public.events enable row level security;
alter table public.artworks enable row level security;
alter table public.exhibition_artworks enable row level security;
alter table public.exhibition_artists enable row level security;

create policy notices_public_read on public.notices
  for select to anon, authenticated using (is_published = true);
create policy notice_comments_public_read on public.notice_comments
  for select to anon, authenticated using (is_approved = true);
create policy exhibitions_public_read on public.exhibitions
  for select to anon, authenticated using (is_published = true);
create policy events_public_read on public.events
  for select to anon, authenticated using (is_published = true);
create policy artworks_public_read on public.artworks
  for select to anon, authenticated using (status = 'published');
create policy exhibition_artworks_public_read on public.exhibition_artworks
  for select to anon, authenticated using (
    exists (select 1 from public.exhibitions e where e.id = exhibition_id and e.is_published)
  );
create policy exhibition_artists_public_read on public.exhibition_artists
  for select to anon, authenticated using (
    exists (select 1 from public.exhibitions e where e.id = exhibition_id and e.is_published)
  );

-- ── 뷰 (기반 테이블 RLS 를 따른다) ─────────────────────────────
create view public.public_artworks with (security_invoker = true) as
select a.id, a.artist_id, a.title, a.title_en, a.description, a.description_en, a.category,
       a.medium, a.dimensions, a.year_created, a.images, a.is_for_sale, a.price, a.currency,
       a.tags, a.style, a.materials, a.is_featured, a.published_at, a.views, a.likes
from public.artworks a
where a.status = 'published';

create view public.exhibition_details with (security_invoker = true) as
select e.*,
  coalesce(
    (select json_agg(jsonb_build_object(
        'id', ea.id, 'artwork_id', ea.artwork_id, 'display_order', ea.display_order,
        'is_featured', ea.is_featured, 'notes', ea.notes) order by ea.display_order)
     from public.exhibition_artworks ea where ea.exhibition_id = e.id),
    '[]'::json) as artworks,
  coalesce(
    (select json_agg(jsonb_build_object(
        'id', ear.id, 'artist_id', ear.artist_id, 'role', ear.role, 'bio', ear.bio,
        'display_order', ear.display_order) order by ear.display_order)
     from public.exhibition_artists ear where ear.exhibition_id = e.id),
    '[]'::json) as artists
from public.exhibitions e;

grant select on public.public_artworks, public.exhibition_details to anon, authenticated;

-- ── 조회수 증가 RPC ──────────────────────────────────────────
-- 방문자(anon)는 테이블을 고칠 수 없으므로 정의자 권한으로, 공개된 행의 views 만 1 올린다.
create or replace function public.increment_notice_views(notice_uuid uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.notices set views = coalesce(views, 0) + 1 where id = notice_uuid and is_published;
$$;

create or replace function public.increment_exhibition_views(exhibition_uuid uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.exhibitions set views = coalesce(views, 0) + 1 where id = exhibition_uuid and is_published;
$$;

create or replace function public.increment_event_views(event_uuid uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.events set views = coalesce(views, 0) + 1 where id = event_uuid and is_published;
$$;

revoke all on function public.increment_notice_views(uuid), public.increment_exhibition_views(uuid),
  public.increment_event_views(uuid) from public;
grant execute on function public.increment_notice_views(uuid), public.increment_exhibition_views(uuid),
  public.increment_event_views(uuid) to anon, authenticated;

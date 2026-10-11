-- ASCA-2026 artists 테이블 — Airtable 동기화 대상.
-- 이 마이그레이션은 Supabase MCP apply_migration 으로 2026-10-10 에 적용됨.

create table public.artists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_en text,
  name_ja text,
  name_zh text,
  bio text default '',
  bio_en text,
  bio_ja text,
  bio_zh text,
  birth_year integer,
  nationality text,
  specialties text[] default '{}',
  awards text[] default '{}',
  exhibitions text[] default '{}',
  profile_image text,
  membership_type text default '준회원',
  artist_type text default '일반작가',
  title text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  airtable_id text unique
);

create index idx_artists_name on public.artists (name);

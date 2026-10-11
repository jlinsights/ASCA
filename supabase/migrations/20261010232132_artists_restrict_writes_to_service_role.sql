-- artists 테이블 RLS: 공개 읽기만, 쓰기는 service_role 만.
-- 이 마이그레이션은 Supabase MCP apply_migration 으로 2026-10-10 에 적용됨.

alter table public.artists enable row level security;

create policy artists_public_read on public.artists
  for select to anon, authenticated using (true);

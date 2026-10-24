-- 옛 Webflow 에 같은 작가 페이지가 여러 주소로 있던 경우(예: x / x-2), 대표 slug 가 아닌 주소를 담는다.
-- /calligrapher/<옛 주소> 가 대표 slug 로 이어지게 하는 데만 쓴다. 공개 목록 컬럼에는 넣지 않지만
-- 조회 조건(cs 필터)에 쓰려면 SELECT 권한이 있어야 한다. 비공개 작가 행은 RLS 가 가린다.
-- Supabase MCP apply_migration 으로 2026-10-25 에 적용.
alter table public.artists add column if not exists slug_aliases text[] not null default '{}';

create index if not exists artists_slug_aliases_gin on public.artists using gin (slug_aliases);

grant select (slug_aliases) on public.artists to anon, authenticated;

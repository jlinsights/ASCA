-- artists 는 컬럼 단위 SELECT 권한을 쓴다. 공개 목록이 고르는 컬럼(PUBLIC_ARTIST_COLUMNS)에
-- death_year 가 들어가므로 같은 권한을 준다. 이 권한 없이 배포하면 목록 조회 전체가 실패한다.
-- Supabase MCP apply_migration 으로 2026-10-21 에 적용.
grant select (death_year) on public.artists to anon, authenticated;

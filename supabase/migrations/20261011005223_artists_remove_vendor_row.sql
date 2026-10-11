-- artists 테이블에서 벤더(테스트/자동생성) 행 제거.
-- 이 마이그레이션은 Supabase MCP apply_migration 으로 2026-10-11 에 적용됨.
-- 이미 삭제된 행에는 영향 없음(멱등).

delete from public.artists
where name ilike '%vendor%'
  and airtable_id is null;

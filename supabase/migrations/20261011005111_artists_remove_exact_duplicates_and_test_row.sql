-- Airtable 동기화 후 artists 테이블의 정확한 중복 행과 테스트 행 제거.
-- 이 마이그레이션은 Supabase MCP apply_migration 으로 2026-10-11 에 적용됨.
-- 이미 삭제된 행에는 영향 없음(멱등).

delete from public.artists a
using public.artists b
where a.ctid > b.ctid
  and a.name = b.name
  and a.airtable_id is not distinct from b.airtable_id;

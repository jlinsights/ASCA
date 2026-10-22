-- 고인 작가 표시용 사망 연도. 명단에서 빼지 않고 이름 앞에 故 를 붙인다.
-- Supabase MCP apply_migration 으로 2026-10-21 에 적용. 재실행해도 안전(멱등).

alter table public.artists
  add column if not exists death_year smallint
  check (death_year is null or death_year between 1800 and 2100);

comment on column public.artists.death_year is '고인이면 사망 연도. 화면에 故 표시';

-- 값은 데이터로 넣는다 (2026-10-21: 성곡 林炫圻 명예이사장, 2026년 8월 별세 → 2026).

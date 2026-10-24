-- 준회원·공모작가는 웹사이트에 공개하지 않는다 (2026-10-24 사용자 결정).
-- membership_type 에 준회원·공모작가가 들어 있으면 visibility 를 hidden 으로 강제하고,
-- 그 등급에서 벗어나면(승급) hidden 이던 행을 public 으로 되돌린다.
-- 공개 여부는 RLS artists_public_read(visibility='public')가 정한다 — 작품도 작가가 public 일 때만 보인다.
-- Supabase MCP apply_migration 으로 2026-10-24 에 적용. 재실행해도 안전(멱등).
--
-- 같은 날 기존 행은 데이터로 처리했다: 준회원 3,060 + 공모작가 323 = 3,383행 → hidden.
-- 적용 직후 트랜잭션 롤백 검증 8건 통과: 신규 준회원 hidden · 수동 public 거부 · 승급 시 public 복원 ·
-- 공모작가 강등 hidden · '회원작가, 준회원' 조합 hidden · 신규 초대작가 public · 초대작가 수동 hidden 유지 ·
-- 다른 컬럼 수정 시 hidden 유지.

create or replace function public.artists_enforce_grade_visibility()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  grade_pattern constant text := '(^|,)\s*(준회원|공모작가)\s*(,|$)';
  hidden_grade_now boolean := coalesce(new.membership_type ~ grade_pattern, false);
  hidden_grade_before boolean := tg_op = 'UPDATE'
    and coalesce(old.membership_type ~ grade_pattern, false);
begin
  if hidden_grade_now then
    new.visibility := 'hidden';
  elsif hidden_grade_before and new.visibility = 'hidden' then
    new.visibility := 'public';
  end if;
  return new;
end;
$$;

comment on function public.artists_enforce_grade_visibility() is
  '준회원·공모작가는 hidden 강제, 그 등급에서 승급하면 public 으로 복원';

drop trigger if exists trg_artists_grade_visibility on public.artists;
create trigger trg_artists_grade_visibility
  before insert or update of membership_type, visibility on public.artists
  for each row execute function public.artists_enforce_grade_visibility();

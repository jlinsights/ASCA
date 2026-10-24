-- 회비 납부 상태 (회원 및 회비 규정 제5조). 등급(membership_type)과 분리해 관리한다.
-- 정상 · 권한 제한(1년 미납) · 자격 정지(연속 2년 미납). 완납하면 정상으로 되돌리고 기존 등급이 그대로 복원된다.
-- (예전처럼 미납자를 준회원으로 덮어쓰면 원래 등급이 지워져 제5조③ '기존 자격 복원'을 지킬 수 없다)
-- 공개 SELECT 권한을 주지 않는다 — 회비 상태는 공개 정보가 아니다.
-- Supabase MCP apply_migration 으로 2026-10-24 에 적용. 재실행해도 안전(멱등).
--
-- 적용 직후 트랜잭션 롤백 검증 7건 통과: 신규 초대작가 public · 권한 제한 public 유지 · 자격 정지 hidden(등급 유지) ·
-- 정지 중 수동 public 거부 · 완납(정상) 시 public 복원 · 준회원은 정상이어도 hidden · 허용 외 값 거부.

alter table public.artists
  add column if not exists dues_status text not null default '정상'
  check (dues_status in ('정상', '권한 제한', '자격 정지'));

comment on column public.artists.dues_status is
  '회비 납부 상태(회원 및 회비 규정 제5조): 정상 · 권한 제한 · 자격 정지. 자격 정지면 웹사이트 비공개';

-- 비공개 조건: 준회원·공모작가 등급이거나 자격 정지. 조건에서 벗어나면 hidden 이던 행을 public 으로 복원.
create or replace function public.artists_enforce_grade_visibility()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  grade_pattern constant text := '(^|,)\s*(준회원|공모작가)\s*(,|$)';
  hidden_now boolean := coalesce(new.membership_type ~ grade_pattern, false)
    or new.dues_status = '자격 정지';
  hidden_before boolean := tg_op = 'UPDATE'
    and (coalesce(old.membership_type ~ grade_pattern, false) or old.dues_status = '자격 정지');
begin
  if hidden_now then
    new.visibility := 'hidden';
  elsif hidden_before and new.visibility = 'hidden' then
    new.visibility := 'public';
  end if;
  return new;
end;
$$;

comment on function public.artists_enforce_grade_visibility() is
  '준회원·공모작가 또는 회비 자격 정지면 hidden 강제, 그 조건에서 벗어나면 public 으로 복원';

drop trigger if exists trg_artists_grade_visibility on public.artists;
create trigger trg_artists_grade_visibility
  before insert or update of membership_type, visibility, dues_status on public.artists
  for each row execute function public.artists_enforce_grade_visibility();

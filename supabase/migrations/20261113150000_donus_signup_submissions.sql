-- 도너스(DONUS) 신규 가입 보내기 기록 — 홈페이지에서 새로 가입한 회원을 도너스 구성원으로 한 번 등록한다.
--
-- 계약
-- - 역방향은 신규 가입만: 이메일 확인을 마친 계정의 이름·이메일을 도너스 회원 등록 폼(Forms API)으로
--   보낸다. updateOnMatch=false 라 도너스에 같은 이메일 구성원이 있으면 아무것도 바꾸지 않는다.
--   수신 동의는 보내지 않는다(도너스에 '미확인'으로 남는다 — 받은 적 없는 동의·거부를 만들지 않는다).
-- - 이 표는 보낸 결과만 둔다(이름·이메일은 저장하지 않는다):
--   · 보냄 — 도너스가 200 과 올바른 응답을 준 뒤에만. submitted_at·member_idx·is_new 가 함께 찬다.
--   · 실패 — 세 칸이 비고 last_attempt_at 만 남는다. 다음 실행은 실패한 계정을 줄 뒤로 보내
--     매번 거절되는 계정이 뒤의 정상 가입을 막지 않게 한다(보낸 계정은 다시 보내지 않는다).
-- - 쓰기는 하루 한 번 도는 /api/cron/donus-signups(service_role)뿐이다. 회원·익명은 읽지도 쓰지도 못한다.
-- - 도너스가 돌려준 구성원 인덱스는 기록만 하고 연결(donus_member_links)을 만들지 않는다 — 연결은
--   단방향 동기화가 이메일 대조 규칙(겹치는 이메일 거절)으로 만든다.
-- - 이 파일만 따로 ASCA-2026 에 적용한다. 적용 전 백업. 옛 마이그레이션 재실행·db:push 금지.

BEGIN;

CREATE TABLE public.donus_signup_submissions (
  account_id uuid PRIMARY KEY REFERENCES public.account_profiles(id) ON DELETE CASCADE,
  member_idx integer,
  is_new boolean,
  submitted_at timestamptz,
  last_attempt_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT donus_signup_submissions_member_idx_positive CHECK (member_idx IS NULL OR member_idx > 0),
  -- 보낸 행은 세 칸이 모두 차고, 실패한 행은 모두 빈다
  CONSTRAINT donus_signup_submissions_result CHECK (
    (submitted_at IS NULL AND member_idx IS NULL AND is_new IS NULL)
    OR (submitted_at IS NOT NULL AND member_idx IS NOT NULL AND is_new IS NOT NULL)
  )
);

COMMENT ON TABLE public.donus_signup_submissions IS
  '홈페이지 신규 가입을 도너스 구성원으로 보낸 기록. 쓰기는 /api/cron/donus-signups(service_role)만. 연락처 없음.';

ALTER TABLE public.donus_signup_submissions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.donus_signup_submissions FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.donus_signup_submissions TO service_role;

COMMIT;

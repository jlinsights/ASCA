-- 도너스(DONUS) 구성원 연결 — 홈페이지 계정과 도너스 구성원을 잇고, 회원 상태·연회비 납부를 비춘다.
--
-- 계약
-- - 단방향: 도너스가 회원·연회비의 원장이다. 이 표는 도너스에서 읽어 온 결과를 비출 뿐이고,
--   홈페이지에서 고쳐도 도너스로 돌아가지 않는다.
-- - 쓰기는 하루 한 번 도는 /api/cron/donus-sync(service_role)뿐이다. 회원·익명은 읽지도 쓰지도 못한다.
-- - 옮기는 칸은 연결에 필요한 것뿐: 도너스 구성원 인덱스·코드, 생애주기, 최근 납입일, 연회비 납부 연도.
--   이름·이메일·휴대폰·주소는 저장하지 않는다(필요 없는 개인정보). 이메일 대조는 동기화할 때 메모리에서만 한다.
-- - link_source='email' 은 동기화가 이메일 대조로 만든 연결, 'manual' 은 사무국이 직접 이은 연결이다.
--   동기화는 manual 연결을 끊거나 바꾸지 않는다(상태·납부 칸만 갱신한다).
-- - 이 파일만 따로 ASCA-2026 에 적용한다. 적용 전 백업. 옛 마이그레이션 재실행·db:push 금지.

BEGIN;

CREATE TABLE public.donus_member_links (
  account_id uuid PRIMARY KEY REFERENCES public.account_profiles(id) ON DELETE CASCADE,
  member_idx integer NOT NULL,
  member_code text NOT NULL,
  link_source text NOT NULL DEFAULT 'email',
  lifecycle smallint,
  last_pay_date date,
  dues_paid_year integer,
  -- 연회비 이력을 거슬러 끝까지 확인했는가. false 면 다음 실행이 다시 길게 찾는다
  -- (새 연결·조회 실패·연기·연회비 코드 미설정 동안 연결된 경우)
  dues_history_checked boolean NOT NULL DEFAULT false,
  linked_at timestamptz NOT NULL DEFAULT now(),
  synced_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT donus_member_links_member_idx UNIQUE (member_idx),
  CONSTRAINT donus_member_links_member_idx_positive CHECK (member_idx > 0),
  CONSTRAINT donus_member_links_member_code CHECK (char_length(btrim(member_code)) BETWEEN 1 AND 40),
  CONSTRAINT donus_member_links_source CHECK (link_source IN ('email', 'manual')),
  -- 도너스 생애주기: 0 기타 · 1 등록 · 2 리드 · 3 활성 · 4 보류 · 5 이탈
  CONSTRAINT donus_member_links_lifecycle CHECK (lifecycle IS NULL OR lifecycle BETWEEN 0 AND 5),
  CONSTRAINT donus_member_links_dues_year CHECK (dues_paid_year IS NULL OR dues_paid_year BETWEEN 2000 AND 2100)
);

COMMENT ON TABLE public.donus_member_links IS
  '홈페이지 계정 ↔ 도너스 구성원 연결. 도너스가 원장(단방향). 쓰기는 /api/cron/donus-sync(service_role)만. 연락처 없음.';

ALTER TABLE public.donus_member_links ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.donus_member_links FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.donus_member_links TO service_role;

COMMIT;

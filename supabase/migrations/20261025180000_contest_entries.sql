-- 공모전 출품 현황 사본 — Airtable 출품 테이블(연도별)의 일부 칸만 옮겨 회원에게 진행 상황을 보인다.
--
-- 계약
-- - 원본은 Airtable 이다. 이 표는 scripts/sync-contest-entries.ts 가 airtable_record_id 기준으로 덮어쓴다.
-- - 옮기는 칸은 lib/contests/sources.ts 의 허용 목록뿐: 작품 명제·부문·서체·출품비·결과·출품자 이름·이메일.
--   주소·전화·생년월일·사진·심사 점수는 옮기지 않는다.
-- - 회원 연결: 출품 이메일 = 회원의 확인된 로그인 이메일이면 자동(읽을 때 비교, 저장 안 함).
--   그 밖에는 관리자가 작가 행을 확인해 artist_id 를 넣는다(match_method='admin'). 동기화는 이 두 칸을 건드리지 않는다.
-- - 회원·익명 역할은 직접 읽지 못한다. 서버 라우트가 service_role 로 본인 것만 골라 준다.
-- - 부문·서체는 원본 글자 그대로 저장한다 — 장르 목록을 코드에 묶지 않는다.

BEGIN;

CREATE TABLE public.contest_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_key text NOT NULL,
  airtable_record_id text NOT NULL UNIQUE,
  contest_year integer NOT NULL,
  contest_name text NOT NULL,
  title text,
  division text,
  script_style text,
  fee_status_raw text,
  fee_status text NOT NULL DEFAULT 'unknown',
  result_raw text,
  result_status text NOT NULL DEFAULT 'unknown',
  entrant_name text,
  entrant_name_hanja text,
  entrant_email text,
  artist_id uuid REFERENCES public.artists(id) ON DELETE SET NULL,
  match_method text,
  matched_by uuid REFERENCES public.account_profiles(id) ON DELETE SET NULL,
  matched_at timestamptz,
  submitted_at timestamptz,
  synced_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT contest_entries_record_id CHECK (airtable_record_id ~ '^rec[A-Za-z0-9]{14}$'),
  CONSTRAINT contest_entries_year CHECK (contest_year BETWEEN 1990 AND 2100),
  CONSTRAINT contest_entries_fee_status
    CHECK (fee_status IN ('pending', 'confirmed', 'withdrawn', 'unknown')),
  CONSTRAINT contest_entries_result_status
    CHECK (result_status IN ('pending', 'awarded', 'not_selected', 'withdrawn', 'unknown')),
  CONSTRAINT contest_entries_email_lower
    CHECK (entrant_email IS NULL OR entrant_email = lower(btrim(entrant_email))),
  CONSTRAINT contest_entries_match_method CHECK (match_method IS NULL OR match_method = 'admin'),
  -- 연결된 행은 누가 언제 이었는지 남는다. 작가 행이 지워지면 artist_id 만 NULL 이 되고
  -- match_method·matched_at 은 이력으로 남는다(그래야 작가 삭제가 이 CHECK 에 막히지 않는다).
  CONSTRAINT contest_entries_match
    CHECK (artist_id IS NULL OR (match_method = 'admin' AND matched_at IS NOT NULL))
);

COMMENT ON TABLE public.contest_entries IS
  'Airtable 공모전 출품 사본(허용 칸만). 쓰기는 동기화 스크립트·관리자 라우트(service_role)만.';

CREATE INDEX contest_entries_email ON public.contest_entries (entrant_email)
  WHERE entrant_email IS NOT NULL;
CREATE INDEX contest_entries_artist ON public.contest_entries (artist_id) WHERE artist_id IS NOT NULL;
CREATE INDEX contest_entries_unmatched ON public.contest_entries (contest_year DESC)
  WHERE artist_id IS NULL;

ALTER TABLE public.contest_entries ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.contest_entries FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.contest_entries TO service_role;

COMMIT;

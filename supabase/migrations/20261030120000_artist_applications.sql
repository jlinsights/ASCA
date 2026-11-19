-- 추천·초대작가 신청 접수함 — Tally 신청서(웹훅)를 받아 사무국이 심사를 진행하는 표.
--
-- 계약
-- - 쓰기는 /api/webhooks/tally(서명 확인 후)와 관리자 라우트(service_role)뿐이다.
-- - 옮기는 칸은 lib/applications/tally.ts 의 허용 목록뿐: 이름(한글·한자·영문)·아호·이메일·
--   신청 자격·신청 부문(전통·현대)·세부 분야·신청 유형·현재 회원 현황·특별선임 신청 사유·수상 실적.
--   전화·생년월일·주소·납부정보·첨부파일·제출본 미리보기 링크(접근 토큰 포함)는 옮기지 않는다.
--   원본은 Tally 에 남는다.
-- - 신청은 선임이 아니다. 작가 행(artists)은 자격심사·이사회 의결·납부를 거친 뒤 관리자가 따로 만든다.
-- - 회원·익명 역할은 읽지도 쓰지도 못한다.

BEGIN;

CREATE TABLE public.artist_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tally_response_id text NOT NULL UNIQUE,
  tally_form_id text NOT NULL,
  submitted_at timestamptz NOT NULL,
  applicant_name text,
  applicant_name_hanja text,
  applicant_name_en text,
  pen_name text,
  applicant_email text,
  requested_grade text NOT NULL DEFAULT 'unknown',
  requested_grade_raw text,
  track text NOT NULL DEFAULT 'unknown',
  track_raw text,
  genres text[] NOT NULL DEFAULT '{}',
  route text NOT NULL DEFAULT 'unknown',
  route_raw text,
  membership_raw text,
  special_basis_raw text,
  awards_text text,
  status text NOT NULL DEFAULT 'received',
  review_note text,
  reviewed_by uuid REFERENCES public.account_profiles(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  artist_id uuid REFERENCES public.artists(id) ON DELETE SET NULL,
  match_method text,
  matched_by uuid REFERENCES public.account_profiles(id) ON DELETE SET NULL,
  matched_at timestamptz,
  received_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT artist_applications_response_id CHECK (tally_response_id ~ '^[A-Za-z0-9]{3,32}$'),
  CONSTRAINT artist_applications_email_lower
    CHECK (applicant_email IS NULL OR applicant_email = lower(btrim(applicant_email))),
  CONSTRAINT artist_applications_grade
    CHECK (requested_grade IN ('recommended', 'invited', 'unknown')),
  CONSTRAINT artist_applications_track CHECK (track IN ('traditional', 'contemporary', 'unknown')),
  CONSTRAINT artist_applications_route CHECK (route IN ('regular', 'special', 'unknown')),
  CONSTRAINT artist_applications_status
    CHECK (status IN ('received', 'reviewing', 'approved', 'rejected', 'withdrawn')),
  CONSTRAINT artist_applications_match_method CHECK (match_method IS NULL OR match_method = 'admin'),
  CONSTRAINT artist_applications_match
    CHECK (artist_id IS NULL OR (match_method = 'admin' AND matched_at IS NOT NULL))
);

COMMENT ON TABLE public.artist_applications IS
  'Tally 추천·초대작가 신청 접수함(허용 칸만). 쓰기는 Tally 웹훅·관리자 라우트(service_role)만.';

CREATE INDEX artist_applications_open ON public.artist_applications (submitted_at DESC)
  WHERE status IN ('received', 'reviewing');
CREATE INDEX artist_applications_email ON public.artist_applications (applicant_email)
  WHERE applicant_email IS NOT NULL;
CREATE INDEX artist_applications_artist ON public.artist_applications (artist_id)
  WHERE artist_id IS NOT NULL;

ALTER TABLE public.artist_applications ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.artist_applications FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.artist_applications TO service_role;

COMMIT;

-- 문의서(/contact#inquiry) 접수함 — 방문자가 보낸 문의를 사무국이 관리 화면에서 보고 답한다.
--
-- 계약
-- - 쓰기는 /api/inquiries(출처 확인·속도 제한·크기 제한·검증 후)와 관리자 라우트(service_role)뿐이다.
-- - 회원·익명 역할은 읽지도 쓰지도 못한다. 방문자는 자기가 보낸 문의를 다시 볼 수 없다.
-- - 옮기는 칸은 문의서 칸뿐: 용건·이름·이메일·전화·관련 작품·예산 일정·내용·화면 언어.
--   IP·브라우저 정보는 저장하지 않는다(필요 없는 개인정보).
-- - 연락처는 이메일이나 전화 중 하나가 있어야 한다. 이메일은 소문자·앞뒤 공백 없이 저장한다.
-- - 길이 제한은 lib/inquiries/schema.ts 의 zod 제한과 같다.

BEGIN;

CREATE TABLE public.inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic text NOT NULL,
  name text NOT NULL,
  email text,
  phone text,
  subject text,
  plan text,
  message text NOT NULL,
  language text NOT NULL DEFAULT 'ko',
  status text NOT NULL DEFAULT 'new',
  staff_note text,
  handled_by uuid REFERENCES public.account_profiles(id) ON DELETE SET NULL,
  handled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT inquiries_topic
    CHECK (topic IN ('artwork', 'commission', 'exhibition', 'academy', 'membership', 'other')),
  CONSTRAINT inquiries_name CHECK (char_length(btrim(name)) BETWEEN 1 AND 100),
  CONSTRAINT inquiries_email
    CHECK (email IS NULL OR (email = lower(btrim(email)) AND char_length(email) BETWEEN 3 AND 254)),
  CONSTRAINT inquiries_phone CHECK (phone IS NULL OR char_length(btrim(phone)) BETWEEN 1 AND 40),
  CONSTRAINT inquiries_contact CHECK (email IS NOT NULL OR phone IS NOT NULL),
  CONSTRAINT inquiries_subject CHECK (subject IS NULL OR char_length(subject) <= 200),
  CONSTRAINT inquiries_plan CHECK (plan IS NULL OR char_length(plan) <= 300),
  CONSTRAINT inquiries_message CHECK (char_length(btrim(message)) BETWEEN 1 AND 5000),
  CONSTRAINT inquiries_language CHECK (language IN ('ko', 'en', 'ja', 'zh')),
  CONSTRAINT inquiries_status CHECK (status IN ('new', 'answered', 'closed')),
  CONSTRAINT inquiries_staff_note CHECK (staff_note IS NULL OR char_length(staff_note) <= 2000),
  CONSTRAINT inquiries_handled CHECK (status = 'new' OR handled_at IS NOT NULL)
);

COMMENT ON TABLE public.inquiries IS
  '문의서 접수함. 쓰기는 /api/inquiries·관리자 라우트(service_role)만. IP·브라우저 정보 없음.';

CREATE INDEX inquiries_open ON public.inquiries (created_at DESC) WHERE status = 'new';
CREATE INDEX inquiries_created ON public.inquiries (created_at DESC);

ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.inquiries FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.inquiries TO service_role;

COMMIT;

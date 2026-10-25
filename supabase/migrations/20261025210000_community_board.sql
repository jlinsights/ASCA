-- 회원 커뮤니티 게시판 — 글(thread)·댓글·좋아요.
--
-- 계약
-- - 읽기·쓰기 모두 서버 라우트(service_role)만 한다. anon·authenticated 역할은 표에 직접 닿지 않는다.
--   서버는 숨김(hidden_at)·삭제(deleted_at) 행을 모든 읽기 경로에서 거른다.
-- - 작성자는 서버가 로그인 계정 ID 로만 채운다. 계정이 지워지면 글은 남고 작성자는 비운다("탈퇴한 회원").
-- - 숨김은 관리자(aal2)만, 삭제는 작성자 본인만 한다. 둘 다 행을 지우지 않고 시각만 기록한다.
-- - 본문은 평문이다. HTML·마크다운으로 해석하지 않는다.
-- - 장르를 가리지 않는다 — 분류·말머리를 하드코딩하지 않는다.

BEGIN;

CREATE TABLE public.community_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid REFERENCES public.account_profiles(id) ON DELETE SET NULL,
  title text NOT NULL,
  body text NOT NULL,
  hidden_at timestamptz,
  hidden_by uuid REFERENCES public.account_profiles(id) ON DELETE SET NULL,
  hidden_reason text,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT community_threads_title_length CHECK (char_length(btrim(title)) BETWEEN 1 AND 120),
  CONSTRAINT community_threads_body_length CHECK (char_length(btrim(body)) BETWEEN 1 AND 10000),
  CONSTRAINT community_threads_hidden_reason_length
    CHECK (hidden_reason IS NULL OR char_length(hidden_reason) <= 500),
  -- 숨김 사유·처리자는 숨김 시각이 있을 때만 있다
  CONSTRAINT community_threads_hidden
    CHECK (hidden_at IS NOT NULL OR (hidden_by IS NULL AND hidden_reason IS NULL))
);

COMMENT ON TABLE public.community_threads IS
  '회원 커뮤니티 게시판 글. 읽기·쓰기는 service_role 서버 라우트 전용, 숨김·삭제 행은 읽기에서 제외.';

CREATE INDEX community_threads_feed ON public.community_threads (created_at DESC)
  WHERE hidden_at IS NULL AND deleted_at IS NULL;
CREATE INDEX community_threads_author ON public.community_threads (author_id);

CREATE TABLE public.community_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES public.community_threads(id) ON DELETE CASCADE,
  author_id uuid REFERENCES public.account_profiles(id) ON DELETE SET NULL,
  body text NOT NULL,
  hidden_at timestamptz,
  hidden_by uuid REFERENCES public.account_profiles(id) ON DELETE SET NULL,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT community_comments_body_length CHECK (char_length(btrim(body)) BETWEEN 1 AND 2000),
  CONSTRAINT community_comments_hidden CHECK (hidden_at IS NOT NULL OR hidden_by IS NULL)
);

COMMENT ON TABLE public.community_comments IS
  '게시판 글의 댓글. 읽기·쓰기는 service_role 서버 라우트 전용.';

CREATE INDEX community_comments_thread ON public.community_comments (thread_id, created_at);
CREATE INDEX community_comments_author ON public.community_comments (author_id);

CREATE TABLE public.community_reactions (
  thread_id uuid NOT NULL REFERENCES public.community_threads(id) ON DELETE CASCADE,
  account_id uuid NOT NULL REFERENCES public.account_profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (thread_id, account_id)
);

COMMENT ON TABLE public.community_reactions IS
  '게시판 글 좋아요 — 계정당 글 하나에 한 번. service_role 전용.';

CREATE INDEX community_reactions_account ON public.community_reactions (account_id);

ALTER TABLE public.community_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_reactions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.community_threads, public.community_comments, public.community_reactions
  FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.community_threads, public.community_comments, public.community_reactions
  TO service_role;

CREATE TRIGGER community_threads_updated_at BEFORE UPDATE ON public.community_threads
  FOR EACH ROW EXECUTE FUNCTION public.set_account_profile_updated_at();
CREATE TRIGGER community_comments_updated_at BEFORE UPDATE ON public.community_comments
  FOR EACH ROW EXECUTE FUNCTION public.set_account_profile_updated_at();

COMMIT;

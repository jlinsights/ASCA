-- 작가 페이지 연결 요청 — 회원 계정과 artists 행을 협회 승인으로만 잇는다.
--
-- 계약
-- - 회원은 자기 요청만 읽는다. 쓰기는 서버 라우트(service_role)만 한다.
-- - 연결(artists.claimed_by_user_id)은 아래 함수 안에서만, 비어 있을 때만 채운다.
-- - artist_id 가 NULL 인 요청은 "내 페이지가 목록에 없음" — 비공개 작가(준회원 등)를
--   공개 검색에 노출하지 않으려고 이름만 받고 협회가 직접 찾는다.
-- - 승인·반려·해제는 관리자 계정 ID 를 받아 그 계정이 관리자인지 다시 확인한다.

BEGIN;

CREATE TABLE public.artist_claim_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES public.account_profiles(id) ON DELETE CASCADE,
  artist_id uuid REFERENCES public.artists(id) ON DELETE SET NULL,
  claimed_name text NOT NULL,
  claimed_name_hanja text,
  claimed_art_name text,
  note text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  decision_note text,
  reviewed_by uuid REFERENCES public.account_profiles(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  revoked_by uuid REFERENCES public.account_profiles(id) ON DELETE SET NULL,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT artist_claim_requests_status
    CHECK (status IN ('pending', 'approved', 'rejected', 'withdrawn', 'revoked')),
  CONSTRAINT artist_claim_requests_name_length
    CHECK (char_length(btrim(claimed_name)) BETWEEN 1 AND 100),
  CONSTRAINT artist_claim_requests_hanja_length
    CHECK (claimed_name_hanja IS NULL OR char_length(claimed_name_hanja) <= 100),
  CONSTRAINT artist_claim_requests_art_name_length
    CHECK (claimed_art_name IS NULL OR char_length(claimed_art_name) <= 100),
  CONSTRAINT artist_claim_requests_note_length CHECK (char_length(note) <= 1000),
  CONSTRAINT artist_claim_requests_decision_note_length
    CHECK (decision_note IS NULL OR char_length(decision_note) <= 1000),
  -- 승인·반려·해제된 요청에는 검토 시각이 있고, 대기·철회 요청에는 없다
  CONSTRAINT artist_claim_requests_reviewed
    CHECK ((status IN ('approved', 'rejected', 'revoked')) = (reviewed_at IS NOT NULL)),
  CONSTRAINT artist_claim_requests_revoked
    CHECK ((status = 'revoked') = (revoked_at IS NOT NULL)),
  -- 승인된 요청은 반드시 작가 행을 가리킨다
  CONSTRAINT artist_claim_requests_approved_artist
    CHECK (status NOT IN ('approved', 'revoked') OR artist_id IS NOT NULL)
);

COMMENT ON TABLE public.artist_claim_requests IS
  '회원 계정 ↔ 작가 페이지 연결 요청. 쓰기는 service_role 전용, 승인은 approve_artist_claim 으로만.';

-- 계정당 대기 요청은 하나
CREATE UNIQUE INDEX artist_claim_requests_one_pending_per_account
  ON public.artist_claim_requests (account_id) WHERE status = 'pending';
-- 작가 행당 승인된 연결은 하나
CREATE UNIQUE INDEX artist_claim_requests_one_approved_per_artist
  ON public.artist_claim_requests (artist_id) WHERE status = 'approved';
CREATE INDEX artist_claim_requests_pending_queue
  ON public.artist_claim_requests (created_at) WHERE status = 'pending';
CREATE INDEX artist_claim_requests_artist ON public.artist_claim_requests (artist_id);

ALTER TABLE public.artist_claim_requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.artist_claim_requests FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.artist_claim_requests TO authenticated;
GRANT ALL ON public.artist_claim_requests TO service_role;

CREATE POLICY artist_claim_requests_read_own ON public.artist_claim_requests
  FOR SELECT TO authenticated USING (account_id = (SELECT auth.uid()));

CREATE TRIGGER artist_claim_requests_updated_at BEFORE UPDATE ON public.artist_claim_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_account_profile_updated_at();

-- 관리자 확인 — 비활성 계정이나 회원 계정은 검토할 수 없다
CREATE FUNCTION public.assert_claim_reviewer(p_admin uuid)
RETURNS void LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.account_profiles
    WHERE id = p_admin AND role = 'admin' AND disabled_at IS NULL
  ) THEN
    RAISE EXCEPTION 'reviewer is not an active admin' USING ERRCODE = '42501';
  END IF;
END;
$$;

-- 승인: 요청 잠금 → 대기 확인 → 빈 작가 행에만 연결 → 요청 승인 기록. 한 트랜잭션.
-- p_artist 는 "목록에 없음" 요청에서 협회가 찾은 작가 행. 지정 요청이면 생략한다.
CREATE FUNCTION public.approve_artist_claim(
  p_request uuid,
  p_admin uuid,
  p_artist uuid DEFAULT NULL,
  p_note text DEFAULT NULL
)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  req public.artist_claim_requests%ROWTYPE;
  target uuid;
BEGIN
  PERFORM public.assert_claim_reviewer(p_admin);

  SELECT * INTO req FROM public.artist_claim_requests WHERE id = p_request FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'claim request not found' USING ERRCODE = 'P0002';
  END IF;
  IF req.status <> 'pending' THEN
    RAISE EXCEPTION 'claim request is not pending' USING ERRCODE = '55000';
  END IF;

  target := COALESCE(p_artist, req.artist_id);
  IF target IS NULL THEN
    RAISE EXCEPTION 'artist must be chosen for an unlisted claim' USING ERRCODE = '22023';
  END IF;
  IF req.artist_id IS NOT NULL AND p_artist IS NOT NULL AND p_artist <> req.artist_id THEN
    RAISE EXCEPTION 'artist differs from the requested page' USING ERRCODE = '22023';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.account_profiles WHERE id = req.account_id AND disabled_at IS NULL
  ) THEN
    RAISE EXCEPTION 'claimant account is disabled' USING ERRCODE = '42501';
  END IF;

  UPDATE public.artists
     SET claimed_by_user_id = req.account_id::text, updated_at = now()
   WHERE id = target AND claimed_by_user_id IS NULL;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'artist is already linked or missing' USING ERRCODE = '23505';
  END IF;

  UPDATE public.artist_claim_requests
     SET status = 'approved', artist_id = target, reviewed_by = p_admin,
         reviewed_at = now(), decision_note = NULLIF(btrim(COALESCE(p_note, '')), '')
   WHERE id = p_request;

  RETURN target;
END;
$$;

CREATE FUNCTION public.reject_artist_claim(p_request uuid, p_admin uuid, p_note text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  PERFORM public.assert_claim_reviewer(p_admin);
  UPDATE public.artist_claim_requests
     SET status = 'rejected', reviewed_by = p_admin, reviewed_at = now(),
         decision_note = NULLIF(btrim(COALESCE(p_note, '')), '')
   WHERE id = p_request AND status = 'pending';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'claim request is not pending' USING ERRCODE = '55000';
  END IF;
END;
$$;

-- 해제: 잘못 연결된 계정을 떼어 낸다. 요청 행은 revoked 로 남겨 이력을 보존한다.
CREATE FUNCTION public.revoke_artist_claim(p_request uuid, p_admin uuid, p_note text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  req public.artist_claim_requests%ROWTYPE;
BEGIN
  PERFORM public.assert_claim_reviewer(p_admin);
  SELECT * INTO req FROM public.artist_claim_requests WHERE id = p_request FOR UPDATE;
  IF NOT FOUND OR req.status <> 'approved' THEN
    RAISE EXCEPTION 'claim request is not approved' USING ERRCODE = '55000';
  END IF;

  UPDATE public.artists
     SET claimed_by_user_id = NULL, updated_at = now()
   WHERE id = req.artist_id AND claimed_by_user_id = req.account_id::text;

  UPDATE public.artist_claim_requests
     SET status = 'revoked', revoked_by = p_admin, revoked_at = now(),
         decision_note = NULLIF(btrim(COALESCE(p_note, '')), '')
   WHERE id = p_request;
END;
$$;

REVOKE ALL ON FUNCTION public.assert_claim_reviewer(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.approve_artist_claim(uuid, uuid, uuid, text)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.reject_artist_claim(uuid, uuid, text)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.revoke_artist_claim(uuid, uuid, text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.assert_claim_reviewer(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.approve_artist_claim(uuid, uuid, uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.reject_artist_claim(uuid, uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.revoke_artist_claim(uuid, uuid, text) TO service_role;

COMMIT;

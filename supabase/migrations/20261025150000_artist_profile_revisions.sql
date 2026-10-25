-- 작가 프로필 수정 이력 — 연결된 작가의 수정은 바로 공개되고, 사무국은 이력을 보고 되돌린다.
--
-- 계약
-- - 회원 수정은 apply_artist_profile_edit 로만 한다. 소유권 확인·수정·이력 기록이 한 트랜잭션.
-- - 이력은 바뀐 칸만 {칸: {before, after}} 로 남긴다. 값이 그대로면 기록하지 않는다.
-- - 되돌리기는 관리자만, 그 뒤로 같은 칸이 다시 바뀌지 않았을 때만 한다(새 수정을 덮지 않는다).
--   되돌리기 자체도 이력 한 줄(revert_of)로 남는다.
-- - 수정 가능한 칸은 name_en·bio·bio_en·birth_year·specialties 뿐이다.

BEGIN;

CREATE TABLE public.artist_profile_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id uuid NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
  account_id uuid REFERENCES public.account_profiles(id) ON DELETE SET NULL,
  changes jsonb NOT NULL,
  revert_of uuid REFERENCES public.artist_profile_revisions(id) ON DELETE SET NULL,
  reverted_at timestamptz,
  reverted_by uuid REFERENCES public.account_profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT artist_profile_revisions_changes
    CHECK (jsonb_typeof(changes) = 'object' AND changes <> '{}'::jsonb)
);

COMMENT ON TABLE public.artist_profile_revisions IS
  '작가 프로필 수정 이력. 쓰기는 apply_artist_profile_edit·revert_artist_profile_revision 으로만.';

CREATE INDEX artist_profile_revisions_recent ON public.artist_profile_revisions (created_at DESC);
CREATE INDEX artist_profile_revisions_artist
  ON public.artist_profile_revisions (artist_id, created_at DESC);

ALTER TABLE public.artist_profile_revisions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.artist_profile_revisions FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.artist_profile_revisions TO service_role;

-- 내부용: 허용된 칸만 값으로 덮고, 바뀐 뒤 행을 돌려준다. 키가 있으면 null 도 그대로 쓴다.
CREATE FUNCTION public.set_artist_profile_fields(p_artist uuid, p_values jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  after_row jsonb;
BEGIN
  IF jsonb_typeof(p_values) <> 'object' OR EXISTS (
    SELECT 1 FROM jsonb_object_keys(p_values) AS k(key)
    WHERE k.key NOT IN ('name_en', 'bio', 'bio_en', 'birth_year', 'specialties')
  ) THEN
    RAISE EXCEPTION 'unsupported profile field' USING ERRCODE = '22023';
  END IF;

  UPDATE public.artists AS a SET
    name_en = CASE WHEN p_values ? 'name_en' THEN p_values->>'name_en' ELSE a.name_en END,
    bio = CASE WHEN p_values ? 'bio' THEN p_values->>'bio' ELSE a.bio END,
    bio_en = CASE WHEN p_values ? 'bio_en' THEN p_values->>'bio_en' ELSE a.bio_en END,
    birth_year = CASE WHEN p_values ? 'birth_year'
      THEN (p_values->>'birth_year')::integer ELSE a.birth_year END,
    specialties = CASE
      WHEN NOT p_values ? 'specialties' THEN a.specialties
      WHEN jsonb_typeof(p_values->'specialties') = 'null' THEN NULL
      ELSE ARRAY(SELECT jsonb_array_elements_text(p_values->'specialties'))
    END,
    updated_at = now()
  WHERE a.id = p_artist
  RETURNING to_jsonb(a.*) INTO after_row;
  RETURN after_row;
END;
$$;

-- 회원 수정: 소유한 작가 행만, 바뀐 칸만 이력으로
CREATE FUNCTION public.apply_artist_profile_edit(p_artist uuid, p_account uuid, p_patch jsonb)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  before_row jsonb;
  after_row jsonb;
  diff jsonb := '{}'::jsonb;
  field text;
  revision uuid;
BEGIN
  SELECT to_jsonb(a.*) INTO before_row FROM public.artists AS a
   WHERE a.id = p_artist AND a.claimed_by_user_id = p_account::text
   FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'artist is not linked to this account' USING ERRCODE = 'P0002';
  END IF;

  after_row := public.set_artist_profile_fields(p_artist, p_patch);
  FOR field IN SELECT jsonb_object_keys(p_patch) LOOP
    IF before_row->field IS DISTINCT FROM after_row->field THEN
      diff := diff || jsonb_build_object(
        field, jsonb_build_object('before', before_row->field, 'after', after_row->field));
    END IF;
  END LOOP;

  IF diff <> '{}'::jsonb THEN
    INSERT INTO public.artist_profile_revisions (artist_id, account_id, changes)
    VALUES (p_artist, p_account, diff) RETURNING id INTO revision;
  END IF;
  RETURN revision;
END;
$$;

-- 되돌리기: 관리자만, 그 뒤로 해당 칸이 다시 바뀌지 않았을 때만
CREATE FUNCTION public.revert_artist_profile_revision(p_revision uuid, p_admin uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  rev public.artist_profile_revisions%ROWTYPE;
  current_row jsonb;
  restore jsonb := '{}'::jsonb;
  inverse jsonb := '{}'::jsonb;
  field text;
  revision uuid;
BEGIN
  PERFORM public.assert_claim_reviewer(p_admin);

  SELECT * INTO rev FROM public.artist_profile_revisions WHERE id = p_revision FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'revision not found' USING ERRCODE = 'P0002';
  END IF;
  IF rev.reverted_at IS NOT NULL OR rev.revert_of IS NOT NULL THEN
    RAISE EXCEPTION 'revision cannot be reverted' USING ERRCODE = '55000';
  END IF;

  SELECT to_jsonb(a.*) INTO current_row FROM public.artists AS a WHERE a.id = rev.artist_id
   FOR UPDATE;
  FOR field IN SELECT jsonb_object_keys(rev.changes) LOOP
    IF current_row->field IS DISTINCT FROM rev.changes->field->'after' THEN
      RAISE EXCEPTION 'field % changed after this revision', field USING ERRCODE = '40001';
    END IF;
    restore := restore || jsonb_build_object(field, rev.changes->field->'before');
    inverse := inverse || jsonb_build_object(field, jsonb_build_object(
      'before', rev.changes->field->'after', 'after', rev.changes->field->'before'));
  END LOOP;

  PERFORM public.set_artist_profile_fields(rev.artist_id, restore);
  UPDATE public.artist_profile_revisions
     SET reverted_at = now(), reverted_by = p_admin WHERE id = p_revision;
  INSERT INTO public.artist_profile_revisions (artist_id, account_id, changes, revert_of)
  VALUES (rev.artist_id, p_admin, inverse, p_revision) RETURNING id INTO revision;
  RETURN revision;
END;
$$;

REVOKE ALL ON FUNCTION public.set_artist_profile_fields(uuid, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.apply_artist_profile_edit(uuid, uuid, jsonb)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.revert_artist_profile_revision(uuid, uuid)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.apply_artist_profile_edit(uuid, uuid, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.revert_artist_profile_revision(uuid, uuid) TO service_role;

COMMIT;

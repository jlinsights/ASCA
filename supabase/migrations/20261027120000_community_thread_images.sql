-- 게시판 글 사진 — 글 하나에 최대 4장.
--
-- 계약
-- - 사진 파일은 비공개 버킷(community-images)에 있다. 공개 URL 이 없고, 서버 라우트가 글이 보이는지
--   (숨김·삭제가 아닌지) 매번 확인한 뒤에만 내보낸다. 글을 숨기거나 지우면 사진도 닿지 않는다.
-- - 버킷·표 모두 service_role 전용. anon·authenticated 역할에 storage.objects 정책을 두지 않는다.
-- - 서버가 다시 인코딩한 WebP 만 저장한다(위치 등 메타데이터 제거). 파일 경로는 무작위 UUID 라
--   계정 ID 가 드러나지 않는다.
-- - 올린 직후의 사진은 글이 없다(thread_id NULL, 대기). 글을 올릴 때 community_create_thread 가
--   올린 사람 본인의 대기 사진만 그 글에 붙인다 — 글 저장과 한 트랜잭션.

BEGIN;

CREATE TABLE public.community_thread_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid REFERENCES public.community_threads(id) ON DELETE CASCADE,
  -- 올린 계정. 탈퇴하면 비운다(붙은 사진은 글과 함께 남는다)
  uploader_id uuid REFERENCES public.account_profiles(id) ON DELETE SET NULL,
  storage_path text NOT NULL UNIQUE,
  width integer NOT NULL CHECK (width BETWEEN 1 AND 4000),
  height integer NOT NULL CHECK (height BETWEEN 1 AND 4000),
  byte_size integer NOT NULL CHECK (byte_size BETWEEN 1 AND 2097152),
  position smallint CHECK (position BETWEEN 0 AND 3),
  created_at timestamptz NOT NULL DEFAULT now(),
  -- 글에 붙은 사진만 순서가 있다
  CONSTRAINT community_thread_images_attached CHECK ((thread_id IS NULL) = (position IS NULL)),
  CONSTRAINT community_thread_images_slot UNIQUE (thread_id, position)
);

COMMENT ON TABLE public.community_thread_images IS
  '게시판 글 사진(최대 4장). thread_id 가 비면 올리고 아직 글에 붙이지 않은 대기 사진. service_role 전용.';

CREATE INDEX community_thread_images_pending ON public.community_thread_images (uploader_id)
  WHERE thread_id IS NULL;

ALTER TABLE public.community_thread_images ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.community_thread_images FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.community_thread_images TO service_role;

-- 비공개 버킷 — 서버가 만든 WebP 만, 한 장 2MB 까지
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('community-images', 'community-images', false, 2097152, ARRAY['image/webp'])
ON CONFLICT (id) DO NOTHING;

-- 글 올리기 + 사진 붙이기를 한 번에. 붙일 사진이 하나라도 올린 사람의 대기 사진이 아니면
-- 예외로 글까지 되돌린다(부분 저장 없음).
CREATE FUNCTION public.community_create_thread(
  p_author uuid,
  p_title text,
  p_body text,
  p_image_ids uuid[] DEFAULT '{}'
) RETURNS uuid
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  v_thread uuid;
  v_wanted integer := coalesce(cardinality(p_image_ids), 0);
  v_attached integer;
BEGIN
  IF v_wanted > 4 OR v_wanted <> (SELECT count(DISTINCT x) FROM unnest(p_image_ids) AS x) THEN
    RAISE EXCEPTION 'COMMUNITY_IMAGES_INVALID' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.community_threads (author_id, title, body)
  VALUES (p_author, p_title, p_body)
  RETURNING id INTO v_thread;

  IF v_wanted > 0 THEN
    UPDATE public.community_thread_images AS image
    SET thread_id = v_thread, position = picked.ord - 1
    FROM unnest(p_image_ids) WITH ORDINALITY AS picked(id, ord)
    WHERE image.id = picked.id
      AND image.uploader_id = p_author
      AND image.thread_id IS NULL;
    GET DIAGNOSTICS v_attached = ROW_COUNT;
    IF v_attached <> v_wanted THEN
      RAISE EXCEPTION 'COMMUNITY_IMAGES_UNAVAILABLE' USING ERRCODE = 'P0002';
    END IF;
  END IF;

  RETURN v_thread;
END;
$$;

REVOKE ALL ON FUNCTION public.community_create_thread(uuid, text, text, uuid[])
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.community_create_thread(uuid, text, text, uuid[]) TO service_role;

COMMIT;

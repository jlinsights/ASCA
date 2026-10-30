-- contest_entries 작가 연결 CHECK 보강 (artist_applications 와 같은 결함).
-- 앞선 식은 match_method 가 NULL 이면 결과가 NULL 이라 통과했다(CHECK 는 NULL 을 통과시킨다).
-- 연결된 행은 연결 방식이 반드시 'admin' 이고 연결 시각이 있어야 한다.
-- 풀린 행(artist_id NULL)의 match_method·matched_at 이력은 그대로 허용한다.

BEGIN;

ALTER TABLE public.contest_entries DROP CONSTRAINT contest_entries_match;
ALTER TABLE public.contest_entries ADD CONSTRAINT contest_entries_match CHECK (
  artist_id IS NULL
  OR (match_method IS NOT NULL AND match_method = 'admin' AND matched_at IS NOT NULL)
);

COMMIT;

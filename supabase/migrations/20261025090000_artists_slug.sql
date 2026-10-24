-- 작가 주소용 slug(로마자 이름, 예: /artists/<slug>). 옛 Webflow /calligrapher/<slug> 주소를 1:1 로 잇는다.
-- 컬럼·인덱스·제약·권한은 2026-10 에 Supabase MCP 로 먼저 만들었고, 이 파일은 그 상태를 저장소에 기록한다.
-- 값(작가별 slug)은 비공개 등급 작가 이름이 섞여 있어 저장소에 적지 않는다 — DB 에만 있다.
alter table public.artists add column if not exists slug text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.artists'::regclass and conname = 'artists_slug_format'
  ) then
    alter table public.artists add constraint artists_slug_format
      check (slug is null or slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$');
  end if;
end $$;

create unique index if not exists artists_slug_key on public.artists (slug) where slug is not null;

grant select (slug) on public.artists to anon, authenticated;

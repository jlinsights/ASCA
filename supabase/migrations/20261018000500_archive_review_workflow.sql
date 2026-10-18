-- Additive workflow ledger. Roll back with a forward migration preserving review history.
-- No Clerk JWT policies: only the permission-checked server may execute these functions.
create table public.archive_reviews (
  id uuid primary key,
  artwork_id uuid not null references public.artworks(id) on delete cascade,
  action text not null check (action in ('publish','return','unpublish')),
  state text not null default 'processing' check (state in ('processing','failed','completed')),
  reviewer_id text not null,
  reason text not null default '' check (length(reason) <= 2000),
  lease_token uuid not null,
  leased_at timestamptz not null default clock_timestamp(),
  images jsonb not null default '[]' check (jsonb_typeof(images) = 'array'),
  cleanup_paths text[] not null default '{}',
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  check (action = 'publish' or length(btrim(reason)) > 0)
);
create unique index archive_reviews_open on public.archive_reviews(artwork_id) where state <> 'completed';
create index archive_reviews_history on public.archive_reviews(artwork_id, created_at desc);
alter table public.archive_reviews enable row level security;
revoke all on public.archive_reviews from public, anon, authenticated;
grant all on public.archive_reviews to service_role;

create function public.prepare_archive_review(
  p_id uuid, p_artwork_id uuid, p_action text, p_expected_updated_at timestamptz,
  p_reason text, p_reviewer_id text, p_lease_token uuid
) returns jsonb language plpgsql set search_path = '' as $$
declare
  w public.artworks;
  r public.archive_reviews;
  i public.artwork_images;
  manifest jsonb := '[]';
  base text;
  dest text;
  cleanup text[] := '{}';
begin
  select * into w from public.artworks where id = p_artwork_id for update;
  if not found then raise exception 'NOT_FOUND'; end if;
  select * into r from public.archive_reviews where id = p_id for update;
  if found then
    if r.artwork_id <> p_artwork_id or r.action <> p_action then raise exception 'CONFLICT'; end if;
    if r.state = 'completed' then return to_jsonb(r); end if;
    -- Route maxDuration is 60s. A crashed worker can be reclaimed after five minutes.
    if r.state = 'processing' and r.leased_at > clock_timestamp() - interval '5 minutes'
      then raise exception 'BUSY'; end if;
    if r.action = 'publish' then
      -- Fence Storage as well as DB commits: each attempt writes different public keys.
      select array_agg(path) into cleanup from (
        select value->>'public_thumb' as path from jsonb_array_elements(r.images)
        union all select value->>'public_web' from jsonb_array_elements(r.images)
      ) previous;
      select jsonb_agg(value || jsonb_build_object(
        'public_thumb', w.artist_id::text || '/' || w.id::text || '/public/' || p_lease_token::text || '/' || (value->>'id') || '/thumb.webp',
        'public_web', w.artist_id::text || '/' || w.id::text || '/public/' || p_lease_token::text || '/' || (value->>'id') || '/web.webp'))
        into manifest from jsonb_array_elements(r.images);
    else manifest := r.images; end if;
    update public.archive_reviews set state = 'processing', lease_token = p_lease_token,
      images = manifest, cleanup_paths = cleanup_paths || coalesce(cleanup,'{}'),
      leased_at = clock_timestamp(), reviewer_id = p_reviewer_id where id = p_id returning * into r;
    return to_jsonb(r);
  end if;
  if exists(select 1 from public.archive_reviews where artwork_id = w.id and state <> 'completed')
    then raise exception 'BUSY'; end if;
  if w.updated_at is distinct from p_expected_updated_at then raise exception 'CONFLICT'; end if;
  if (p_action in ('publish','return') and w.status is distinct from 'pending_review')
    or (p_action = 'unpublish' and w.status is distinct from 'published')
    or p_action not in ('publish','return','unpublish') then raise exception 'CONFLICT'; end if;
  if p_action = 'publish' and not exists
    (select 1 from public.artists where id = w.artist_id and visibility = 'public')
    then raise exception 'ARTIST_PRIVATE'; end if;
  if p_action = 'publish' and (btrim(w.title) = '' or coalesce(btrim(w.style),'') = ''
    or coalesce(w.width_cm,0) <= 0 or coalesce(w.height_cm,0) <= 0
    or coalesce(w.year_created,0) < 1 or coalesce(cardinality(w.materials),0) = 0)
    then raise exception 'INCOMPLETE'; end if;
  if p_action <> 'return' then
    for i in select * from public.artwork_images where artwork_id = w.id order by sort_order, id for update loop
      base := w.artist_id::text || '/' || w.id::text || '/';
      if i.original_path !~ ('^' || base || '[0-2]/original\.(jpeg|png|webp)$')
        then raise exception 'IMAGE_PATH'; end if;
      base := regexp_replace(i.original_path, 'original\.(jpeg|png|webp)$', '');
      dest := w.artist_id::text || '/' || w.id::text || '/public/' || p_lease_token::text || '/' || i.id::text || '/';
      if p_action = 'publish' and (i.thumb_path <> base || 'thumb.webp' or i.web_path <> base || 'web.webp')
        then raise exception 'IMAGE_PATH'; end if;
      if p_action = 'unpublish' and
        (i.thumb_path !~ ('^' || w.artist_id::text || '/' || w.id::text || '/public/[a-f0-9-]{36}/[a-f0-9-]{36}/thumb\.webp$')
        or i.web_path <> regexp_replace(i.thumb_path, 'thumb\.webp$', 'web.webp'))
        then raise exception 'IMAGE_PATH'; end if;
      manifest := manifest || jsonb_build_array(jsonb_build_object('id', i.id,
        'private_thumb', base || 'thumb.webp', 'private_web', base || 'web.webp',
        'public_thumb', case when p_action = 'publish' then dest || 'thumb.webp' else i.thumb_path end,
        'public_web', case when p_action = 'publish' then dest || 'web.webp' else i.web_path end));
    end loop;
    if jsonb_array_length(manifest) not between 1 and 3 then raise exception 'INCOMPLETE'; end if;
  end if;
  if p_action = 'unpublish' then
    select coalesce(array_agg(path), '{}') into cleanup from public.archive_reviews previous,
      lateral unnest(previous.cleanup_paths) path
      where previous.artwork_id = w.id and previous.action = 'publish';
  end if;
  insert into public.archive_reviews(id,artwork_id,action,reviewer_id,reason,lease_token,images,cleanup_paths)
    values(p_id,w.id,p_action,p_reviewer_id,p_reason,p_lease_token,manifest,cleanup) returning * into r;
  -- Fail closed before deleting public objects. Pending works cannot be edited by artists.
  if p_action = 'unpublish' then
    update public.artworks set status = 'pending_review' where id = w.id;
  end if;
  return to_jsonb(r);
end;
$$;

create function public.finish_archive_review(p_id uuid, p_lease_token uuid, p_success boolean)
returns jsonb language plpgsql set search_path = '' as $$
declare r public.archive_reviews; i jsonb;
begin
  -- Same lock order as prepare; also serializes with artist draft updates.
  perform 1 from public.artworks where id = (select artwork_id from public.archive_reviews where id = p_id) for update;
  select * into r from public.archive_reviews where id = p_id for update;
  if not found then raise exception 'NOT_FOUND'; end if;
  if r.state = 'completed' then return to_jsonb(r); end if;
  if r.lease_token <> p_lease_token or r.state <> 'processing' then raise exception 'CONFLICT'; end if;
  if p_success is null then raise exception 'CONFLICT'; end if;
  if not p_success then
    update public.archive_reviews set state = 'failed' where id = p_id returning * into r;
    return to_jsonb(r);
  end if;
  if not exists(select 1 from public.artworks where id = r.artwork_id and status = 'pending_review')
    then raise exception 'CONFLICT'; end if;
  if r.action = 'publish' and not exists(select 1 from public.artworks w
    join public.artists a on a.id = w.artist_id where w.id = r.artwork_id and a.visibility = 'public')
    then raise exception 'ARTIST_PRIVATE'; end if;
  if r.action <> 'return' then
    for i in select value from jsonb_array_elements(r.images) loop
      update public.artwork_images set
        thumb_path = i->>(case when r.action = 'publish' then 'public_thumb' else 'private_thumb' end),
        web_path = i->>(case when r.action = 'publish' then 'public_web' else 'private_web' end)
      where id = (i->>'id')::uuid and artwork_id = r.artwork_id;
      if not found then raise exception 'CONFLICT'; end if;
    end loop;
  end if;
  update public.artworks set status = (case when r.action = 'publish' then 'published'
    when r.action = 'return' then 'draft' else 'pending_review' end)::public.artwork_status
    where id = r.artwork_id;
  update public.archive_reviews set state = 'completed', completed_at = clock_timestamp()
    where id = p_id returning * into r;
  return to_jsonb(r);
end;
$$;
revoke all on function public.prepare_archive_review(uuid,uuid,text,timestamptz,text,text,uuid),
  public.finish_archive_review(uuid,uuid,boolean) from public, anon, authenticated;
grant execute on function public.prepare_archive_review(uuid,uuid,text,timestamptz,text,text,uuid),
  public.finish_archive_review(uuid,uuid,boolean) to service_role;

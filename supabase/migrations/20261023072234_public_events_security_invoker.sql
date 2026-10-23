-- public_events 를 SECURITY INVOKER 로 바꾼다 (Supabase advisor 0010_security_definer_view).
-- 비공개 Luma 링크는 계속 열 권한으로 가린다: luma_url 자체는 anon/authenticated 에 주지 않고,
-- 공개(luma_visibility = 'public')일 때만 값이 생기는 생성 열 luma_url_public 만 준다.
-- 뷰는 이제 조회하는 역할의 권한·RLS(events_public_read: is_published)로 읽는다.
alter table public.events
  add column luma_url_public text generated always as
    (case when luma_visibility = 'public' then luma_url end) stored;
grant select (luma_url_public) on public.events to anon, authenticated;

create or replace view public.public_events with (security_barrier = true, security_invoker = true) as
select id,title,description,content,event_date,end_date,location,venue,organizer,
  featured_image_url,gallery_images,event_type,status,is_featured,is_published,views,
  max_participants,current_participants,registration_fee,registration_required,
  registration_deadline,contact_email,contact_phone,created_at,updated_at,search_vector,
  exhibition_id,luma_visibility,luma_url_public as luma_url
from public.events where is_published = true;

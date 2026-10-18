-- Clerk identity is server metadata, never a public artist attribute.
revoke select on public.artists from public, anon, authenticated;
revoke select (claimed_by_user_id) on public.artists from public, anon, authenticated;
grant select (id,name,name_en,name_ja,name_zh,bio,bio_en,bio_ja,bio_zh,birth_year,
  nationality,specialties,awards,exhibitions,profile_image,membership_type,artist_type,
  title,created_at,updated_at,airtable_id,art_name_ko,art_name_hanja,calligraphy_styles,
  teacher_artist_id,teacher_name,branch_name,certification_grade,certified_at,
  archive_bio,archive_bio_en,profile_image_path,visibility)
on public.artists to anon, authenticated;

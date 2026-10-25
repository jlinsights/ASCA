-- Previously verified imports remain private at rest. Only a currently public,
-- published artwork's exact linked object is readable with the anon key.
-- This does not expose archive submission originals or pending review files.
BEGIN;
-- Split the original ALL guard: its write restrictions must not inherit this
-- read exception. Keep a restrictive SELECT guard even if other policies exist.
DROP POLICY archive_storage_server_only ON storage.objects;
CREATE POLICY archive_storage_server_only_select ON storage.objects
  AS RESTRICTIVE FOR SELECT TO anon, authenticated
  USING (
    bucket_id NOT IN ('archive-public', 'archive-private')
    OR (
      bucket_id = 'archive-private'
      AND name LIKE 'published-imports/%'
      -- Only the authenticated-object download endpoint. Signing and listing
      -- must stay denied so a signed URL cannot outlive publication permission.
      AND storage.operation() IN ('storage.object.get_authenticated', 'object.get_authenticated')
      AND EXISTS (
        SELECT 1 FROM public.artworks w JOIN public.artists a ON a.id = w.artist_id
        WHERE w.id::text = split_part(storage.objects.name, '/', 2)
          AND w.status = 'published' AND a.visibility = 'public'
          AND w.images->'main'->>'bucket' = 'archive-private'
          AND w.images->'main'->>'path' = storage.objects.name
      )
    )
  );
CREATE POLICY archive_storage_server_only_insert ON storage.objects
  AS RESTRICTIVE FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id NOT IN ('archive-public', 'archive-private'));
CREATE POLICY archive_storage_server_only_update ON storage.objects
  AS RESTRICTIVE FOR UPDATE TO anon, authenticated
  USING (bucket_id NOT IN ('archive-public', 'archive-private'))
  WITH CHECK (bucket_id NOT IN ('archive-public', 'archive-private'));
CREATE POLICY archive_storage_server_only_delete ON storage.objects
  AS RESTRICTIVE FOR DELETE TO anon, authenticated
  USING (bucket_id NOT IN ('archive-public', 'archive-private'));
CREATE POLICY imported_artwork_public_read ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'archive-private' AND name LIKE 'published-imports/%');
COMMIT;

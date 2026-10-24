-- Supabase Auth foundation. Apply this migration individually to ASCA-2026
-- after backup/review. Do not replay legacy migrations or run db:push.
-- Additive only: existing artists, artworks, public CMS policies, and Clerk
-- webhook user_profiles are unchanged.
BEGIN;

CREATE TABLE public.account_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT '',
  locale text NOT NULL DEFAULT 'ko',
  role text NOT NULL DEFAULT 'member',
  disabled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT account_profiles_display_name_length CHECK (char_length(display_name) <= 100),
  CONSTRAINT account_profiles_locale CHECK (locale IN ('ko', 'en', 'ja', 'zh')),
  CONSTRAINT account_profiles_role CHECK (role IN ('member', 'admin'))
);

ALTER TABLE public.account_profiles ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.account_profiles FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.account_profiles TO authenticated;
GRANT UPDATE (display_name, locale) ON public.account_profiles TO authenticated;
GRANT ALL ON public.account_profiles TO service_role;

CREATE POLICY account_profiles_read_self ON public.account_profiles
  FOR SELECT TO authenticated USING (id = (SELECT auth.uid()));
CREATE POLICY account_profiles_update_self ON public.account_profiles
  FOR UPDATE TO authenticated
  USING (id = (SELECT auth.uid()) AND disabled_at IS NULL)
  WITH CHECK (id = (SELECT auth.uid()) AND disabled_at IS NULL);

CREATE FUNCTION public.set_account_profile_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.set_account_profile_updated_at() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER account_profiles_updated_at BEFORE UPDATE ON public.account_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_account_profile_updated_at();

-- Role, disabled_at, legacy identity, and artist ownership are deliberately
-- never copied from raw_user_meta_data (which users can edit themselves).
CREATE FUNCTION public.create_account_profile()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  INSERT INTO public.account_profiles (id, display_name, locale)
  VALUES (
    NEW.id,
    left(COALESCE(NEW.raw_user_meta_data->>'full_name', ''), 100),
    CASE WHEN NEW.raw_user_meta_data->>'locale' IN ('ko', 'en', 'ja', 'zh')
      THEN NEW.raw_user_meta_data->>'locale' ELSE 'ko' END
  );
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.create_account_profile() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER asca_create_account_profile AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_account_profile();

-- Also cover any native users that predate this migration. No role promotion.
INSERT INTO public.account_profiles (id, display_name, locale)
SELECT id, left(COALESCE(raw_user_meta_data->>'full_name', ''), 100),
  CASE WHEN raw_user_meta_data->>'locale' IN ('ko', 'en', 'ja', 'zh')
    THEN raw_user_meta_data->>'locale' ELSE 'ko' END
FROM auth.users;

CREATE TABLE public.auth_identity_links (
  account_id uuid PRIMARY KEY REFERENCES public.account_profiles(id) ON DELETE CASCADE,
  clerk_user_id text NOT NULL UNIQUE,
  linked_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.auth_identity_links ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.auth_identity_links FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.auth_identity_links TO service_role;

-- Narrow RPC returns only the caller's existing artist UUIDs. In particular,
-- it does not expose artists.claimed_by_user_id, contact data, or other users.
-- No writer RPC, generic SQL RPC, ownership grant, or new CMS write policy.
CREATE FUNCTION public.get_my_artist_ids()
RETURNS TABLE (artist_id uuid)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT a.id FROM public.artists AS a
  JOIN public.account_profiles AS p ON p.id = (SELECT auth.uid())
  WHERE a.claimed_by_user_id = p.id::text
    AND p.disabled_at IS NULL
    AND (SELECT auth.jwt()->>'email') IS NOT NULL
    AND (SELECT auth.jwt()->>'is_anonymous') IS DISTINCT FROM 'true';
$$;
REVOKE ALL ON FUNCTION public.get_my_artist_ids() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_artist_ids() TO authenticated;

COMMIT;

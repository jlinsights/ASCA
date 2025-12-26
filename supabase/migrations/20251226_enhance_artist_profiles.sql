-- Create artist_profiles enhancements for portfolio system
-- Migration: 20251226_enhance_artist_profiles

-- Add portfolio and website configuration columns to existing artists table
ALTER TABLE artists 
ADD COLUMN IF NOT EXISTS portfolio_config JSONB DEFAULT '{
  "featuredArtworkIds": [],
  "layout": "grid",
  "showContact": true,
  "showExhibitions": true,
  "showAwards": true
}'::jsonb,
ADD COLUMN IF NOT EXISTS website_config JSONB,
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS profile_views INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS portfolio_views INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS specialization TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS years_active INTEGER,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Create indexes for profile queries
CREATE INDEX IF NOT EXISTS idx_artists_is_public ON artists(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_artists_is_verified ON artists(is_verified) WHERE is_verified = true;
CREATE INDEX IF NOT EXISTS idx_artists_specialization ON artists USING GIN(specialization);
CREATE INDEX IF NOT EXISTS idx_artists_profile_views ON artists(profile_views DESC);

-- Create view for public profiles
CREATE OR REPLACE VIEW public_artist_profiles AS
SELECT 
  a.id,
  a.name,
  a.name_en,
  a.profile_image,
  a.bio,
  a.bio_en,
  a.birth_year,
  a.nationality,
  a.specialization,
  a.years_active,
  a.location,
  a.social_links,
  a.portfolio_config,
  a.profile_views,
  a.portfolio_views,
  a.created_at,
  a.updated_at
FROM artists a
WHERE a.is_public = true;

-- Grant permissions
GRANT SELECT ON public_artist_profiles TO authenticated, anon;

-- Create function to increment profile views
CREATE OR REPLACE FUNCTION increment_profile_views(artist_id_param UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE artists
  SET profile_views = profile_views + 1
  WHERE id = artist_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to increment portfolio views
CREATE OR REPLACE FUNCTION increment_portfolio_views(artist_id_param UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE artists
  SET portfolio_views = portfolio_views + 1
  WHERE id = artist_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create RLS policies for profile management

-- Policy: Artists can view and edit their own profile
CREATE POLICY "Artists can manage own profile"
  ON artists
  FOR ALL
  USING (auth.uid()::text = id);

-- Policy: Anyone can view public profiles
CREATE POLICY "Anyone can view public profiles"
  ON artists
  FOR SELECT
  USING (is_public = true);

-- Add comments for documentation
COMMENT ON COLUMN artists.portfolio_config IS 'Configuration for portfolio display including featured artworks and layout preferences';
COMMENT ON COLUMN artists.website_config IS 'Configuration for personal website builder (future use)';
COMMENT ON COLUMN artists.social_links IS 'JSON object containing social media links';
COMMENT ON COLUMN artists.is_public IS 'Whether the artist profile is publicly visible';
COMMENT ON COLUMN artists.is_verified IS 'Whether the artist profile has been verified by administrators';
COMMENT ON COLUMN artists.profile_views IS 'Total number of profile page views';
COMMENT ON COLUMN artists.portfolio_views IS 'Total number of portfolio page views';

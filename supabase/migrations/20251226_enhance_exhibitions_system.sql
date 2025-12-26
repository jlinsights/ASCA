-- Phase 5: Exhibition Management Enhancement
-- Migration: 20251226_enhance_exhibitions_system.sql
-- Purpose: Add relationship tables for exhibitions-artworks and exhibitions-artists
-- This migration DOES NOT modify the existing exhibitions table

-- ============================================================
-- 1. Exhibition-Artwork Relationship Table
-- ============================================================

CREATE TABLE exhibition_artworks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exhibition_id UUID REFERENCES exhibitions(id) ON DELETE CASCADE NOT NULL,
  artwork_id UUID REFERENCES artworks(id) ON DELETE CASCADE NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  notes TEXT, -- Optional notes about this artwork in the exhibition
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure each artwork appears only once per exhibition
  UNIQUE(exhibition_id, artwork_id)
);

COMMENT ON TABLE exhibition_artworks IS 'Links artworks to exhibitions with display metadata';
COMMENT ON COLUMN exhibition_artworks.display_order IS 'Order in which artwork should be displayed (0-based)';
COMMENT ON COLUMN exhibition_artworks.is_featured IS 'Whether this artwork is featured in the exhibition';

-- ============================================================
-- 2. Exhibition-Artist Relationship Table
-- ============================================================

CREATE TABLE exhibition_artists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exhibition_id UUID REFERENCES exhibitions(id) ON DELETE CASCADE NOT NULL,
  artist_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'participant' CHECK (role IN ('organizer', 'curator', 'participant', 'guest')),
  bio TEXT, -- Optional bio specific to this exhibition
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure each artist appears only once per exhibition
  UNIQUE(exhibition_id, artist_id)
);

COMMENT ON TABLE exhibition_artists IS 'Links artists to exhibitions with role information';
COMMENT ON COLUMN exhibition_artists.role IS 'Role of the artist in this exhibition';

-- ============================================================
-- 3. Indexes for Performance
-- ============================================================

-- Exhibition artworks indexes
CREATE INDEX idx_exhibition_artworks_exhibition ON exhibition_artworks(exhibition_id, display_order);
CREATE INDEX idx_exhibition_artworks_artwork ON exhibition_artworks(artwork_id);
CREATE INDEX idx_exhibition_artworks_featured ON exhibition_artworks(exhibition_id, is_featured) WHERE is_featured = true;

-- Exhibition artists indexes
CREATE INDEX idx_exhibition_artists_exhibition ON exhibition_artists(exhibition_id, display_order);
CREATE INDEX idx_exhibition_artists_artist ON exhibition_artists(artist_id);
CREATE INDEX idx_exhibition_artists_role ON exhibition_artists(exhibition_id, role);

-- ============================================================
-- 4. Triggers for Updated Timestamps
-- ============================================================

CREATE TRIGGER update_exhibition_artworks_updated_at 
  BEFORE UPDATE ON exhibition_artworks
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exhibition_artists_updated_at 
  BEFORE UPDATE ON exhibition_artists
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 5. Row Level Security (RLS) Policies
-- ============================================================

ALTER TABLE exhibition_artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE exhibition_artists ENABLE ROW LEVEL SECURITY;

-- Public can view exhibition artworks
CREATE POLICY "Public can view exhibition artworks" ON exhibition_artworks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM exhibitions e
      WHERE e.id = exhibition_artworks.exhibition_id
      AND e.is_published = true
    )
  );

-- Public can view exhibition artists
CREATE POLICY "Public can view exhibition artists" ON exhibition_artists
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM exhibitions e
      WHERE e.id = exhibition_artists.exhibition_id
      AND e.is_published = true
    )
  );

-- Authenticated users can view their own exhibition artworks (even if not published)
CREATE POLICY "Artists can view own exhibition artworks" ON exhibition_artworks
  FOR SELECT USING (
    auth.uid() IN (
      SELECT artist_id FROM exhibition_artists
      WHERE exhibition_id = exhibition_artworks.exhibition_id
    )
  );

-- Authenticated users can view their own exhibition artists data
CREATE POLICY "Artists can view own exhibition artists" ON exhibition_artists
  FOR SELECT USING (
    auth.uid() = artist_id
  );

-- Artists can manage artworks in exhibitions they organize/curate
CREATE POLICY "Exhibition organizers can manage artworks" ON exhibition_artworks
  FOR ALL USING (
    auth.uid() IN (
      SELECT ea.artist_id FROM exhibition_artists ea
      WHERE ea.exhibition_id = exhibition_artworks.exhibition_id
      AND ea.role IN ('organizer', 'curator')
    )
  );

-- Artists can manage artists in exhibitions they organize/curate
CREATE POLICY "Exhibition organizers can manage artists" ON exhibition_artists
  FOR ALL USING (
    auth.uid() IN (
      SELECT ea.artist_id FROM exhibition_artists ea
      WHERE ea.exhibition_id = exhibition_artists.exhibition_id
      AND ea.role IN ('organizer', 'curator')
    )
  );

-- Admin policies (using existing admin role check)
CREATE POLICY "Admins can manage all exhibition artworks" ON exhibition_artworks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admins can manage all exhibition artists" ON exhibition_artists
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- ============================================================
-- 6. Helper Views
-- ============================================================

-- View: Exhibition with artwork count
CREATE OR REPLACE VIEW exhibitions_with_stats AS
SELECT 
  e.*,
  COUNT(DISTINCT ea.artwork_id) AS artwork_count,
  COUNT(DISTINCT ear.artist_id) AS artist_count,
  COUNT(DISTINCT ea.artwork_id) FILTER (WHERE ea.is_featured = true) AS featured_artwork_count
FROM exhibitions e
LEFT JOIN exhibition_artworks ea ON e.id = ea.exhibition_id
LEFT JOIN exhibition_artists ear ON e.id = ear.exhibition_id
GROUP BY e.id;

COMMENT ON VIEW exhibitions_with_stats IS 'Exhibitions with aggregated statistics';

-- View: Detailed exhibition information (for API use)
CREATE OR REPLACE VIEW exhibition_details AS
SELECT 
  e.*,
  COALESCE(
    json_agg(
      DISTINCT jsonb_build_object(
        'id', ea.id,
        'artwork_id', ea.artwork_id,
        'display_order', ea.display_order,
        'is_featured', ea.is_featured,
        'notes', ea.notes
      ) ORDER BY ea.display_order
    ) FILTER (WHERE ea.id IS NOT NULL),
    '[]'::json
  ) AS artworks,
  COALESCE(
    json_agg(
      DISTINCT jsonb_build_object(
        'id', ear.id,
        'artist_id', ear.artist_id,
        'role', ear.role,
        'bio', ear.bio,
        'display_order', ear.display_order
      ) ORDER BY ear.display_order
    ) FILTER (WHERE ear.id IS NOT NULL),
    '[]'::json
  ) AS artists
FROM exhibitions e
LEFT JOIN exhibition_artworks ea ON e.id = ea.exhibition_id
LEFT JOIN exhibition_artists ear ON e.id = ear.exhibition_id
GROUP BY e.id;

COMMENT ON VIEW exhibition_details IS 'Complete exhibition information with related artworks and artists';

-- ============================================================
-- 7. Helper Functions
-- ============================================================

-- Function: Get exhibition summary for an artist
CREATE OR REPLACE FUNCTION get_artist_exhibition_summary(artist_id_param UUID)
RETURNS TABLE (
  total_exhibitions BIGINT,
  upcoming_exhibitions BIGINT,
  current_exhibitions BIGINT,
  past_exhibitions BIGINT,
  featured_exhibitions BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT e.id) AS total_exhibitions,
    COUNT(DISTINCT e.id) FILTER (WHERE e.status = 'upcoming') AS upcoming_exhibitions,
    COUNT(DISTINCT e.id) FILTER (WHERE e.status = 'current') AS current_exhibitions,
    COUNT(DISTINCT e.id) FILTER (WHERE e.status = 'past') AS past_exhibitions,
    COUNT(DISTINCT e.id) FILTER (WHERE e.is_featured = true) AS featured_exhibitions
  FROM exhibitions e
  INNER JOIN exhibition_artists ea ON e.id = ea.exhibition_id
  WHERE ea.artist_id = artist_id_param
  AND e.is_published = true;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_artist_exhibition_summary IS 'Get exhibition statistics for a specific artist';

-- Function: Update exhibition artwork display order
CREATE OR REPLACE FUNCTION update_exhibition_artwork_order(
  exhibition_id_param UUID,
  artwork_order JSONB -- Array of {artwork_id, display_order}
)
RETURNS void AS $$
DECLARE
  item JSONB;
BEGIN
  FOR item IN SELECT * FROM jsonb_array_elements(artwork_order)
  LOOP
    UPDATE exhibition_artworks
    SET display_order = (item->>'display_order')::INTEGER
    WHERE exhibition_id = exhibition_id_param
    AND artwork_id = (item->>'artwork_id')::UUID;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_exhibition_artwork_order IS 'Bulk update display order for artworks in an exhibition';

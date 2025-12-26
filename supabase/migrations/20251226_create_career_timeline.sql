-- Create career timeline system for artists
-- Migration: 20251226_create_career_timeline

-- Create ENUM for career entry types
CREATE TYPE career_entry_type AS ENUM (
  'exhibition',
  'award',
  'education',
  'publication',
  'media',
  'residency',
  'workshop'
);

-- Create career_timeline table
CREATE TABLE IF NOT EXISTS career_timeline (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Type
  type career_entry_type NOT NULL,
  
  -- Basic info
  title TEXT NOT NULL,
  title_en TEXT,
  organization TEXT,
  organization_en TEXT,
  
  -- Date info
  year INTEGER NOT NULL,
  month INTEGER CHECK (month >= 1 AND month <= 12),
  start_date DATE,
  end_date DATE,
  
  -- Details
  description TEXT,
  description_en TEXT,
  location TEXT,
  role TEXT,
  
  -- Media & Links
  images TEXT[],
  documents TEXT[],
  external_url TEXT,
  
  -- Type-specific data (JSONB for flexibility)
  type_specific_data JSONB DEFAULT '{}'::jsonb,
  
  -- Display & Ordering
  is_featured BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_date_range CHECK (
    start_date IS NULL OR 
    end_date IS NULL OR 
    start_date <= end_date
  )
);

-- Create indexes
CREATE INDEX idx_career_timeline_artist_id ON career_timeline(artist_id);
CREATE INDEX idx_career_timeline_type ON career_timeline(type);
CREATE INDEX idx_career_timeline_year ON career_timeline(year DESC);
CREATE INDEX idx_career_timeline_is_featured ON career_timeline(is_featured) WHERE is_featured = true;
CREATE INDEX idx_career_timeline_artist_year ON career_timeline(artist_id, year DESC);
CREATE INDEX idx_career_timeline_type_specific ON career_timeline USING GIN(type_specific_data);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_career_timeline_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER career_timeline_updated_at
  BEFORE UPDATE ON career_timeline
  FOR EACH ROW
  EXECUTE FUNCTION update_career_timeline_updated_at();

-- Row Level Security (RLS)
ALTER TABLE career_timeline ENABLE ROW LEVEL SECURITY;

-- Policy: Artists can view and manage their own career entries
CREATE POLICY "Artists can manage own career entries"
  ON career_timeline
  FOR ALL
  USING (auth.uid()::text = artist_id);

-- Policy: Public can view all career entries (for public portfolio)
CREATE POLICY "Anyone can view career entries"
  ON career_timeline
  FOR SELECT
  USING (true);

-- Create view for public career timeline
CREATE OR REPLACE VIEW public_career_timeline AS
SELECT 
  ct.id,
  ct.artist_id,
  ct.type,
  ct.title,
  ct.title_en,
  ct.organization,
  ct.organization_en,
  ct.year,
  ct.month,
  ct.start_date,
  ct.end_date,
  ct.description,
  ct.description_en,
  ct.location,
  ct.role,
  ct.images,
  ct.external_url,
  ct.type_specific_data,
  ct.is_featured,
  ct.created_at
FROM career_timeline ct
ORDER BY ct.year DESC, ct.month DESC NULLS LAST, ct.created_at DESC;

-- Grant permissions
GRANT SELECT ON public_career_timeline TO authenticated, anon;

-- Helper function to get career summary by artist
CREATE OR REPLACE FUNCTION get_career_summary(artist_id_param UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_entries', COUNT(*),
    'exhibitions', COUNT(*) FILTER (WHERE type = 'exhibition'),
    'awards', COUNT(*) FILTER (WHERE type = 'award'),
    'education', COUNT(*) FILTER (WHERE type = 'education'),
    'publications', COUNT(*) FILTER (WHERE type = 'publication'),
    'media', COUNT(*) FILTER (WHERE type = 'media'),
    'residencies', COUNT(*) FILTER (WHERE type = 'residency'),
    'workshops', COUNT(*) FILTER (WHERE type = 'workshop'),
    'years_active', MAX(year) - MIN(year) + 1,
    'earliest_year', MIN(year),
    'latest_year', MAX(year)
  ) INTO result
  FROM career_timeline
  WHERE artist_id = artist_id_param;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments for documentation
COMMENT ON TABLE career_timeline IS 'Stores artist career timeline entries including exhibitions, awards, education, etc.';
COMMENT ON COLUMN career_timeline.type_specific_data IS 'Type-specific fields stored as JSONB for flexibility';
COMMENT ON COLUMN career_timeline.display_order IS 'Manual ordering within the same year/type';

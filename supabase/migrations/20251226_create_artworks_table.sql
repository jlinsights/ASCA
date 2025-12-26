-- Create artworks table for artwork management system
-- Migration: 20251226_create_artworks_table

-- Create enum types
CREATE TYPE artwork_category AS ENUM (
  'calligraphy',
  'traditional-painting',
  'modern-painting',
  'sculpture',
  'photography',
  'digital-art',
  'mixed-media',
  'installation',
  'video-art'
);

CREATE TYPE artwork_status AS ENUM (
  'draft',
  'published',
  'archived',
  'in-exhibition'
);

CREATE TYPE dimension_unit AS ENUM (
  'cm',
  'inch',
  'mm'
);

-- Create artworks table
CREATE TABLE IF NOT EXISTS artworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic information
  title TEXT NOT NULL,
  title_en TEXT,
  description TEXT NOT NULL,
  description_en TEXT,
  
  -- Classification
  category artwork_category NOT NULL,
  medium TEXT NOT NULL,
  dimensions JSONB NOT NULL, -- {width, height, depth?, unit}
  year_created INTEGER NOT NULL,
  
  -- Images (stored as JSONB for flexibility)
  images JSONB NOT NULL, -- {main: {id, url, thumbnailUrl, alt, order}, additional: [...]}
  
  -- Sales information
  is_for_sale BOOLEAN DEFAULT FALSE,
  price DECIMAL(10, 2),
  currency TEXT DEFAULT 'KRW',
  
  -- Relationships
  exhibitions TEXT[], -- Array of exhibition IDs
  contests TEXT[], -- Array of contest submission IDs
  
  -- Metadata
  tags TEXT[] DEFAULT '{}',
  style TEXT,
  materials TEXT[] DEFAULT '{}',
  
  -- Status management
  status artwork_status DEFAULT 'draft',
  is_featured BOOLEAN DEFAULT FALSE,
  display_order INTEGER,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE,
  
  -- Statistics
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  
  -- Constraints
  CONSTRAINT valid_year CHECK (year_created >= 1000 AND year_created <= 9999),
  CONSTRAINT valid_price CHECK (price IS NULL OR price >= 0),
  CONSTRAINT valid_dimensions CHECK (jsonb_typeof(dimensions) = 'object')
);

-- Create indexes for better query performance
CREATE INDEX idx_artworks_artist_id ON artworks(artist_id);
CREATE INDEX idx_artworks_category ON artworks(category);
CREATE INDEX idx_artworks_status ON artworks(status);
CREATE INDEX idx_artworks_year_created ON artworks(year_created);
CREATE INDEX idx_artworks_created_at ON artworks(created_at DESC);
CREATE INDEX idx_artworks_is_featured ON artworks(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_artworks_tags ON artworks USING GIN(tags);
CREATE INDEX idx_artworks_exhibitions ON artworks USING GIN(exhibitions);

-- Create full-text search index
CREATE INDEX idx_artworks_search ON artworks USING GIN(
  to_tsvector('korean', COALESCE(title, '') || ' ' || COALESCE(description, '') || ' ' || COALESCE(medium, ''))
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_artwork_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER trigger_update_artwork_timestamp
  BEFORE UPDATE ON artworks
  FOR EACH ROW
  EXECUTE FUNCTION update_artwork_updated_at();

-- Create function to set published_at when status changes to published
CREATE OR REPLACE FUNCTION set_artwork_published_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'published' AND OLD.status != 'published' AND NEW.published_at IS NULL THEN
    NEW.published_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for published_at
CREATE TRIGGER trigger_set_artwork_published
  BEFORE UPDATE ON artworks
  FOR EACH ROW
  EXECUTE FUNCTION set_artwork_published_at();

-- Enable Row Level Security (RLS)
ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Policy: Artists can view their own artworks
CREATE POLICY "Artists can view own artworks"
  ON artworks FOR SELECT
  USING (auth.uid() = artist_id);

-- Policy: Anyone can view published artworks
CREATE POLICY "Anyone can view published artworks"
  ON artworks FOR SELECT
  USING (status = 'published');

-- Policy: Artists can insert their own artworks
CREATE POLICY "Artists can insert own artworks"
  ON artworks FOR INSERT
  WITH CHECK (auth.uid() = artist_id);

-- Policy: Artists can update their own artworks
CREATE POLICY "Artists can update own artworks"
  ON artworks FOR UPDATE
  USING (auth.uid() = artist_id)
  WITH CHECK (auth.uid() = artist_id);

-- Policy: Artists can delete their own artworks
CREATE POLICY "Artists can delete own artworks"
  ON artworks FOR DELETE
  USING (auth.uid() = artist_id);

-- Create view for public artworks (no RLS needed)
CREATE OR REPLACE VIEW public_artworks AS
SELECT 
  a.id,
  a.artist_id,
  a.title,
  a.title_en,
  a.description,
  a.description_en,
  a.category,
  a.medium,
  a.dimensions,
  a.year_created,
  a.images,
  a.is_for_sale,
  a.price,
  a.currency,
  a.tags,
  a.style,
  a.materials,
  a.is_featured,
  a.published_at,
  a.views,
  a.likes
FROM artworks a
WHERE a.status = 'published';

-- Grant permissions
GRANT SELECT ON public_artworks TO authenticated, anon;

-- Add comments for documentation
COMMENT ON TABLE artworks IS 'Stores artwork information for the calligraphy association';
COMMENT ON COLUMN artworks.dimensions IS 'JSON object containing width, height, optional depth, and unit';
COMMENT ON COLUMN artworks.images IS 'JSON object containing main image and optional additional images array';
COMMENT ON COLUMN artworks.exhibitions IS 'Array of exhibition IDs where this artwork is/was displayed';
COMMENT ON COLUMN artworks.contests IS 'Array of contest submission IDs associated with this artwork';

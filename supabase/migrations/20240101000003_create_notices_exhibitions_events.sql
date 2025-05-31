-- Create notices table
CREATE TABLE notices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  is_pinned BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT TRUE,
  views INTEGER DEFAULT 0,
  author_id UUID REFERENCES auth.users(id),
  author_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Full-text search
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('korean', coalesce(title, '') || ' ' || coalesce(content, '') || ' ' || coalesce(category, ''))
  ) STORED
);

-- Create exhibitions table
CREATE TABLE exhibitions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT NOT NULL,
  content TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  location TEXT,
  venue TEXT,
  curator TEXT,
  featured_image_url TEXT,
  gallery_images TEXT[], -- Array of image URLs
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'current', 'past')),
  is_featured BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT TRUE,
  views INTEGER DEFAULT 0,
  max_capacity INTEGER,
  current_visitors INTEGER DEFAULT 0,
  ticket_price DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Full-text search
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('korean', coalesce(title, '') || ' ' || coalesce(subtitle, '') || ' ' || coalesce(description, '') || ' ' || coalesce(curator, ''))
  ) STORED
);

-- Create events table
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  location TEXT,
  venue TEXT,
  organizer TEXT,
  featured_image_url TEXT,
  gallery_images TEXT[], -- Array of image URLs
  event_type TEXT DEFAULT 'workshop' CHECK (event_type IN ('workshop', 'lecture', 'competition', 'exhibition', 'ceremony', 'meeting', 'other')),
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  is_featured BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT TRUE,
  views INTEGER DEFAULT 0,
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  registration_fee DECIMAL(10,2),
  registration_required BOOLEAN DEFAULT FALSE,
  registration_deadline TIMESTAMP WITH TIME ZONE,
  contact_email TEXT,
  contact_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Full-text search
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('korean', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(organizer, '') || ' ' || coalesce(event_type, ''))
  ) STORED
);

-- Create comments table for notices
CREATE TABLE notice_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  notice_id UUID REFERENCES notices(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  author_name TEXT,
  content TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_notices_search ON notices USING GIN(search_vector);
CREATE INDEX idx_notices_category ON notices(category);
CREATE INDEX idx_notices_published ON notices(is_published, published_at DESC);
CREATE INDEX idx_notices_pinned ON notices(is_pinned, published_at DESC);

CREATE INDEX idx_exhibitions_search ON exhibitions USING GIN(search_vector);
CREATE INDEX idx_exhibitions_status ON exhibitions(status);
CREATE INDEX idx_exhibitions_dates ON exhibitions(start_date, end_date);
CREATE INDEX idx_exhibitions_published ON exhibitions(is_published, start_date DESC);

CREATE INDEX idx_events_search ON events USING GIN(search_vector);
CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_events_published ON events(is_published, event_date DESC);

CREATE INDEX idx_notice_comments_notice ON notice_comments(notice_id, created_at DESC);

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updating timestamps
CREATE TRIGGER update_notices_updated_at BEFORE UPDATE ON notices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exhibitions_updated_at BEFORE UPDATE ON exhibitions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notice_comments_updated_at BEFORE UPDATE ON notice_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_notice_views(notice_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE notices SET views = views + 1 WHERE id = notice_uuid;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_exhibition_views(exhibition_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE exhibitions SET views = views + 1 WHERE id = exhibition_uuid;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_event_views(event_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE events SET views = views + 1 WHERE id = event_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to update exhibition status based on dates
CREATE OR REPLACE FUNCTION update_exhibition_status()
RETURNS void AS $$
BEGIN
  UPDATE exhibitions 
  SET status = CASE 
    WHEN start_date > CURRENT_DATE THEN 'upcoming'
    WHEN start_date <= CURRENT_DATE AND end_date >= CURRENT_DATE THEN 'current'
    ELSE 'past'
  END
  WHERE is_published = true;
END;
$$ LANGUAGE plpgsql;

-- Function to update event status based on dates
CREATE OR REPLACE FUNCTION update_event_status()
RETURNS void AS $$
BEGIN
  UPDATE events 
  SET status = CASE 
    WHEN event_date > NOW() THEN 'upcoming'
    WHEN event_date <= NOW() AND (end_date IS NULL OR end_date >= NOW()) THEN 'ongoing'
    WHEN end_date IS NOT NULL AND end_date < NOW() THEN 'completed'
    ELSE 'completed'
  END
  WHERE is_published = true AND status != 'cancelled';
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE exhibitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notice_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public can view published notices" ON notices
  FOR SELECT USING (is_published = true);

CREATE POLICY "Public can view published exhibitions" ON exhibitions
  FOR SELECT USING (is_published = true);

CREATE POLICY "Public can view published events" ON events
  FOR SELECT USING (is_published = true);

CREATE POLICY "Public can view approved comments" ON notice_comments
  FOR SELECT USING (is_approved = true);

-- Create policies for authenticated users
CREATE POLICY "Authenticated users can insert comments" ON notice_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON notice_comments
  FOR UPDATE USING (auth.uid() = user_id);

-- Admin policies (you'll need to create an admin role)
CREATE POLICY "Admins can manage notices" ON notices
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admins can manage exhibitions" ON exhibitions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admins can manage events" ON events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admins can manage comments" ON notice_comments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  ); 
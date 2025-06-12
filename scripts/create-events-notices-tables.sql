-- Events & Notices 테이블 생성 스크립트

-- Events 테이블 생성
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 기본 정보
  title TEXT NOT NULL,
  title_en TEXT,
  title_zh TEXT,
  description TEXT,
  description_en TEXT,
  description_zh TEXT,
  
  -- 일정 정보
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  registration_start TIMESTAMPTZ,
  registration_end TIMESTAMPTZ,
  
  -- 장소 정보
  location TEXT,
  venue TEXT,
  address TEXT,
  
  -- 참가 정보
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  registration_fee DECIMAL(10,2),
  currency TEXT DEFAULT 'KRW',
  is_free BOOLEAN DEFAULT false,
  
  -- 콘텐츠
  featured_image_url TEXT,
  gallery_images TEXT[],
  organizer TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  website TEXT,
  
  -- 상태 관리
  status TEXT CHECK (status IN ('draft', 'upcoming', 'ongoing', 'completed', 'cancelled')) DEFAULT 'draft',
  event_type TEXT CHECK (event_type IN ('workshop', 'exhibition', 'seminar', 'competition', 'ceremony', 'other')) DEFAULT 'other',
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  
  -- 메타데이터
  tags TEXT[],
  requirements TEXT,
  notes TEXT,
  airtable_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notices 테이블 생성  
CREATE TABLE IF NOT EXISTS notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 기본 정보
  title TEXT NOT NULL,
  title_en TEXT,
  title_zh TEXT,
  content TEXT NOT NULL,
  content_en TEXT,
  content_zh TEXT,
  
  -- 요약 및 메타정보
  summary TEXT,
  author TEXT,
  category TEXT CHECK (category IN ('announcement', 'news', 'event', 'regulation', 'general')) DEFAULT 'general',
  
  -- 우선순위 및 상태
  priority TEXT CHECK (priority IN ('low', 'normal', 'high', 'urgent')) DEFAULT 'normal',
  status TEXT CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
  
  -- 표시 설정
  is_pinned BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  show_on_homepage BOOLEAN DEFAULT false,
  
  -- 일정 정보
  published_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  effective_date TIMESTAMPTZ,
  
  -- 첨부 파일 및 미디어
  attachments JSONB DEFAULT '[]'::jsonb,
  featured_image_url TEXT,
  
  -- 대상 및 태그
  target_audience TEXT[],
  tags TEXT[],
  
  -- 외부 링크
  external_link TEXT,
  download_url TEXT,
  
  -- 메타데이터
  airtable_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_airtable_id ON events(airtable_id);
CREATE INDEX IF NOT EXISTS idx_notices_published_at ON notices(published_at);
CREATE INDEX IF NOT EXISTS idx_notices_category ON notices(category);
CREATE INDEX IF NOT EXISTS idx_notices_airtable_id ON notices(airtable_id);

-- Updated at 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notices_updated_at BEFORE UPDATE ON notices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 
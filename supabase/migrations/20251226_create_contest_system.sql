-- Phase 3: Contest Management System
-- Migration: Create contests and contest_applications tables
-- Date: 2025-12-26

-- ==================================================================
-- 1. CONTESTS TABLE
-- ==================================================================

CREATE TABLE IF NOT EXISTS contests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Information
  title TEXT NOT NULL,
  title_en TEXT,
  subtitle TEXT,
  description TEXT NOT NULL,
  description_en TEXT,
  
  -- Organization
  organizer TEXT NOT NULL,  -- 주최기관
  sponsor TEXT,              -- 후원기관
  contact_email TEXT,
  contact_phone TEXT,
  website_url TEXT,
  
  -- Category & Type
  category TEXT NOT NULL CHECK (category IN (
    'calligraphy',    -- 서예
    'painting',       -- 회화
    'sculpture',      -- 조각
    'photography',    -- 사진
    'mixed',          -- 혼합
    'other'           -- 기타
  )),
  contest_type TEXT NOT NULL CHECK (contest_type IN (
    'open',           -- 공개
    'young_artist',   -- 청년작가
    'professional',   -- 전문가
    'student',        -- 학생
    'regional',       -- 지역
    'themed'          -- 테마
  )),
  
  -- Timeline
  announcement_date DATE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  result_date DATE,
  exhibition_date DATE,
  
  -- Requirements
  eligibility TEXT,          -- 참가 자격
  theme TEXT,                -- 주제
  artwork_requirements JSONB DEFAULT '{}'::jsonb, -- 작품 규격, 재료 등
  max_submissions INTEGER DEFAULT 1,
  
  -- Prizes
  prizes JSONB DEFAULT '[]'::jsonb,  -- [{rank: '대상', prize: '500만원', count: 1}]
  total_prize_amount INTEGER,
  
  -- Entry Fee
  entry_fee INTEGER DEFAULT 0,
  payment_methods JSONB DEFAULT '[]'::jsonb,
  
  -- Images
  poster_image_url TEXT,
  gallery_images JSONB DEFAULT '[]'::jsonb,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft',      -- 초안
    'announced',  -- 발표됨
    'open',       -- 접수중
    'closed',     -- 마감
    'judging',    -- 심사중
    'completed'   -- 완료
  )),
  is_featured BOOLEAN DEFAULT false,
  
  -- Statistics
  applicant_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  
  -- Constraints
  CONSTRAINT valid_contest_dates CHECK (start_date <= end_date)
);

-- ==================================================================
-- 2. CONTEST APPLICATIONS TABLE
-- ==================================================================

CREATE TABLE IF NOT EXISTS contest_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relations
  contest_id UUID NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  artwork_ids UUID[] NOT NULL DEFAULT '{}',
  
  -- Application Number (auto-generated)
  application_number TEXT UNIQUE,
  
  -- Artist Information (snapshot at time of application)
  artist_name TEXT NOT NULL,
  artist_email TEXT NOT NULL,
  artist_phone TEXT,
  artist_address TEXT,
  
  -- Submission Details
  submitted_artworks JSONB DEFAULT '[]'::jsonb,  -- Detailed info about each artwork
  artist_statement TEXT,
  notes TEXT,
  
  -- Payment
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN (
    'pending',    -- 대기중
    'completed',  -- 완료
    'waived'      -- 면제
  )),
  payment_amount INTEGER,
  payment_date TIMESTAMPTZ,
  payment_receipt_url TEXT,
  
  -- Status & Results
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN (
    'submitted',     -- 제출됨
    'under_review',  -- 검토중
    'accepted',      -- 승인됨
    'rejected',      -- 거절됨
    'winner'         -- 수상
  )),
  result TEXT,         -- Award/prize won (if any)
  judge_notes TEXT,    -- Internal notes from judges
  
  -- Metadata
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES profiles(id),
  
  -- Constraints
  CONSTRAINT unique_contest_artist UNIQUE(contest_id, artist_id)
);

-- ==================================================================
-- 3. INDEXES
-- ==================================================================

-- Contests indexes
CREATE INDEX idx_contests_status ON contests(status);
CREATE INDEX idx_contests_category ON contests(category);
CREATE INDEX idx_contests_end_date ON contests(end_date);
CREATE INDEX idx_contests_created_by ON contests(created_by);
CREATE INDEX idx_contests_featured ON contests(is_featured) WHERE is_featured = true;

-- Contest applications indexes
CREATE INDEX idx_contest_applications_contest ON contest_applications(contest_id);
CREATE INDEX idx_contest_applications_artist ON contest_applications(artist_id);
CREATE INDEX idx_contest_applications_status ON contest_applications(status);
CREATE INDEX idx_contest_applications_number ON contest_applications(application_number);

-- ==================================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ==================================================================

-- Enable RLS
ALTER TABLE contests ENABLE ROW LEVEL SECURITY;
ALTER TABLE contest_applications ENABLE ROW LEVEL SECURITY;

-- Contests Policies
CREATE POLICY "공모전 공개 조회"
  ON contests FOR SELECT
  USING (status IN ('announced', 'open', 'closed', 'judging', 'completed'));

CREATE POLICY "관리자 공모전 전체 조회"
  ON contests FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

CREATE POLICY "관리자 공모전 생성"
  ON contests FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

CREATE POLICY "관리자 공모전 수정"
  ON contests FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

CREATE POLICY "관리자 공모전 삭제"
  ON contests FOR DELETE
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

-- Contest Applications Policies
CREATE POLICY "본인 신청서 조회"
  ON contest_applications FOR SELECT
  USING (
    artist_id = auth.uid() OR 
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );

CREATE POLICY "공모전 신청"
  ON contest_applications FOR INSERT
  WITH CHECK (
    artist_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM contests 
      WHERE id = contest_id 
      AND status = 'open'
      AND end_date >= CURRENT_DATE
    )
  );

CREATE POLICY "본인 신청서 수정"
  ON contest_applications FOR UPDATE
  USING (
    artist_id = auth.uid() AND 
    status = 'submitted'
  )
  WITH CHECK (
    artist_id = auth.uid()
  );

CREATE POLICY "관리자 신청서 관리"
  ON contest_applications FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

-- ==================================================================
-- 5. TRIGGERS
-- ==================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_contests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER contests_updated_at
  BEFORE UPDATE ON contests
  FOR EACH ROW
  EXECUTE FUNCTION update_contests_updated_at();

CREATE OR REPLACE FUNCTION update_applications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER applications_updated_at
  BEFORE UPDATE ON contest_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_applications_updated_at();

-- Auto-generate application number
CREATE OR REPLACE FUNCTION generate_application_number()
RETURNS TRIGGER AS $$
DECLARE
  contest_year TEXT;
  sequence_num INTEGER;
  new_number TEXT;
BEGIN
  -- Extract year from contest start date
  SELECT EXTRACT(YEAR FROM start_date)::TEXT INTO contest_year
  FROM contests WHERE id = NEW.contest_id;
  
  -- Get next sequence number for this contest
  SELECT COALESCE(MAX(CAST(SPLIT_PART(application_number, '-', 3) AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM contest_applications
  WHERE contest_id = NEW.contest_id;
  
  -- Generate number: YEAR-CONTESTID-SEQ (e.g., 2024-ABC123-001)
  NEW.application_number = contest_year || '-' || 
                           SUBSTRING(NEW.contest_id::TEXT, 1, 8) || '-' ||
                           LPAD(sequence_num::TEXT, 3, '0');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_app_number
  BEFORE INSERT ON contest_applications
  FOR EACH ROW
  WHEN (NEW.application_number IS NULL)
  EXECUTE FUNCTION generate_application_number();

-- Update contest applicant count
CREATE OR REPLACE FUNCTION update_contest_applicant_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE contests 
    SET applicant_count = applicant_count + 1 
    WHERE id = NEW.contest_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE contests 
    SET applicant_count = GREATEST(0, applicant_count - 1) 
    WHERE id = OLD.contest_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_applicant_count
  AFTER INSERT OR DELETE ON contest_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_contest_applicant_count();

-- ==================================================================
-- 6. HELPER FUNCTIONS
-- ==================================================================

-- Get contests with application counts
CREATE OR REPLACE FUNCTION get_contests_with_stats()
RETURNS TABLE (
  contest_data JSONB,
  application_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    to_jsonb(c.*) as contest_data,
    COUNT(ca.id) as application_count
  FROM contests c
  LEFT JOIN contest_applications ca ON c.id = ca.contest_id
  WHERE c.status IN ('announced', 'open', 'closed', 'judging', 'completed')
  GROUP BY c.id
  ORDER BY c.end_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get artist's application summary
CREATE OR REPLACE FUNCTION get_artist_application_summary(artist_uuid UUID)
RETURNS TABLE (
  total_applications BIGINT,
  pending_applications BIGINT,
  accepted_applications BIGINT,
  winner_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_applications,
    COUNT(*) FILTER (WHERE status IN ('submitted', 'under_review'))::BIGINT as pending_applications,
    COUNT(*) FILTER (WHERE status = 'accepted')::BIGINT as accepted_applications,
    COUNT(*) FILTER (WHERE status = 'winner')::BIGINT as winner_count
  FROM contest_applications
  WHERE artist_id = artist_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==================================================================
-- 7. COMMENTS
-- ==================================================================

COMMENT ON TABLE contests IS '공모전 정보를 저장하는 테이블';
COMMENT ON TABLE contest_applications IS '공모전 신청서를 저장하는 테이블';

COMMENT ON COLUMN contests.category IS '공모전 카테고리 (서예, 회화, 조각 등)';
COMMENT ON COLUMN contests.contest_type IS '공모전 유형 (공개, 청년작가, 전문가 등)';
COMMENT ON COLUMN contests.status IS '공모전 상태 (초안, 발표됨, 접수중, 마감, 심사중, 완료)';
COMMENT ON COLUMN contest_applications.status IS '신청서 상태 (제출됨, 검토중, 승인됨, 거절됨, 수상)';
COMMENT ON COLUMN contest_applications.application_number IS '자동 생성되는 신청 번호 (YEAR-CONTESTID-SEQ)';

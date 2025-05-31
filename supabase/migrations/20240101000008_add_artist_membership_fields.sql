-- Add membership_type and artist_type fields to artists table
ALTER TABLE artists 
ADD COLUMN membership_type TEXT CHECK (membership_type IN ('준회원', '정회원', '특별회원', '명예회원')) DEFAULT '준회원',
ADD COLUMN artist_type TEXT CHECK (artist_type IN ('공모작가', '청년작가', '일반작가', '추천작가', '초대작가')) DEFAULT '일반작가';

-- Add comments for documentation
COMMENT ON COLUMN artists.membership_type IS '회원 구분: 준회원, 정회원, 특별회원, 명예회원';
COMMENT ON COLUMN artists.artist_type IS '작가 유형: 공모작가, 청년작가, 일반작가, 추천작가, 초대작가';

-- Create indexes for better performance
CREATE INDEX idx_artists_membership_type ON artists(membership_type);
CREATE INDEX idx_artists_artist_type ON artists(artist_type);

-- Update existing artists with default values if needed
UPDATE artists 
SET 
  membership_type = COALESCE(membership_type, '준회원'),
  artist_type = COALESCE(artist_type, '일반작가')
WHERE membership_type IS NULL OR artist_type IS NULL; 
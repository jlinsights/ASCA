-- Add title field to artists table for executive positions
ALTER TABLE artists 
ADD COLUMN title TEXT CHECK (title IN (
  '이사', '상임이사', '감사', '고문', '상임고문', '자문위원', 
  '운영위원', '심사위원', '운영위원장', '심사위원장', 
  '이사장', '명예이사장', '부회장', '회장'
)) DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN artists.title IS '직위 구분: 이사, 상임이사, 감사, 고문, 상임고문, 자문위원, 운영위원, 심사위원, 운영위원장, 심사위원장, 이사장, 명예이사장, 부회장, 회장 (정회원이면서 추천작가/초대작가 이상만 가능)';

-- Create index for better performance
CREATE INDEX idx_artists_title ON artists(title);

-- Add constraint to ensure only qualified members can have titles
-- This will be enforced at application level as well
ALTER TABLE artists 
ADD CONSTRAINT check_title_eligibility 
CHECK (
  title IS NULL OR (
    membership_type IN ('정회원') AND 
    artist_type IN ('추천작가', '초대작가')
  )
); 
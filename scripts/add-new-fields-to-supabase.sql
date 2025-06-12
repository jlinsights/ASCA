-- Supabase Artists 테이블에 새로운 필드 추가
-- Airtable에서 발견된 새 필드들을 반영

-- 1. Phone 필드 추가
ALTER TABLE artists ADD COLUMN IF NOT EXISTS phone text;

-- 2. Email 필드 추가  
ALTER TABLE artists ADD COLUMN IF NOT EXISTS email text;

-- 3. Date of Birth 필드 추가
ALTER TABLE artists ADD COLUMN IF NOT EXISTS date_of_birth date;

-- 4. Address 필드 추가
ALTER TABLE artists ADD COLUMN IF NOT EXISTS address text;

-- 5. Bio (Korean) 필드 추가
ALTER TABLE artists ADD COLUMN IF NOT EXISTS bio_korean text;

-- 6. Group 필드 추가
ALTER TABLE artists ADD COLUMN IF NOT EXISTS artist_group text;

-- 인덱스 추가 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_artists_phone ON artists(phone);
CREATE INDEX IF NOT EXISTS idx_artists_email ON artists(email);
CREATE INDEX IF NOT EXISTS idx_artists_date_of_birth ON artists(date_of_birth);

-- 새 필드들에 대한 설명 추가
COMMENT ON COLUMN artists.phone IS 'Artist phone number from Airtable';
COMMENT ON COLUMN artists.email IS 'Artist email address from Airtable';
COMMENT ON COLUMN artists.date_of_birth IS 'Artist date of birth from Airtable DOB field';
COMMENT ON COLUMN artists.address IS 'Artist address from Airtable';
COMMENT ON COLUMN artists.bio_korean IS 'Artist biography in Korean from Airtable';
COMMENT ON COLUMN artists.artist_group IS 'Artist group/association from Airtable'; 
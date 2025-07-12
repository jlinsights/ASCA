-- Artists 테이블에 새로운 필드들 추가
-- 기존 테이블에 phone, email, date_of_birth, address, bio_korean, artist_group 필드 추가

-- 전화번호 필드 추가
ALTER TABLE artists 
ADD COLUMN IF NOT EXISTS phone TEXT;

-- 이메일 필드 추가
ALTER TABLE artists 
ADD COLUMN IF NOT EXISTS email TEXT;

-- 생년월일 필드 추가
ALTER TABLE artists 
ADD COLUMN IF NOT EXISTS date_of_birth DATE;

-- 주소 필드 추가
ALTER TABLE artists 
ADD COLUMN IF NOT EXISTS address TEXT;

-- 한국어 약력 필드 추가
ALTER TABLE artists 
ADD COLUMN IF NOT EXISTS bio_korean TEXT;

-- 소속 그룹 필드 추가
ALTER TABLE artists 
ADD COLUMN IF NOT EXISTS artist_group TEXT;

-- 인덱스 추가 (이메일과 전화번호에 대해)
CREATE INDEX IF NOT EXISTS idx_artists_email ON artists(email);
CREATE INDEX IF NOT EXISTS idx_artists_phone ON artists(phone);

-- 코멘트 추가
COMMENT ON COLUMN artists.phone IS '작가 전화번호';
COMMENT ON COLUMN artists.email IS '작가 이메일 주소';
COMMENT ON COLUMN artists.date_of_birth IS '작가 생년월일';
COMMENT ON COLUMN artists.address IS '작가 주소';
COMMENT ON COLUMN artists.bio_korean IS '작가 한국어 약력';
COMMENT ON COLUMN artists.artist_group IS '작가 소속 그룹'; 
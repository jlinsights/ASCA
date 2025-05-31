-- ASCA (Asian Calligraphy Cultural Association) Database Schema
-- 이 파일을 Supabase SQL Editor에서 실행하여 테이블을 생성하세요.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Artists Table (작가 테이블)
CREATE TABLE IF NOT EXISTS artists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  name_en VARCHAR(255),
  name_ja VARCHAR(255), 
  name_zh VARCHAR(255),
  bio TEXT NOT NULL,
  bio_en TEXT,
  bio_ja TEXT,
  bio_zh TEXT,
  profile_image TEXT,
  birth_year INTEGER,
  nationality VARCHAR(100),
  specialties TEXT[], -- 전문 분야 배열
  awards TEXT[], -- 수상 경력 배열
  exhibitions TEXT[], -- 전시 경력 배열
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Artworks Table (작품 테이블)
CREATE TABLE IF NOT EXISTS artworks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  title_en VARCHAR(255),
  title_ja VARCHAR(255),
  title_zh VARCHAR(255),
  description TEXT NOT NULL,
  description_en TEXT,
  description_ja TEXT,
  description_zh TEXT,
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL CHECK (category IN ('calligraphy', 'painting', 'sculpture', 'mixed-media')),
  style VARCHAR(50) NOT NULL CHECK (style IN ('traditional', 'contemporary', 'modern')),
  year INTEGER NOT NULL,
  materials TEXT[] NOT NULL, -- 재료 배열
  dimensions JSONB NOT NULL, -- {width: number, height: number, depth?: number, unit: 'cm'|'mm'|'inch'}
  price JSONB, -- {amount: number, currency: 'KRW'|'USD'|'EUR'|'JPY'}
  availability VARCHAR(20) DEFAULT 'available' CHECK (availability IN ('available', 'sold', 'reserved')),
  featured BOOLEAN DEFAULT FALSE,
  tags TEXT[] DEFAULT '{}', -- 태그 배열
  images TEXT[] NOT NULL, -- 이미지 URL 배열
  thumbnail TEXT NOT NULL, -- 썸네일 이미지 URL
  exhibition_history TEXT[], -- 전시 이력
  condition TEXT, -- 작품 상태
  technique TEXT, -- 기법
  authenticity_certificate BOOLEAN DEFAULT TRUE, -- 진품 보증서 여부
  views INTEGER DEFAULT 0, -- 조회수
  likes INTEGER DEFAULT 0, -- 좋아요 수
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_artists_name ON artists(name);
CREATE INDEX IF NOT EXISTS idx_artists_nationality ON artists(nationality);
CREATE INDEX IF NOT EXISTS idx_artworks_artist_id ON artworks(artist_id);
CREATE INDEX IF NOT EXISTS idx_artworks_category ON artworks(category);
CREATE INDEX IF NOT EXISTS idx_artworks_style ON artworks(style);
CREATE INDEX IF NOT EXISTS idx_artworks_availability ON artworks(availability);
CREATE INDEX IF NOT EXISTS idx_artworks_featured ON artworks(featured);
CREATE INDEX IF NOT EXISTS idx_artworks_year ON artworks(year);
CREATE INDEX IF NOT EXISTS idx_artworks_created_at ON artworks(created_at);

-- Update triggers (updated_at 자동 업데이트)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_artists_updated_at BEFORE UPDATE ON artists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_artworks_updated_at BEFORE UPDATE ON artworks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RPC Functions (저장 프로시저)

-- 작품 조회수 증가 함수
CREATE OR REPLACE FUNCTION increment_artwork_views(artwork_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE artworks 
    SET views = views + 1 
    WHERE id = artwork_id;
END;
$$ LANGUAGE plpgsql;

-- 작품 좋아요 토글 함수
CREATE OR REPLACE FUNCTION toggle_artwork_like(artwork_id UUID, increment_likes BOOLEAN)
RETURNS VOID AS $$
BEGIN
    IF increment_likes THEN
        UPDATE artworks 
        SET likes = likes + 1 
        WHERE id = artwork_id;
    ELSE
        UPDATE artworks 
        SET likes = GREATEST(likes - 1, 0) 
        WHERE id = artwork_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) 설정
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기 가능하도록 설정
CREATE POLICY "Allow public read access on artists" ON artists
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access on artworks" ON artworks
    FOR SELECT USING (true);

-- 관리자만 쓰기 가능하도록 설정 (나중에 관리자 시스템 구축 시 수정)
-- CREATE POLICY "Allow admin write access on artists" ON artists
--     FOR ALL USING (auth.role() = 'admin');

-- CREATE POLICY "Allow admin write access on artworks" ON artworks
--     FOR ALL USING (auth.role() = 'admin');

-- 샘플 데이터 삽입
INSERT INTO artists (name, name_en, bio, bio_en, nationality, birth_year, specialties, awards, exhibitions) VALUES
('김정호', 'Kim Jung-ho', '전통 한국 서예의 현대적 해석으로 유명한 서예가입니다. 40여 년간 서예에 매진하며 독창적인 작품 세계를 구축했습니다.', 'A calligrapher famous for modern interpretations of traditional Korean calligraphy. Has dedicated over 40 years to calligraphy, building a unique artistic world.', '대한민국', 1955, 
ARRAY['한국 서예', '현대 서예', '문인화'], 
ARRAY['2020년 대한민국 서예대전 대상', '2018년 아시아 서예 비엔날레 금상', '2015년 전통문화예술진흥원 특별상'],
ARRAY['2023년 국립현대미술관 개인전', '2022년 서울시립미술관 "현대 서예의 흐름"', '2021년 부산시립미술관 "동양 정신의 현대적 표현"']),

('다나카 히로시', 'Tanaka Hiroshi', '일본 전통 서도를 바탕으로 현대적 감각을 접목한 작품 활동을 하고 있는 서예가입니다.', 'A calligrapher who incorporates modern sensibilities into traditional Japanese shodo.', '일본', 1962, 
ARRAY['일본 서도', '현대 서예', '추상 표현'], 
ARRAY['2019년 일본 서도협회 최우수상', '2017년 국제 서예 비엔날레 특별상'],
ARRAY['2023년 도쿄국립박물관 기획전', '2022년 교토국립근대미술관 개인전']),

('왕메이링', 'Wang Mei-ling', '중국 전통 서법의 정신을 현대적으로 재해석하는 작업을 하고 있는 서예가입니다.', 'A calligrapher who reinterprets the spirit of traditional Chinese calligraphy in a modern context.', '중국', 1970, 
ARRAY['중국 서법', '현대 서예', '수묵화'], 
ARRAY['2021년 중국 서법가협회 우수상', '2019년 베이징 국제 서예전 금상'],
ARRAY['2023년 중국국가박물관 기획전', '2022년 상하이미술관 개인전']);

INSERT INTO artworks (title, title_en, description, description_en, artist_id, category, style, year, materials, dimensions, price, availability, featured, tags, images, thumbnail) VALUES
('봄날의 시', 'Spring Day Poem', '봄의 정취를 담은 한국 전통 서예 작품입니다. 유려한 필선과 조화로운 구성이 돋보입니다.', 'A traditional Korean calligraphy work capturing the essence of spring. Features graceful brushstrokes and harmonious composition.', 
(SELECT id FROM artists WHERE name = '김정호'), 'calligraphy', 'traditional', 2023, 
ARRAY['한지', '먹', '붓'], 
'{"width": 50, "height": 70, "unit": "cm"}', 
'{"amount": 1500000, "currency": "KRW"}', 
'available', true, 
ARRAY['봄', '시', '전통', '한국서예'], 
ARRAY['https://example.com/spring-poem-1.jpg', 'https://example.com/spring-poem-2.jpg'], 
'https://example.com/spring-poem-thumb.jpg'),

('바람의 선율', 'Wind Melody', '현대적 감각으로 재해석한 추상 서예 작품입니다.', 'An abstract calligraphy work reinterpreted with modern sensibilities.', 
(SELECT id FROM artists WHERE name = '다나카 히로시'), 'calligraphy', 'contemporary', 2022, 
ARRAY['화선지', '먹', '붓'], 
'{"width": 60, "height": 80, "unit": "cm"}', 
'{"amount": 2000000, "currency": "KRW"}', 
'available', true, 
ARRAY['바람', '추상', '현대', '일본서도'], 
ARRAY['https://example.com/wind-melody-1.jpg'], 
'https://example.com/wind-melody-thumb.jpg'),

('묵향', 'Ink Fragrance', '전통 중국 서법의 아름다움을 현대적으로 표현한 작품입니다.', 'A work that expresses the beauty of traditional Chinese calligraphy in a modern way.', 
(SELECT id FROM artists WHERE name = '왕메이링'), 'calligraphy', 'modern', 2023, 
ARRAY['선지', '먹', '붓'], 
'{"width": 45, "height": 65, "unit": "cm"}', 
'{"amount": 1800000, "currency": "KRW"}', 
'available', false, 
ARRAY['먹향', '중국서법', '현대'], 
ARRAY['https://example.com/ink-fragrance-1.jpg'], 
'https://example.com/ink-fragrance-thumb.jpg');

-- 완료 메시지
SELECT 'Database schema created successfully!' as message; 
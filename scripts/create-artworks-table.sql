-- Supabase artworks 테이블 생성 스크립트
-- Airtable과 완벽하게 연동 가능한 구조

-- 먼저 artists 테이블이 존재하는지 확인 (외래키 참조용)
CREATE TABLE IF NOT EXISTS public.artists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    name_en TEXT,
    name_ja TEXT,
    name_zh TEXT,
    bio TEXT DEFAULT '',
    bio_en TEXT,
    bio_ja TEXT,
    bio_zh TEXT,
    birth_year INTEGER,
    nationality TEXT,
    specialties TEXT[] DEFAULT '{}',
    awards TEXT[] DEFAULT '{}',
    exhibitions TEXT[] DEFAULT '{}',
    profile_image TEXT,
    membership_type TEXT DEFAULT '준회원',
    artist_type TEXT DEFAULT '일반작가',
    title TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- artworks 테이블 생성 (Airtable 필드와 1:1 매핑)
CREATE TABLE IF NOT EXISTS public.artworks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- 작가 정보 (외래키)
    artist_id UUID REFERENCES public.artists(id) ON DELETE CASCADE NOT NULL,
    
    -- 제목 (다국어 지원)
    title TEXT NOT NULL,                    -- Airtable: Title (Korean)
    title_en TEXT,                          -- Airtable: Title (English)
    title_ja TEXT,                          -- Airtable: Title (Japanese)
    title_zh TEXT,                          -- Airtable: Title (Chinese)
    
    -- 설명 (다국어 지원)
    description TEXT DEFAULT '',            -- Airtable: Description (Korean)
    description_en TEXT,                    -- Airtable: Description (English)
    
    -- 작품 분류
    category TEXT DEFAULT 'mixed-media',    -- Airtable: Category
    style TEXT DEFAULT 'traditional',      -- Airtable: Style
    year INTEGER,                           -- Airtable: Year
    
    -- 재료 및 기법
    materials TEXT[] DEFAULT '{}',          -- Airtable: Materials
    technique TEXT,                         -- Airtable: Technique
    condition TEXT,                         -- Airtable: Condition
    
    -- 크기 정보 (JSON 형태로 저장)
    dimensions JSONB DEFAULT '{"width": 0, "height": 0, "unit": "cm"}',
    
    -- 가격 정보 (JSON 형태로 저장)
    price JSONB DEFAULT '{"amount": null, "currency": "KRW"}',
    
    -- 상태 및 메타데이터
    availability TEXT DEFAULT 'available',  -- Airtable: Availability
    featured BOOLEAN DEFAULT false,         -- Airtable: Featured
    authenticity_certificate BOOLEAN DEFAULT false, -- Airtable: Authenticity Certificate
    
    -- 이미지 및 태그
    images TEXT[] DEFAULT '{}',             -- Airtable: Images (URL 배열)
    thumbnail TEXT,                         -- 대표 이미지 (첫 번째 이미지)
    tags TEXT[] DEFAULT '{}',               -- Airtable: Tags
    
    -- 시스템 타임스탬프
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_artworks_artist_id ON public.artworks(artist_id);
CREATE INDEX IF NOT EXISTS idx_artworks_category ON public.artworks(category);
CREATE INDEX IF NOT EXISTS idx_artworks_style ON public.artworks(style);
CREATE INDEX IF NOT EXISTS idx_artworks_year ON public.artworks(year);
CREATE INDEX IF NOT EXISTS idx_artworks_featured ON public.artworks(featured);
CREATE INDEX IF NOT EXISTS idx_artworks_availability ON public.artworks(availability);
CREATE INDEX IF NOT EXISTS idx_artworks_created_at ON public.artworks(created_at);

-- 전문 검색 인덱스 (제목 및 설명)
CREATE INDEX IF NOT EXISTS idx_artworks_title_search ON public.artworks USING gin(to_tsvector('korean', title));
CREATE INDEX IF NOT EXISTS idx_artworks_description_search ON public.artworks USING gin(to_tsvector('korean', description));

-- 배열 필드 인덱스 (GIN 인덱스)
CREATE INDEX IF NOT EXISTS idx_artworks_materials ON public.artworks USING gin(materials);
CREATE INDEX IF NOT EXISTS idx_artworks_tags ON public.artworks USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_artworks_images ON public.artworks USING gin(images);

-- updated_at 자동 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- updated_at 트리거 생성
DROP TRIGGER IF EXISTS update_artworks_updated_at ON public.artworks;
CREATE TRIGGER update_artworks_updated_at
    BEFORE UPDATE ON public.artworks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) 설정
ALTER TABLE public.artworks ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기 가능 (공개 데이터)
CREATE POLICY "Artworks are viewable by everyone" ON public.artworks
    FOR SELECT USING (true);

-- 인증된 사용자만 수정 가능 (관리자 전용)
CREATE POLICY "Artworks are editable by authenticated users" ON public.artworks
    FOR ALL USING (auth.role() = 'authenticated');

-- 유용한 뷰 생성 (Airtable 형태와 유사한 데이터 형식)
CREATE OR REPLACE VIEW public.artworks_with_artist AS
SELECT 
    a.id,
    a.title,
    a.title_en,
    a.title_ja,
    a.title_zh,
    a.description,
    a.description_en,
    a.category,
    a.style,
    a.year,
    a.materials,
    a.technique,
    a.condition,
    a.dimensions,
    a.price,
    a.availability,
    a.featured,
    a.authenticity_certificate,
    a.images,
    a.thumbnail,
    a.tags,
    a.created_at,
    a.updated_at,
    -- 작가 정보 조인
    ar.name as artist_name,
    ar.name_en as artist_name_en,
    ar.id as artist_id
FROM public.artworks a
LEFT JOIN public.artists ar ON a.artist_id = ar.id;

-- 제약 조건 추가
ALTER TABLE public.artworks 
ADD CONSTRAINT check_category CHECK (category IN ('calligraphy', 'painting', 'sculpture', 'mixed-media')),
ADD CONSTRAINT check_style CHECK (style IN ('traditional', 'contemporary', 'modern')),
ADD CONSTRAINT check_availability CHECK (availability IN ('available', 'sold', 'reserved'));

-- 샘플 데이터 확인용 함수
CREATE OR REPLACE FUNCTION get_artworks_stats()
RETURNS TABLE (
    total_artworks BIGINT,
    by_category JSON,
    by_availability JSON,
    featured_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_artworks,
        json_object_agg(category, cnt) as by_category,
        json_object_agg(availability, avail_cnt) as by_availability,
        COUNT(*) FILTER (WHERE featured = true) as featured_count
    FROM (
        SELECT 
            category, 
            COUNT(*) as cnt,
            availability,
            COUNT(*) as avail_cnt
        FROM public.artworks 
        GROUP BY category, availability
    ) stats;
END;
$$ LANGUAGE plpgsql;

-- 완료 메시지
DO $$
BEGIN
    RAISE NOTICE '✅ Artworks 테이블 생성 완료!';
    RAISE NOTICE '📊 다음 명령으로 통계 확인: SELECT * FROM get_artworks_stats();';
    RAISE NOTICE '🎨 뷰로 데이터 조회: SELECT * FROM artworks_with_artist LIMIT 10;';
    RAISE NOTICE '🔗 Airtable 마이그레이션 준비 완료!';
END $$; 
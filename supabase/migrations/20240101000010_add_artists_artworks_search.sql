-- 작가와 작품 검색 기능 추가

-- 1. 작가 테이블에 검색 벡터 컬럼 추가
ALTER TABLE artists ADD COLUMN IF NOT EXISTS search_vector TSVECTOR;

-- 2. 작품 테이블에 검색 벡터 컬럼 추가
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS search_vector TSVECTOR;

-- 3. 작가 검색 벡터 업데이트 함수
CREATE OR REPLACE FUNCTION update_artists_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('korean', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('korean', COALESCE(NEW.name_en, '')), 'A') ||
    setweight(to_tsvector('korean', COALESCE(NEW.name_ja, '')), 'A') ||
    setweight(to_tsvector('korean', COALESCE(NEW.name_zh, '')), 'A') ||
    setweight(to_tsvector('korean', COALESCE(NEW.bio, '')), 'B') ||
    setweight(to_tsvector('korean', COALESCE(NEW.bio_en, '')), 'B') ||
    setweight(to_tsvector('korean', COALESCE(NEW.bio_ja, '')), 'B') ||
    setweight(to_tsvector('korean', COALESCE(NEW.bio_zh, '')), 'B') ||
    setweight(to_tsvector('korean', COALESCE(NEW.nationality, '')), 'C') ||
    setweight(to_tsvector('korean', COALESCE(array_to_string(NEW.specialties, ' '), '')), 'B') ||
    setweight(to_tsvector('korean', COALESCE(array_to_string(NEW.awards, ' '), '')), 'C') ||
    setweight(to_tsvector('korean', COALESCE(array_to_string(NEW.exhibitions, ' '), '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. 작품 검색 벡터 업데이트 함수
CREATE OR REPLACE FUNCTION update_artworks_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('korean', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('korean', COALESCE(NEW.title_en, '')), 'A') ||
    setweight(to_tsvector('korean', COALESCE(NEW.title_ja, '')), 'A') ||
    setweight(to_tsvector('korean', COALESCE(NEW.title_zh, '')), 'A') ||
    setweight(to_tsvector('korean', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('korean', COALESCE(NEW.description_en, '')), 'B') ||
    setweight(to_tsvector('korean', COALESCE(NEW.description_ja, '')), 'B') ||
    setweight(to_tsvector('korean', COALESCE(NEW.description_zh, '')), 'B') ||
    setweight(to_tsvector('korean', COALESCE(NEW.category, '')), 'B') ||
    setweight(to_tsvector('korean', COALESCE(NEW.style, '')), 'B') ||
    setweight(to_tsvector('korean', COALESCE(array_to_string(NEW.materials, ' '), '')), 'C') ||
    setweight(to_tsvector('korean', COALESCE(array_to_string(NEW.tags, ' '), '')), 'B') ||
    setweight(to_tsvector('korean', COALESCE(NEW.technique, '')), 'C') ||
    setweight(to_tsvector('korean', COALESCE(NEW.condition, '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. 트리거 생성
DROP TRIGGER IF EXISTS artists_search_vector_update ON artists;
CREATE TRIGGER artists_search_vector_update
  BEFORE INSERT OR UPDATE ON artists
  FOR EACH ROW EXECUTE FUNCTION update_artists_search_vector();

DROP TRIGGER IF EXISTS artworks_search_vector_update ON artworks;
CREATE TRIGGER artworks_search_vector_update
  BEFORE INSERT OR UPDATE ON artworks
  FOR EACH ROW EXECUTE FUNCTION update_artworks_search_vector();

-- 6. 기존 데이터의 검색 벡터 업데이트
UPDATE artists SET search_vector = 
  setweight(to_tsvector('korean', COALESCE(name, '')), 'A') ||
  setweight(to_tsvector('korean', COALESCE(name_en, '')), 'A') ||
  setweight(to_tsvector('korean', COALESCE(name_ja, '')), 'A') ||
  setweight(to_tsvector('korean', COALESCE(name_zh, '')), 'A') ||
  setweight(to_tsvector('korean', COALESCE(bio, '')), 'B') ||
  setweight(to_tsvector('korean', COALESCE(bio_en, '')), 'B') ||
  setweight(to_tsvector('korean', COALESCE(bio_ja, '')), 'B') ||
  setweight(to_tsvector('korean', COALESCE(bio_zh, '')), 'B') ||
  setweight(to_tsvector('korean', COALESCE(nationality, '')), 'C') ||
  setweight(to_tsvector('korean', COALESCE(array_to_string(specialties, ' '), '')), 'B') ||
  setweight(to_tsvector('korean', COALESCE(array_to_string(awards, ' '), '')), 'C') ||
  setweight(to_tsvector('korean', COALESCE(array_to_string(exhibitions, ' '), '')), 'C');

UPDATE artworks SET search_vector = 
  setweight(to_tsvector('korean', COALESCE(title, '')), 'A') ||
  setweight(to_tsvector('korean', COALESCE(title_en, '')), 'A') ||
  setweight(to_tsvector('korean', COALESCE(title_ja, '')), 'A') ||
  setweight(to_tsvector('korean', COALESCE(title_zh, '')), 'A') ||
  setweight(to_tsvector('korean', COALESCE(description, '')), 'B') ||
  setweight(to_tsvector('korean', COALESCE(description_en, '')), 'B') ||
  setweight(to_tsvector('korean', COALESCE(description_ja, '')), 'B') ||
  setweight(to_tsvector('korean', COALESCE(description_zh, '')), 'B') ||
  setweight(to_tsvector('korean', COALESCE(category, '')), 'B') ||
  setweight(to_tsvector('korean', COALESCE(style, '')), 'B') ||
  setweight(to_tsvector('korean', COALESCE(array_to_string(materials, ' '), '')), 'C') ||
  setweight(to_tsvector('korean', COALESCE(array_to_string(tags, ' '), '')), 'B') ||
  setweight(to_tsvector('korean', COALESCE(technique, '')), 'C') ||
  setweight(to_tsvector('korean', COALESCE(condition, '')), 'D');

-- 7. 검색 성능 향상을 위한 GIN 인덱스 추가
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_artists_search_vector_gin 
ON artists USING gin(search_vector);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_artworks_search_vector_gin 
ON artworks USING gin(search_vector);

-- 8. 작가 검색 함수
CREATE OR REPLACE FUNCTION search_artists(
  search_query TEXT DEFAULT NULL,
  nationality_filter TEXT DEFAULT NULL,
  artist_type_filter TEXT DEFAULT NULL,
  membership_type_filter TEXT DEFAULT NULL,
  limit_count INTEGER DEFAULT 20,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID, name TEXT, name_en TEXT, name_ja TEXT, name_zh TEXT,
  bio TEXT, bio_en TEXT, bio_ja TEXT, bio_zh TEXT,
  profile_image TEXT, birth_year INTEGER, nationality TEXT,
  specialties TEXT[], awards TEXT[], exhibitions TEXT[],
  membership_type TEXT, artist_type TEXT, title TEXT,
  created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ, rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id, a.name, a.name_en, a.name_ja, a.name_zh,
    a.bio, a.bio_en, a.bio_ja, a.bio_zh,
    a.profile_image, a.birth_year, a.nationality,
    a.specialties, a.awards, a.exhibitions,
    a.membership_type, a.artist_type, a.title,
    a.created_at, a.updated_at,
    CASE 
      WHEN search_query IS NOT NULL THEN 
        ts_rank(a.search_vector, plainto_tsquery('korean', search_query))
      ELSE 0
    END as rank
  FROM artists a
  WHERE 
    (search_query IS NULL OR a.search_vector @@ plainto_tsquery('korean', search_query))
    AND (nationality_filter IS NULL OR a.nationality = nationality_filter)
    AND (artist_type_filter IS NULL OR a.artist_type = artist_type_filter)
    AND (membership_type_filter IS NULL OR a.membership_type = membership_type_filter)
  ORDER BY 
    CASE WHEN search_query IS NOT NULL THEN rank END DESC,
    a.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- 9. 작품 검색 함수
CREATE OR REPLACE FUNCTION search_artworks(
  search_query TEXT DEFAULT NULL,
  category_filter TEXT DEFAULT NULL,
  style_filter TEXT DEFAULT NULL,
  availability_filter TEXT DEFAULT NULL,
  artist_id_filter UUID DEFAULT NULL,
  year_from INTEGER DEFAULT NULL,
  year_to INTEGER DEFAULT NULL,
  limit_count INTEGER DEFAULT 20,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID, title TEXT, title_en TEXT, title_ja TEXT, title_zh TEXT,
  description TEXT, description_en TEXT, description_ja TEXT, description_zh TEXT,
  artist_id UUID, category TEXT, style TEXT, year INTEGER,
  materials TEXT[], dimensions JSONB, price JSONB, availability TEXT,
  featured BOOLEAN, tags TEXT[], images TEXT[], thumbnail TEXT,
  exhibition_history TEXT[], condition TEXT, technique TEXT,
  authenticity_certificate BOOLEAN, views INTEGER, likes INTEGER,
  created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ, rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    aw.id, aw.title, aw.title_en, aw.title_ja, aw.title_zh,
    aw.description, aw.description_en, aw.description_ja, aw.description_zh,
    aw.artist_id, aw.category, aw.style, aw.year,
    aw.materials, aw.dimensions, aw.price, aw.availability,
    aw.featured, aw.tags, aw.images, aw.thumbnail,
    aw.exhibition_history, aw.condition, aw.technique,
    aw.authenticity_certificate, aw.views, aw.likes,
    aw.created_at, aw.updated_at,
    CASE 
      WHEN search_query IS NOT NULL THEN 
        ts_rank(aw.search_vector, plainto_tsquery('korean', search_query))
      ELSE 0
    END as rank
  FROM artworks aw
  WHERE 
    (search_query IS NULL OR aw.search_vector @@ plainto_tsquery('korean', search_query))
    AND (category_filter IS NULL OR aw.category = category_filter)
    AND (style_filter IS NULL OR aw.style = style_filter)
    AND (availability_filter IS NULL OR aw.availability = availability_filter)
    AND (artist_id_filter IS NULL OR aw.artist_id = artist_id_filter)
    AND (year_from IS NULL OR aw.year >= year_from)
    AND (year_to IS NULL OR aw.year <= year_to)
  ORDER BY 
    CASE WHEN search_query IS NOT NULL THEN rank END DESC,
    aw.featured DESC,
    aw.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- 10. 통합 검색 함수 업데이트 (작가와 작품 포함)
CREATE OR REPLACE FUNCTION search_all_content(
  search_query TEXT,
  limit_count INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content_type TEXT,
  excerpt TEXT,
  url TEXT,
  created_at TIMESTAMPTZ,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  (
    SELECT 
      n.id,
      n.title,
      'notice'::TEXT as content_type,
      n.excerpt,
      '/notice/' || n.id as url,
      n.created_at,
      ts_rank(n.search_vector, plainto_tsquery('korean', search_query)) as rank
    FROM notices n
    WHERE n.search_vector @@ plainto_tsquery('korean', search_query)
      AND n.status = 'published'
  )
  UNION ALL
  (
    SELECT 
      e.id,
      e.title,
      'exhibition'::TEXT as content_type,
      LEFT(e.description, 200) as excerpt,
      '/exhibitions/' || e.id as url,
      e.created_at,
      ts_rank(e.search_vector, plainto_tsquery('korean', search_query)) as rank
    FROM exhibitions e
    WHERE e.search_vector @@ plainto_tsquery('korean', search_query)
      AND e.status = 'published'
  )
  UNION ALL
  (
    SELECT 
      ev.id,
      ev.title,
      'event'::TEXT as content_type,
      LEFT(ev.description, 200) as excerpt,
      '/events/' || ev.id as url,
      ev.created_at,
      ts_rank(ev.search_vector, plainto_tsquery('korean', search_query)) as rank
    FROM events ev
    WHERE ev.search_vector @@ plainto_tsquery('korean', search_query)
      AND ev.status = 'published'
  )
  UNION ALL
  (
    SELECT 
      a.id,
      a.name as title,
      'artist'::TEXT as content_type,
      LEFT(a.bio, 200) as excerpt,
      '/artists/' || a.id as url,
      a.created_at,
      ts_rank(a.search_vector, plainto_tsquery('korean', search_query)) as rank
    FROM artists a
    WHERE a.search_vector @@ plainto_tsquery('korean', search_query)
  )
  UNION ALL
  (
    SELECT 
      aw.id,
      aw.title,
      'artwork'::TEXT as content_type,
      LEFT(aw.description, 200) as excerpt,
      '/artworks/' || aw.id as url,
      aw.created_at,
      ts_rank(aw.search_vector, plainto_tsquery('korean', search_query)) as rank
    FROM artworks aw
    WHERE aw.search_vector @@ plainto_tsquery('korean', search_query)
      AND aw.availability = 'available'
  )
  ORDER BY rank DESC, created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql; 
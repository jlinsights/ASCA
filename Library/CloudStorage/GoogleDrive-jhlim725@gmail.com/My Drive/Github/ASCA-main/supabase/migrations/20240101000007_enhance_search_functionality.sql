-- 검색 및 필터링 최적화

-- 1. 한국어 검색을 위한 커스텀 텍스트 검색 설정
CREATE TEXT SEARCH CONFIGURATION korean (COPY = simple);

-- 2. 검색 성능 향상을 위한 GIN 인덱스 추가
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notices_search_vector_gin 
ON notices USING gin(search_vector);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_exhibitions_search_vector_gin 
ON exhibitions USING gin(search_vector);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_search_vector_gin 
ON events USING gin(search_vector);

-- 3. 복합 검색을 위한 추가 인덱스
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notices_category_status_created 
ON notices(category, status, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_exhibitions_status_start_date 
ON exhibitions(status, start_date DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_category_status_event_date 
ON events(category, status, event_date DESC);

-- 4. 고급 공지사항 검색 함수
CREATE OR REPLACE FUNCTION search_notices(
  search_query TEXT DEFAULT NULL,
  category_filter TEXT DEFAULT NULL,
  status_filter TEXT DEFAULT NULL,
  date_from DATE DEFAULT NULL,
  date_to DATE DEFAULT NULL,
  limit_count INTEGER DEFAULT 20,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID, title TEXT, content TEXT, excerpt TEXT, category TEXT, status TEXT,
  is_pinned BOOLEAN, views INTEGER, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ, rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.id, n.title, n.content, n.excerpt, n.category, n.status,
    n.is_pinned, n.views, n.created_at, n.updated_at,
    CASE 
      WHEN search_query IS NOT NULL THEN 
        ts_rank(n.search_vector, plainto_tsquery('korean', search_query))
      ELSE 0
    END as rank
  FROM notices n  WHERE 
    (search_query IS NULL OR n.search_vector @@ plainto_tsquery('korean', search_query))
    AND (category_filter IS NULL OR n.category = category_filter)
    AND (status_filter IS NULL OR n.status = status_filter)
    AND (date_from IS NULL OR n.created_at >= date_from)
    AND (date_to IS NULL OR n.created_at <= date_to + INTERVAL '1 day')
  ORDER BY 
    CASE WHEN search_query IS NOT NULL THEN rank END DESC,
    n.is_pinned DESC,
    n.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- 5. 전시회 검색 함수
CREATE OR REPLACE FUNCTION search_exhibitions(
  search_query TEXT DEFAULT NULL,
  status_filter TEXT DEFAULT NULL,
  date_from DATE DEFAULT NULL,
  date_to DATE DEFAULT NULL,
  limit_count INTEGER DEFAULT 20,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID, title TEXT, description TEXT, location TEXT, curator TEXT,
  start_date DATE, end_date DATE, status TEXT, is_featured BOOLEAN,
  views INTEGER, created_at TIMESTAMPTZ, rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id, e.title, e.description, e.location, e.curator,
    e.start_date, e.end_date, e.status, e.is_featured,
    e.views, e.created_at,
    CASE 
      WHEN search_query IS NOT NULL THEN 
        ts_rank(e.search_vector, plainto_tsquery('korean', search_query))
      ELSE 0
    END as rank
  FROM exhibitions e
  WHERE 
    (search_query IS NULL OR e.search_vector @@ plainto_tsquery('korean', search_query))
    AND (status_filter IS NULL OR e.status = status_filter)
    AND (date_from IS NULL OR e.start_date >= date_from)
    AND (date_to IS NULL OR e.end_date <= date_to)
  ORDER BY 
    CASE WHEN search_query IS NOT NULL THEN rank END DESC,
    e.is_featured DESC,
    e.start_date DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;-- 6. 행사 검색 함수
CREATE OR REPLACE FUNCTION search_events(
  search_query TEXT DEFAULT NULL,
  category_filter TEXT DEFAULT NULL,
  status_filter TEXT DEFAULT NULL,
  date_from DATE DEFAULT NULL,
  date_to DATE DEFAULT NULL,
  limit_count INTEGER DEFAULT 20,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID, title TEXT, description TEXT, category TEXT, event_date TIMESTAMPTZ,
  location TEXT, organizer TEXT, status TEXT, is_featured BOOLEAN,
  views INTEGER, created_at TIMESTAMPTZ, rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ev.id, ev.title, ev.description, ev.category, ev.event_date,
    ev.location, ev.organizer, ev.status, ev.is_featured,
    ev.views, ev.created_at,
    CASE 
      WHEN search_query IS NOT NULL THEN 
        ts_rank(ev.search_vector, plainto_tsquery('korean', search_query))
      ELSE 0
    END as rank
  FROM events ev
  WHERE 
    (search_query IS NULL OR ev.search_vector @@ plainto_tsquery('korean', search_query))
    AND (category_filter IS NULL OR ev.category = category_filter)
    AND (status_filter IS NULL OR ev.status = status_filter)
    AND (date_from IS NULL OR ev.event_date >= date_from::timestamptz)
    AND (date_to IS NULL OR ev.event_date <= (date_to + INTERVAL '1 day')::timestamptz)
  ORDER BY 
    CASE WHEN search_query IS NOT NULL THEN rank END DESC,
    ev.is_featured DESC,
    ev.event_date DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- 7. 통합 검색 함수
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
  ORDER BY rank DESC, created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;
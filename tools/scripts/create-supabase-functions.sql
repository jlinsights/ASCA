-- Supabase 동기화를 위한 PostgreSQL 함수들

-- 1. 테이블 컬럼 정보 조회 함수
CREATE OR REPLACE FUNCTION get_table_columns(table_name text)
RETURNS TABLE(column_name text, data_type text, is_nullable text, column_default text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.column_name::text,
    c.data_type::text,
    c.is_nullable::text,
    c.column_default::text
  FROM information_schema.columns c
  WHERE c.table_name = $1 
    AND c.table_schema = 'public'
  ORDER BY c.ordinal_position;
END;
$$;

-- 2. 테이블 목록 조회 함수
CREATE OR REPLACE FUNCTION get_public_tables()
RETURNS TABLE(table_name text, row_count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  tbl_name text;
  row_cnt bigint;
BEGIN
  FOR tbl_name IN 
    SELECT t.table_name 
    FROM information_schema.tables t 
    WHERE t.table_schema = 'public' 
      AND t.table_type = 'BASE TABLE'
  LOOP
    EXECUTE format('SELECT count(*) FROM %I', tbl_name) INTO row_cnt;
    table_name := tbl_name;
    row_count := row_cnt;
    RETURN NEXT;
  END LOOP;
END;
$$;

-- 3. 스키마 비교 함수
CREATE OR REPLACE FUNCTION compare_table_schemas(table1 text, table2 text)
RETURNS TABLE(
  column_name text, 
  table1_type text, 
  table2_type text, 
  status text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH t1_cols AS (
    SELECT c.column_name, c.data_type
    FROM information_schema.columns c
    WHERE c.table_name = table1 AND c.table_schema = 'public'
  ),
  t2_cols AS (
    SELECT c.column_name, c.data_type
    FROM information_schema.columns c
    WHERE c.table_name = table2 AND c.table_schema = 'public'
  )
  SELECT 
    COALESCE(t1.column_name, t2.column_name)::text,
    t1.data_type::text,
    t2.data_type::text,
    CASE 
      WHEN t1.column_name IS NULL THEN 'missing_in_table1'
      WHEN t2.column_name IS NULL THEN 'missing_in_table2'
      WHEN t1.data_type != t2.data_type THEN 'type_mismatch'
      ELSE 'match'
    END::text
  FROM t1_cols t1
  FULL OUTER JOIN t2_cols t2 ON t1.column_name = t2.column_name
  ORDER BY COALESCE(t1.column_name, t2.column_name);
END;
$$;

-- 4. 동기화 로그 테이블 생성
CREATE TABLE IF NOT EXISTS sync_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_type text NOT NULL, -- 'schema', 'data', 'full'
  source_system text NOT NULL, -- 'airtable', 'supabase'
  target_system text NOT NULL,
  table_name text NOT NULL,
  operation text NOT NULL, -- 'create', 'update', 'delete', 'add_column', 'drop_column'
  record_id text,
  changes jsonb,
  status text NOT NULL DEFAULT 'pending', -- 'pending', 'success', 'failed'
  error_message text,
  created_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone
);

-- 5. 실시간 변경 감지를 위한 트리거 함수
CREATE OR REPLACE FUNCTION log_table_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  old_data jsonb;
  new_data jsonb;
  changes jsonb;
BEGIN
  IF TG_OP = 'DELETE' THEN
    old_data := to_jsonb(OLD);
    INSERT INTO sync_logs (
      sync_type, source_system, target_system, table_name, 
      operation, record_id, changes, status
    ) VALUES (
      'data', 'supabase', 'airtable', TG_TABLE_NAME,
      'delete', OLD.id::text, old_data, 'pending'
    );
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    old_data := to_jsonb(OLD);
    new_data := to_jsonb(NEW);
    changes := jsonb_build_object('old', old_data, 'new', new_data);
    INSERT INTO sync_logs (
      sync_type, source_system, target_system, table_name,
      operation, record_id, changes, status
    ) VALUES (
      'data', 'supabase', 'airtable', TG_TABLE_NAME,
      'update', NEW.id::text, changes, 'pending'
    );
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    new_data := to_jsonb(NEW);
    INSERT INTO sync_logs (
      sync_type, source_system, target_system, table_name,
      operation, record_id, changes, status
    ) VALUES (
      'data', 'supabase', 'airtable', TG_TABLE_NAME,
      'create', NEW.id::text, new_data, 'pending'
    );
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

-- Artists 테이블에 트리거 적용
DROP TRIGGER IF EXISTS artists_sync_trigger ON artists;
CREATE TRIGGER artists_sync_trigger
  AFTER INSERT OR UPDATE OR DELETE ON artists
  FOR EACH ROW EXECUTE FUNCTION log_table_changes();

-- Artworks 테이블에 트리거 적용
DROP TRIGGER IF EXISTS artworks_sync_trigger ON artworks;
CREATE TRIGGER artworks_sync_trigger
  AFTER INSERT OR UPDATE OR DELETE ON artworks
  FOR EACH ROW EXECUTE FUNCTION log_table_changes();

-- RLS 정책 설정
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;

-- 서비스 롤에 대한 모든 권한 부여
CREATE POLICY "Enable all for service role" ON sync_logs
  FOR ALL USING (auth.role() = 'service_role'); 
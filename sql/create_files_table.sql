-- Files 테이블 생성 (양식, 회칙, 문서 관리)
CREATE TABLE IF NOT EXISTS files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  title_en TEXT,
  title_ja TEXT,
  title_zh TEXT,
  description TEXT,
  description_en TEXT,
  description_ja TEXT,
  description_zh TEXT,
  category TEXT NOT NULL CHECK (category IN ('form', 'rule', 'document', 'notice', 'other')),
  file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'doc', 'docx', 'hwp', 'xlsx', 'pptx', 'zip', 'other')),
  file_url TEXT NOT NULL,
  file_size INTEGER NOT NULL DEFAULT 0,
  download_count INTEGER NOT NULL DEFAULT 0,
  is_public BOOLEAN NOT NULL DEFAULT true,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS files_category_idx ON files (category);
CREATE INDEX IF NOT EXISTS files_file_type_idx ON files (file_type);
CREATE INDEX IF NOT EXISTS files_is_public_idx ON files (is_public);
CREATE INDEX IF NOT EXISTS files_created_at_idx ON files (created_at DESC);

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_files_updated_at BEFORE UPDATE ON files
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) 설정
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- 공개 파일은 모든 사용자가 조회 가능
CREATE POLICY "Public files are viewable by everyone" ON files
    FOR SELECT USING (is_public = true);

-- 비공개 파일은 인증된 사용자만 조회 가능
CREATE POLICY "Private files are viewable by authenticated users" ON files
    FOR SELECT USING (is_public = false AND auth.role() = 'authenticated');

-- 관리자만 파일 삽입/수정/삭제 가능 (추후 admin role 구현 시 수정)
CREATE POLICY "Authenticated users can insert files" ON files
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update files" ON files
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete files" ON files
    FOR DELETE USING (auth.role() = 'authenticated'); 
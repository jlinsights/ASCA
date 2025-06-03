# Supabase Artworks 테이블 설정 가이드

## 🎯 개요
Airtable과 완벽하게 연동 가능한 `artworks` 테이블을 Supabase에 생성하는 방법을 안내합니다.

## 📋 1단계: Supabase 대시보드 접속

1. **Supabase 대시보드** 로그인: https://supabase.com/dashboard
2. 프로젝트 선택 또는 새 프로젝트 생성
3. 좌측 메뉴에서 **"Table Editor"** 클릭

## 🛠️ 2단계: SQL Editor에서 테이블 생성

### 방법 A: SQL Editor 사용 (권장)
1. 좌측 메뉴에서 **"SQL Editor"** 클릭
2. **"New query"** 버튼 클릭
3. 아래 SQL 스크립트 전체를 복사하여 붙여넣기
4. **"Run"** 버튼 클릭

```sql
-- 전체 SQL 스크립트는 scripts/create-artworks-table.sql 참조
```

### 방법 B: Schema Visualizer 사용
1. 좌측 메뉴에서 **"Database"** → **"Schema Visualizer"** 클릭
2. **"New Table"** 버튼 클릭
3. 아래 필드 구조를 참조하여 수동 입력

## 📊 3단계: Artworks 테이블 구조

### 기본 정보
```
테이블명: public.artworks
기본키: id (UUID, 자동생성)
외래키: artist_id → public.artists(id)
```

### 필드 상세 (Airtable 매핑)

| Supabase 필드 | 타입 | 기본값 | Airtable 필드 | 설명 |
|--------------|------|--------|---------------|------|
| `id` | UUID | gen_random_uuid() | - | 고유 식별자 |
| `artist_id` | UUID | - | Artist (링크) | 작가 외래키 |
| `title` | TEXT | - | Title (Korean) | 작품명 (한국어) |
| `title_en` | TEXT | NULL | Title (English) | 작품명 (영어) |
| `title_ja` | TEXT | NULL | Title (Japanese) | 작품명 (일본어) |
| `title_zh` | TEXT | NULL | Title (Chinese) | 작품명 (중국어) |
| `description` | TEXT | '' | Description (Korean) | 작품 설명 (한국어) |
| `description_en` | TEXT | NULL | Description (English) | 작품 설명 (영어) |
| `category` | TEXT | 'mixed-media' | Category | 카테고리 |
| `style` | TEXT | 'traditional' | Style | 스타일 |
| `year` | INTEGER | NULL | Year | 제작 연도 |
| `materials` | TEXT[] | '{}' | Materials | 재료 (배열) |
| `technique` | TEXT | NULL | Technique | 기법 |
| `condition` | TEXT | NULL | Condition | 작품 상태 |
| `dimensions` | JSONB | `{"width": 0, "height": 0, "unit": "cm"}` | Width/Height/Depth (cm) | 크기 정보 |
| `price` | JSONB | `{"amount": null, "currency": "KRW"}` | Price Amount/Currency | 가격 정보 |
| `availability` | TEXT | 'available' | Availability | 판매 상태 |
| `featured` | BOOLEAN | false | Featured | 추천 작품 여부 |
| `authenticity_certificate` | BOOLEAN | false | Authenticity Certificate | 진품증명서 여부 |
| `images` | TEXT[] | '{}' | Images | 이미지 URL 배열 |
| `thumbnail` | TEXT | NULL | - | 대표 이미지 |
| `tags` | TEXT[] | '{}' | Tags | 태그 (배열) |
| `created_at` | TIMESTAMPTZ | NOW() | Created | 생성일 |
| `updated_at` | TIMESTAMPTZ | NOW() | Last Modified | 수정일 |

## 🔗 4단계: 제약 조건 설정

### Check Constraints
```sql
-- 카테고리 제한
ALTER TABLE public.artworks 
ADD CONSTRAINT check_category CHECK (category IN ('calligraphy', 'painting', 'sculpture', 'mixed-media'));

-- 스타일 제한  
ADD CONSTRAINT check_style CHECK (style IN ('traditional', 'contemporary', 'modern'));

-- 판매 상태 제한
ADD CONSTRAINT check_availability CHECK (availability IN ('available', 'sold', 'reserved'));
```

### 외래키 관계
```sql
-- 작가 테이블과의 관계
artist_id UUID REFERENCES public.artists(id) ON DELETE CASCADE NOT NULL
```

## 📈 5단계: 인덱스 최적화

### 성능 인덱스
```sql
-- 검색 최적화
CREATE INDEX idx_artworks_artist_id ON public.artworks(artist_id);
CREATE INDEX idx_artworks_category ON public.artworks(category);
CREATE INDEX idx_artworks_featured ON public.artworks(featured);

-- 전문 검색
CREATE INDEX idx_artworks_title_search ON public.artworks USING gin(to_tsvector('korean', title));

-- 배열 검색
CREATE INDEX idx_artworks_materials ON public.artworks USING gin(materials);
CREATE INDEX idx_artworks_tags ON public.artworks USING gin(tags);
```

## 🔐 6단계: 보안 설정 (RLS)

### Row Level Security
```sql
-- RLS 활성화
ALTER TABLE public.artworks ENABLE ROW LEVEL SECURITY;

-- 읽기 정책: 모든 사용자
CREATE POLICY "Artworks are viewable by everyone" ON public.artworks
    FOR SELECT USING (true);

-- 쓰기 정책: 인증된 사용자만
CREATE POLICY "Artworks are editable by authenticated users" ON public.artworks
    FOR ALL USING (auth.role() = 'authenticated');
```

## 🎨 7단계: 편리한 뷰 생성

### 작가 정보 포함 뷰
```sql
CREATE VIEW public.artworks_with_artist AS
SELECT 
    a.*,
    ar.name as artist_name,
    ar.name_en as artist_name_en
FROM public.artworks a
LEFT JOIN public.artists ar ON a.artist_id = ar.id;
```

## 🧪 8단계: 테스트 및 확인

### 테이블 생성 확인
```sql
-- 테이블 구조 확인
\d public.artworks;

-- 통계 확인
SELECT * FROM get_artworks_stats();

-- 뷰 테스트
SELECT * FROM artworks_with_artist LIMIT 5;
```

### 샘플 데이터 삽입 테스트
```sql
-- 아티스트 먼저 생성 (있다면 건너뛰기)
INSERT INTO public.artists (name, bio) 
VALUES ('테스트 작가', '테스트용 작가입니다.')
RETURNING id;

-- 작품 삽입
INSERT INTO public.artworks (
    artist_id,
    title,
    description,
    category,
    style,
    year,
    materials,
    dimensions,
    price
) VALUES (
    '위에서 반환된 UUID',
    '테스트 작품',
    '테스트용 작품 설명',
    'painting',
    'contemporary',
    2024,
    ARRAY['캔버스', '유화'],
    '{"width": 100, "height": 80, "unit": "cm"}',
    '{"amount": 1000000, "currency": "KRW"}'
);
```

## 🔄 9단계: Airtable 마이그레이션 준비

### 필드 매핑 확인
- ✅ **다국어 지원**: title, title_en, title_ja, title_zh
- ✅ **배열 필드**: materials, tags, images
- ✅ **JSON 필드**: dimensions, price
- ✅ **외래키**: artist_id → artists 테이블 연결
- ✅ **제약 조건**: category, style, availability 값 제한

### 마이그레이션 테스트
```bash
# API 상태 확인
curl http://localhost:3000/api/migration/check-status

# 단일 레코드 테스트
curl -X POST http://localhost:3000/api/migration/test-single

# 전체 마이그레이션 실행
curl -X POST http://localhost:3000/api/migration/migrate-all
```

## ✅ 완료 체크리스트

- [ ] Artists 테이블 존재 확인
- [ ] Artworks 테이블 생성 완료
- [ ] 모든 인덱스 생성 완료
- [ ] RLS 정책 설정 완료
- [ ] 뷰 생성 완료
- [ ] 제약 조건 설정 완료
- [ ] 샘플 데이터 테스트 성공
- [ ] Airtable 마이그레이션 API 테스트 성공

## 🆘 문제 해결

### 자주 발생하는 오류

1. **외래키 오류**: artists 테이블이 먼저 생성되어야 합니다
2. **권한 오류**: 데이터베이스 관리자 권한 필요
3. **타입 오류**: PostgreSQL 배열 및 JSON 문법 확인

### 도움말 리소스
- 📖 [Supabase 테이블 생성 가이드](https://supabase.com/docs/guides/database/tables)
- 🔍 [PostgreSQL 데이터 타입](https://www.postgresql.org/docs/current/datatype.html)
- 🎯 [프로젝트 마이그레이션 API](http://localhost:3000/admin/migration) 
# Files 테이블 설정 가이드

## 개요
Files 테이블은 작품 이미지와는 별개로, 협회에서 관리하는 공식 문서들을 저장하고 관리하기 위한 테이블입니다.

## 파일 카테고리
- **form**: 양식 (신청서, 지원서, 등록양식 등)
- **rule**: 회칙 (협회 규정, 운영 규칙, 정관 등)
- **document**: 문서 (보고서, 안내자료, 회의록 등)
- **notice**: 공지사항 첨부파일
- **other**: 기타

## 지원 파일 형식
- **pdf**: PDF 문서
- **doc/docx**: Microsoft Word 문서  
- **hwp**: 한글 문서
- **xlsx**: Excel 스프레드시트
- **pptx**: PowerPoint 프레젠테이션
- **zip**: 압축파일
- **other**: 기타 형식

## 데이터베이스 설정

### 1. Supabase에서 테이블 생성
```sql
-- 제공된 sql/create_files_table.sql 스크립트 실행
```

### 2. 테이블 구조
```sql
files (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,                    -- 파일명 (한국어)
  title_en TEXT,                          -- 파일명 (영어)
  title_ja TEXT,                          -- 파일명 (일본어)  
  title_zh TEXT,                          -- 파일명 (중국어)
  description TEXT,                       -- 설명 (한국어)
  description_en TEXT,                    -- 설명 (영어)
  description_ja TEXT,                    -- 설명 (일본어)
  description_zh TEXT,                    -- 설명 (중국어)
  category TEXT NOT NULL,                 -- 카테고리
  file_type TEXT NOT NULL,                -- 파일 형식
  file_url TEXT NOT NULL,                 -- 파일 URL
  file_size INTEGER DEFAULT 0,            -- 파일 크기 (bytes)
  download_count INTEGER DEFAULT 0,       -- 다운로드 횟수
  is_public BOOLEAN DEFAULT true,         -- 공개 여부
  tags TEXT[],                           -- 태그
  created_at TIMESTAMP WITH TIME ZONE,    -- 생성일시
  updated_at TIMESTAMP WITH TIME ZONE     -- 수정일시
)
```

### 3. 권한 설정 (RLS)
- **공개 파일**: 모든 사용자 조회 가능
- **비공개 파일**: 인증된 사용자만 조회 가능
- **파일 관리**: 관리자만 업로드/수정/삭제 가능

## 파일 업로드 권장사항

### 1. 파일 저장소
- **Supabase Storage** 또는 **AWS S3** 사용 권장
- 파일 URL은 안전한 저장소 링크로 설정

### 2. 파일 크기 제한
- 일반 문서: 최대 10MB
- 압축파일: 최대 50MB

### 3. 보안 고려사항
- 민감한 문서는 `is_public = false`로 설정
- 파일 업로드 시 바이러스 검사 권장
- 파일명에 특수문자 제한

## 사용 예시

### 파일 등록 예시
```sql
INSERT INTO files (
  title, 
  category, 
  file_type, 
  file_url, 
  file_size,
  is_public
) VALUES (
  '2024년 정회원 신청서',
  'form',
  'pdf', 
  'https://storage.example.com/forms/member-application-2024.pdf',
  2048576,
  true
);
```

### 관리자 대시보드 연동
- 파일 수는 `files` 테이블의 총 레코드 수로 계산
- 작품 이미지와는 별도로 관리
- `/admin/files` 페이지에서 파일 관리 (추후 구현)

## 다음 단계
1. Supabase에서 Files 테이블 생성
2. 파일 업로드 기능 구현
3. 파일 관리 UI 개발
4. 다운로드 통계 구현 
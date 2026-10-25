# Airtable 작품 사진의 영구 연결

작품 사진은 Airtable의 `25년 출품원서` 테이블 `작품사진` 첨부에 있다. 기존
작품의 `airtable:rec…` 태그는 다른 `Artworks` 테이블을 가리키므로 그 ID로
출품원서의 첨부를 찾으면 안 된다. 임시 Airtable 다운로드 URL이나 Google Drive
로그인 페이지를 공개 이미지 주소로 저장하지 않는다.

## 검증된 원본 가져오기

`scripts/import-airtable-artwork-images.mjs`는 이미 작품 UUID로 검증해 둔 개인
Archive의 파일만 읽는다. 이름·제목 유사 검색을 사용하지 않는다. 하위 `review/`
폴더는 읽지 않으며, 같은 UUID의 파일이 여러 개면 보류한다.

```bash
# 서비스 롤 키는 운영자 터미널 환경 변수로만 전달한다.
node scripts/import-airtable-artwork-images.mjs --dir /absolute/private/archive --year 2025
node scripts/import-airtable-artwork-images.mjs --dir /absolute/private/archive --year 2025 --apply
```

기본 실행은 읽기 전용 미리 보기다. 적용 시 다음 순서를 지킨다.

1. 현재 DB와 대조한다. `published` 작품과 `visibility='public'` 작가만 가져온다.
   정상 이미지가 이미 있으면 수동 연결을 포함해 보존한다.
2. 모든 대상의 변경 전 이미지·작가 ID·상태·연도·수정 시각과 원본 SHA-256을
   `~/Developer/Archive/`에 먼저 백업한다. 백업 디렉터리 권한은 0700, 파일은
   0600이다. 공개 저장소 안에는 백업을 쓸 수 없다.
3. 원본 파일 바이트 그대로 비공개 `archive-private`의 `published-imports/`에
   올린다. 작품 UUID·실행 UUID·해시로 만든 새 경로를 사용하며 기존 객체를
   덮어쓰지 않는다. 비공개로 다시 내려받아 SHA-256을 비교한 뒤 연결한다.
4. UPDATE에도 기존
   `id`·`artist_id`·`status`·`year_created`·`updated_at`·`images` 조건을 건다.
   준비 후 값이 바뀐 행은 덮어쓰지 않는다. 결과는 개인 백업 폴더에 기록하며
   실패가 있으면 프로세스가 실패 상태로 끝난다.

공개 이미지는 `public-artwork-image` Edge Function으로 읽는다. 함수는 서비스
롤을 사용하지 않고 고정된 anon 클라이언트로 작품을 조회한 뒤 비공개 Storage를
읽는다. 작품과 Storage 모두 RLS를 검사한다. Storage 정책은 현재 published 작품과
public 작가에 정확히 연결된 imported 파일만 허용한다. 상태가 두 조회 사이에
바뀌어도 Storage 쪽에서 다시 거부한다. 일반 제출 원본·검토 중 파일·연결되지 않은
파일은 공개하지 않는다. 서명 URL 발급과 파일 목록도 허용하지 않는다. 기존
아카이브의 쓰기 차단은 INSERT·UPDATE·DELETE별 restrictive 정책으로 보존한다.
캐시 헤더는 `private, no-store`다. 작품 화면은 새 함수 이미지를 최적화하지
않으며, Next 이미지 최적화 허용 목록도 Supabase의 공개 Storage 경로만 받는다.
우회 리다이렉트도 따르지 않는다. 이미 공개된 이미지를 별도로 저장한 사본까지
회수할 수 있다는 의미는 아니다.

작품 화면·이미지 최적화 차단 코드를 먼저 운영에 배포하고, 정책 마이그레이션과
검토한 Edge Function을 적용한 뒤 가져오기 도구를 실행한다. 기존 배포가 새 함수
이미지를 최적화 캐시에 복사하지 않도록 이 순서를 지킨다. 함수에는 브라우저
이미지 요청을 위해 JWT 게이트를 두지 않지만, 모든 요청의 실제 자료 접근은 anon
RLS가 결정한다. 호출자의 Authorization이나 쿠키를 DB 클라이언트로 전달하지
않는다. 공개 HTTP에서 다시 받은 바이트도 비교한다. 실제 운영 상세 페이지의 렌더
확인은 이 바이트 검증과 별도로 기록한다. 공개 목록·상세 API는 계속 anon과 기존
RLS로 조회한다. 이 도구를 공개 웹 API에서 실행하지 않는다. 콘텐츠 열·열
GRANT·작품 공개 상태는 바꾸지 않는다. 새 정책은 읽기에만 적용한다.

개인 원본 폴더의 대상 수와 보류 사유는 읽기 전용 미리 보기로 확인한다. 확인
폴더의 파일은 운영자가 작품 일치 여부를 결정하기 전 자동 연결하지 않는다. 다른
연도나 새 출품 사진은 별도로 작품 UUID를 검증한 뒤 가져온다.

## 복구

백업 `before.json`과 `results.json`은 저장소 밖에 보관한다. 복구 시 현재
이미지가 해당 실행의 결과와 여전히 일치하는 행만 조건부로 이전 이미지 값으로
되돌린다. 그 뒤 다른 행에서 사용하지 않는 해당 실행의 Storage 객체만 제거한다.
다른 운영자의 이후 저장 내용을 덮어쓰거나 기존 미디어 객체를 일괄 삭제하지
않는다.

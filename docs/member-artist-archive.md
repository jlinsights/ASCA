# 회원 작가 아카이브 DB 기반 — 1단계

## 적용 범위와 기준

`supabase/migrations`가 실제 배포 스키마의 기준이다. 신규 SQL은 기존
마이그레이션을 변경하지 않고 추가한다. `lib/types/database.generated.ts`는 로컬
Supabase에서 생성한 PostgREST 타입이며, `lib/types/archive.ts`에서 아카이브
타입을 제공한다. 기존 `lib/db/schema.ts`에는 과거 DB 기준 정의가 남아 있으므로
전체 `db:push`나 무관한 Drizzle 재생성으로 운영 DB를 정렬하지 않는다. 이번
변경은 새 컬럼·테이블의 ORM 표현만 추가하며, 기존 화면 타입을 전면 교체하지
않는다.

## 스키마

- `artists`: 아호(`art_name_ko`, `art_name_hanja`), 서체 배열, 스승 FK·이름,
  지회, 인증 등급·인증일, 아카이브 소개(`archive_bio`, `archive_bio_en`), 프로필
  경로, 공개 범위, Clerk 소유자 ID. 기존·동기화 신규 작가는 public 기본값.
- `artist_contacts`: 작가당 이메일·전화. 공개 조회·일반 로그인 조회 모두 금지.
- `artworks`: 기존 `title`은 한국어, `title_en`은 영어다. 한자 제목, 석문,
  풀이(ko/en), 출전, 낙관 설명, cm 크기, 작성 주체를 추가한다.
  서체·재료·제작연도는 기존 `style`·`materials`·`year_created`를 사용한다. 검토
  상태 pending_review를 추가하되 archived·in-exhibition은 보존한다. 기본 상태는
  draft다.
- `artwork_images`: DB에는 상대 object key만 저장한다. 대표 이미지는 작품당 최대
  하나. 가로·세로는 픽셀 단위, 작품의 width_cm·height_cm는 cm 단위다.
- `artist_records`: 수상·전시·출품·인증 이력. 연결 작품은 같은 작가 소유여야
  한다. 작품 삭제 시 이력은 유지하고 artwork_id만 NULL 처리한다. 작가 삭제 시
  이력은 삭제한다.
- `events`: 전시 FK와 viewing/opening/award_ceremony 유형, Luma URL·공개 범위.
  전시 하나에 여러 행사 행을 연결하며 개수 제한이나 전시 FK unique 제약은 두지
  않는다.

## 공개·쓰기 계약

공개 작가는 visibility=public, 공개 작품은 status=published이면서 소유 작가도
공개여야 한다. 이미지·이력·전시 연결 테이블과 뷰도 이 조건을 따른다. 작품이 없는
작가 이력은 공개 작가 프로필에 공개하고, 작품이 연결되면 그 작품도 공개 상태여야
한다. 이력은 인증 여부와 별개로 공개될 수 있다.

일반 anon/authenticated는 아카이브를 쓸 수 없다. Clerk↔Supabase JWT 연동과 회원
자격 정책은 이번에 추가하지 않는다. claimed_by_user_id는 auth.users FK가 아닌
Clerk 문자열이다. 후속 서버 라우트는 Clerk 세션·소유권·관리자 권한을 검증한 뒤
service_role로 작성해야 하며, 소유권 문자열을 요청 본문만 보고 신뢰하면 안 된다.
인증 변경·게시 권한도 서버에서 별도로 확인해야 한다. 신규 작성 API는 이번 범위
밖이다.

Clerk `claimed_by_user_id`는 컬럼 권한으로 공개·일반 인증 조회를 차단한다. 기존
공개 작가 API는 명시적 공개 컬럼 목록을 사용하며 `artists.select('*')`는 권한
오류가 정상이다. 서버 service_role만 소유자 ID를 읽고 쓴다.

공개 PostgREST에서 `artwork_images`는 original_path를 제외한 명시적 컬럼으로
조회해야 한다. `select('*')`는 권한 오류가 정상이다. 연락처는 테이블 자체를
차단한다. `events.luma_url`의 직접 조회도 차단하고 `public_events`에서 공개
링크만 제공한다. 이 뷰는 제한 컬럼을 마스킹하기 위한 의도적인 definer 뷰로, 고정
projection과 is_published 조건 및 security_barrier를 갖는다. members/hidden
링크는 NULL이다. 다른 기존 공개 뷰는 security_invoker와 강화된 기반 RLS를
유지한다.

공개 GraphQL의 Drizzle 연결은 RLS를 우회할 수 있어 작가·작품·전시 연결 조회에
동일한 공개 조건을 명시했다. DB 타입 자체를 공개 응답으로 통째 직렬화하지
않는다.

## 이미지 저장 계약

- 공개 버킷: `archive-public`. 썸네일·웹 파생본 중 공개 가능한 파일만 배치한다.
- 비공개 버킷: `archive-private`. 원본과 미게시 파생본을 보관한다.
- API 주소: `NEXT_PUBLIC_SUPABASE_URL`. 버킷 환경 변수는 `.env.example` 참조.
  환경 변수 이름만 바꿔도 버킷이 생기지는 않는다. 실제 이름 변경에는
  마이그레이션도 필요하다.
- 업로드 시 크기별 파일을 생성하는 전제다. Supabase 이미지 변환 엔드포인트는
  사용하지 않는다.
- 새 경로에는 URL·절대 경로·상위 디렉터리·역슬래시·URL 구분자를 허용하지 않는다.
- 기존 `profile_image`·`artworks.images` 등의 레거시 URL은 이번에 일괄 변환하지
  않는다. 신규 아카이브 원본을 이 공개 필드에 복사하지 않는다.

공개 버킷 다운로드는 RLS로 막을 수 없다. 후속 게시 워크플로우는 게시 가능 여부를
확인한 뒤 공개 파생본을 복사하고 경로를 노출해야 한다. 미게시 파생본 경로는
private 버킷 기준이다. 게시 취소·작가 비공개 전환 시 공개 사본을 먼저 제거해야
하며, 기존 URL의 CDN·브라우저 캐시를 즉시 회수할 수 있다고 보장하지 않는다. 이
파일 복사·삭제 자동화와 업로드 API는 이번 단계에서 구현하지 않는다.

## Airtable 동기화

Airtable은 기존 작가 필드의 명시적 허용 목록만 갱신한다. 아카이브 소개·프로필
경로·공개 범위·인증·소유권은 덮어쓰지 않는다. 연락처는 비공개 테이블에 저장한다.
airtable_id 기준 upsert로 반복 호출 시 작가 ID를 보존한다. 연락처 저장 실패는
호출자에게 전파하며 재시도할 수 있다. 작가 upsert와 연락처 쓰기는 별도
요청이므로 실패 후 일시적인 부분 동기화는 가능하다. 성공 시에만 전체 완료로
취급한다.

기존 DB에 email·phone 컬럼이 있는 경우 별도 데이터 마이그레이션에서 연락처를
이관하고 공개 작가 컬럼을 제거한다. 종속 뷰가 있으면 CASCADE로 삭제하지 않고
마이그레이션을 실패시켜 명시적인 검토를 요구한다.

## 검증과 배포

```bash
supabase start -x studio,imgproxy,edge-runtime,logflare,vector,supavisor
supabase db reset --local --no-seed
node scripts/test-archive-upgrade.mjs
node --import tsx scripts/test-archive.mjs
supabase gen types typescript --local --schema public
npm run pre-commit
npm run test:graphql
node scripts/build-archive-local.mjs
```

테스트는 로컬 URL만 허용한다. 업그레이드 테스트는 임시 DB에서 기존 SQL을
재생하고 개인정보 이관·기존 상태 보존을 검증한다. 역할·REST·Storage 테스트는
별도 로컬 Supabase에서 실행하며 테스트 행은 정리한다. 운영 DB 덤프나 샘플
데이터는 사용하지 않는다. CI에 Archive database 작업을 추가했다. Supabase
Preview와 Vercel Preview는 외부 연동 검사이므로 GitHub 결과를 별도로 확인해야
한다. 로컬 성공이 Preview 성공을 뜻하지 않는다.

새 앱 코드는 신규 컬럼과 `public_events` 뷰에 의존한다. 반대로 기존 앱의
`events.select('*')`·`artists.select('*')`는 컬럼 권한 제한 적용 후 실패할 수
있으므로 DB만 운영에 먼저 적용한 채 이전 앱을 계속 서비스하면 안 된다. 후속 운영
배포는 작업창에서 DB와 앱을 연속 적용하거나, 먼저 작가·이벤트 조회의 공개 컬럼을
명시하는 준비 릴리스를 거쳐 진행한다. 마이그레이션이 없는 운영 DB를 쓰는 Vercel
Preview만으로 새 조회의 정상 동작을 확인했다고 판단하지 않는다.

운영 적용은 이 PR에 포함하지 않는다. 배포 전 백업·대상 프로젝트·기존
마이그레이션 이력을 확인하고, 실패 시 데이터 삭제가 아닌 전진 마이그레이션으로
복구한다.

## 후속 질문

- 공식 인증 등급·지회·수상 등급 목록과 코드화 시점
- 회원 전용 조회에 필요한 자격과 Clerk JWT 연동 방식
- 작가 프로필 소유권 연결 승인·해제 및 중복 계정 처리
- 파생본 생성·게시·취소와 CDN 캐시 정책
- 아카이브 소개·이미지를 실제 UI에서 우선 표시할 시점

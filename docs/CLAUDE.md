# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository. It mirrors the project instructions in `AGENTS.md`.

## Project Overview

ASCA is a sophisticated Korean Calligraphy Association website featuring:

- **Dual Database System**: Supabase (PostgreSQL) primary + Airtable external
  CMS
- **Airtable Sync**: Data sync from Airtable; schema differences are only
  detected and logged (see "Sync System")
- **Multi-language Support**: Korean (default), English, Japanese, Chinese
  (Traditional, `zh-TW`) — see "UI 번역 (i18n)"
- **Admin**: `/admin/artists` 작가 회비 관리만 동작한다 (see "Admin System")
- **Advanced Gallery**: Filtering, categorization, and viewing features

## 작업 원칙

- 파일 작업과 셸의 작업 위치에는 절대 경로를 사용한다.
- 변경 전 대상 파일과 관련 코드를 읽고, 시작 시 `git status --short --branch`로
  기존 변경을 확인한다. 사용자의 미커밋 변경은 보존한다.
- 명시적 요청 없이 커밋·푸시·병합하지 않는다.
- 변경 시 `.commit_message.txt`를 먼저 읽고, 이모지를 포함한 한국어 한 줄로
  덮어쓴다. revert 작업이면 비운다.
- `AGENTS.md`와 `docs/CLAUDE.md`의 공통 본문은 함께 갱신한다. 루트 `CLAUDE.md`는
  `docs/CLAUDE.md`를 불러오는 진입 문서로 유지한다.
- 형제 작업 폴더의 변경·병합 여부는 현재 `git worktree list`와 해당 폴더의 Git
  상태·이력을 대조한다. 과거 세션 요약만으로 작업을 재실행하지 않는다.
- 일반 설치·사용 안내는 `README.md`, 실행 명령은 `package.json`, 환경 변수는
  `.env.example`과 `lib/config/env.ts`를 기준으로 한다.
- 카피 기준은 루트의 소문자 `copy.md`, 시각 토큰은 `docs/02-design/DESIGN.md`를
  따른다. 문서의 예시와 현재 UI의 노출 문구는 해당 소스 파일로 대조한다.
- 코드 검사, 빌드, 배포, 인증된 브라우저 확인은 서로 다른 검증이다. 실제로
  통과한 범위만 완료로 보고한다.

## 운영 환경과 데이터 (2026-10-24 기준)

### 배포 — Vercel `asca-main`

- `vercel.json` 의 빌드 명령은 **`npm run build:full`** 이다. page-data 수집이
  켜져 `lib/config/env.ts` 의 zod 검증이 돌고, **`DATABASE_URL` 이 없으면 빌드가
  죽는다.** Production·Preview 양쪽에 있어야 한다.
- 로컬·CI 의 `npm run build` 는 compile-only 라 이 실패를 **못 잡는다.** 배포
  검증은 `NODE_ENV=production npm run build:full` 로 한다(셸에
  `NODE_ENV=development` 가 남아 있으면 prerender 가 `useContext` null 로
  죽는다).
- 빌드 명령은 먼저 `.next/cache/webpack` 을 지운다. 빌드 캐시 때문에 Preview·
  Production 이 **옛 Tailwind CSS 를 그대로 내보내** 새 클래스가 빠진 적이 있다
  (CI 는 통과). **지우지 말 것.** UI 변경은 배포본의 CSS 로 확인한다.
- Hobby 플랜이라 동시 빌드 1개 — Preview 는 Production 뒤에서 대기한다.
- 운영 도메인은 **`orientalcalligraphy.org`(루트)** 다 — 2026-10-25 Webflow 에서
  이 저장소(Vercel `asca-main`)로 옮겼다. `www.orientalcalligraphy.org` 와
  `asca-main.vercel.app` 은 루트로 308 리다이렉트한다(2026-10-27 Vercel 도메인
  설정·DNS 확인, 2026-10-31 브라우저 재확인). `lib/seo.ts` 의 `metadataBase` 도
  루트다. 운영 확인은 루트 주소나 배포 자체의 주소로 한다. 하위 도메인
  anam·heelang·catalog2025·jury 는 각각 다른 Vercel 프로젝트. 옛 Webflow
  사이트는 해지 전까지 Webflow 쪽에만 남아 있다.
- 운영도 Clerk **개발용 인스턴스**(`pk_test_…`)로 돈다.
- `proxy.ts` 의 CSRF 검사(`lib/security/origin-check.ts`)는 POST·PUT·PATCH·
  DELETE 의 Origin 을 허용 목록과 대조한다. 허용 목록은 `NEXT_PUBLIC_APP_URL`·
  `VERCEL_URL`·`VERCEL_PROJECT_PRODUCTION_URL`·`VERCEL_BRANCH_URL`·
  `CSRF_ALLOWED_ORIGINS` 다. ⚠️ `VERCEL_URL` 은 **배포마다 바뀌는 고유 주소**라
  별칭(`asca-main.vercel.app`)을 담지 못한다. 2026-10-24 까지 운영의 같은 사이트
  POST 가 전부 403 이었고, 증상은 **"로그아웃이 안 됨"**(Clerk `signOut` 이 먼저
  Next 서버 액션 `POST /` 를 보낸다)과 회비 저장 실패였다(#120). 미들웨어를
  바꾸면 **배포된 별칭에서 실제로 POST 를 보내** 확인한다. 커스텀 도메인을
  붙이면 www·apex 중 하나는 `CSRF_ALLOWED_ORIGINS` 에 넣어야 할 수 있다.
- `DATABASE_URL`은 PostgreSQL 연결 문자열이다. SQLite 파일 URL을 사용하지
  않는다. service role 키와 서버 비밀키는 클라이언트 코드나 저장소에 넣지
  않는다. 필수 환경 변수와 검증 규칙은 `lib/config/env.ts`를 따른다.

### Supabase와 마이그레이션

- 옛 프로젝트 `fiaoduraycyjselasmdn` 은 400일 넘게 정지돼 **복구 불가**다.
- **데이터가 있는 테이블은 `artists` 뿐이다.** 공지·전시·행사·작품 등 공개 CMS
  테이블은 `supabase/migrations/20261010233903_asca2026_public_cms_tables.sql`
  로 만든 **빈 테이블**이다. 그 이전 마이그레이션은 옛 스키마(auth.users FK,
  user_metadata 관리자 정책, 없는 'korean' 검색 설정)라 **재실행하지 말 것.**
- 홈·연혁 콘텐츠는 저장소 데이터에서 온다:
  `app/history/_data/history-events.ts`, `lib/data/blog-posts.json`. 홈은
  `app/page.tsx`에서 이 데이터를 읽고 `components/home/home-data.ts`로 집계해
  `components/home/`에 전달한다. 홈 통계나 전시 기록을 CMS 데이터로 간주하지
  않는다.
- 전시 하위 페이지(`/exhibitions/current·upcoming·past·online`)도 연혁 데이터로
  만든다 — `app/exhibitions/_data/exhibition-records.ts` 가 월 단위로 이번 달·
  예정·지난 전시를 가르고, 온라인은 `online: true` 기록이다. **새 전시는
  `history-events.ts` 에 추가한다.** 예시·가짜 전시를 넣지 말 것.
- `/exhibitions` 목록 자체는 CMS(빈 테이블)를 읽어 빈 상태가 정상이다.
- RLS: 공개 테이블은 **읽기만 공개, 쓰기는 service_role 만.**
- 🔴 **`execute_sql` 같은 임의 SQL RPC 를 만들지 말 것.** 구조 변경은
  마이그레이션으로만 한다.
- 🔴 **DB 덤프를 커밋하지 말 것.** 이 저장소는 공개다. 2026-07 덤프(개인정보
  포함)가 커밋돼 있어 2026-10-11 에 이력에서 지웠다.

### 도너스(DONUS) 회원 동기화 — 도너스 → 홈페이지, 신규 가입만 역방향

- **도너스가 회원·연회비의 원장이다.** 홈페이지는 하루 한 번 읽어 와 비출
  뿐이고, 홈페이지에서 고친 값은 도너스로 돌아가지 않는다(구성원 수정 API 를
  일부러 쓰지 않는다). 홈페이지 → 도너스는 **신규 가입 등록 하나뿐**이다(아래).
  납부·마이페이지 링크(`secure.donus.org/orientalcalligraphy/…`)는 그대로
  도너스다.
- 흐름: Vercel Cron(`vercel.json`) → `/api/cron/donus-sync`(`CRON_SECRET` 필수,
  없으면 늘 401) → `lib/donus/sync.ts`. `DONUS_API_KEY` 가 없으면 아무것도 하지
  않고 `skipped` 를 돌려준다. 키는 서버 전용이다.
- 도너스 Open API 는 **웹훅이 없다** — 구성원 등록일 조회(최장 30일 구간·한 번에
  100건)를 끝까지 넘겨 읽는다. 한도는 모든 API 합산 초당 5회·하루 5,000회라
  클라이언트(`lib/donus/client.ts`)가 호출 사이를 띄운다.
- **도너스를 끝까지 읽은 뒤에만 쓴다.** 한 구간이라도 실패하면 연결을 지우지
  않는다. 지울 연결을 먼저 지우고 새 연결을 넣는다(구성원 인덱스 유일 제약).
- 도너스 목록 페이지가 "더 있다"면서 커서가 없거나 그대로면 **실패로
  멈춘다**(일부 목록으로 연결을 지우지 않게). 연결 목록도 끝까지 페이지로
  읽는다. 회원별 상태 갱신은 240초까지만 하고 20명마다 저장한다 — 새 연결부터,
  그다음 오래전에 갱신한 순서라 남은 회원은 다음 날 이어진다. 계정이 다른
  구성원으로 바뀌면 옛 연결을 지우고 새로 넣어 옛 구성원의 상태가 남지 않는다.
- 도너스가 200 을 줘도 응답 모양(목록·hasMore·구성원 인덱스)이 다르면 멈춘다.
  구성원 전체 조회는 180초 안에 끝나야 하고, 넘으면 쓰지 않고 실패한다 — 그러면
  `DONUS_SYNC_SINCE` 를 늦춘다. 저장된 마지막 연회비 연도는 올해·작년에 납부가
  없어도 지우지 않는다(같은 구성원일 때만).
- 이번에 읽지 못한 구성원(`DONUS_SYNC_SINCE` 이전 등록 등)의 연결은 지우지
  않는다 — 구성원을 실제로 읽었고 이메일이 바뀐 경우에만 끊거나 바꿔 잇는다(다른
  구성원과 이메일이 맞아도 바꾸지 않는다). 새로 이은 연결은 연회비 납부를 최대
  10년(또는 `since` 연도까지) 거슬러 찾고, 기존 연결은 올해·작년만 본다. 연결을
  지우고 다시 넣는 사이에 실패해도 다음 실행이 새 연결로 다시 찾아 되살린다.
- 긴 연회비 조회는 연결마다 `dues_history_checked` 가 참이 될 때까지 다시 한다 —
  새 연결이 실패·연기되거나 연회비 코드가 없을 때 연결돼도 다음 실행이 이어서
  찾는다. 도너스 요청은 하나에 20초까지만 기다리고, 실행 예산(240초)이 지나면 새
  요청을 보내지 않는다(모은 상태를 저장할 시간을 남긴다).
- 대조 키는 **확인된 계정 이메일** 하나다. 이름 유사도로 잇지 않는다. 도너스에서
  같은 이메일을 가진 구성원이 둘 이상이면 새로 잇지 않는다(이미 그중 한 구성원과
  이어진 연결은 지킨다). 휴대폰만 있는 구성원은 사무국이 `link_source='manual'`
  로 잇는다 — 동기화는 manual 연결을 끊거나 바꾸지 않는다(상태 칸만 갱신).
- 표 `donus_member_links` 는 service_role 전용이고 **연락처를 저장하지 않는다**
  (구성원 인덱스·코드·생애주기·최근 납입일·연회비 납부 연도뿐). 이메일 대조는
  메모리에서만 한다. 응답·로그에는 개수만 싣는다.
- 연회비 납부 연도는 `DONUS_DUES_CODES`(모금상품·용도 코드)에 맞는 **수입완료**
  납입으로만 센다. 코드를 비워 두면 계산하지 않고 이전 값을 지우지 않는다 — 다른
  후원금을 연회비로 세지 않게. 생애주기(활성·이탈 등)는 도너스 값 그대로다.
- 마이그레이션 `20261113120000_donus_member_links.sql` 은 백업 후 **따로**
  적용한다. 권한·제약은 CI `archive-db` 의 `scripts/test-donus-links.mjs` 가
  실제 Postgres 로 검사한다. 2026-11-13 현재 협회 관리자 계정으로도 도너스 API
  Key 메뉴가 "접근 권한이 없습니다" 라 키 발급은 도너스 문의 대기다.
- **신규 가입 → 도너스(역방향, 신규 가입만)**: `/api/cron/donus-signups`
  (`vercel.json`, 단방향 동기화보다 30분 먼저) → `lib/donus/signups.ts`.
  `DONUS_FORM_KEY`(도너스 회원 등록 폼 키)와 `DONUS_SIGNUP_SINCE`(이 날짜 KST
  이후 가입만)가 **둘 다** 있어야 보낸다 — 없으면 `skipped`. 기존 계정을
  한꺼번에 보내지 않으려고 시작일은 기본값이 없다. 폼 키는 API 키와 별개다.
- 보내는 계정: 이메일 확인을 마쳤고, 익명·비활성이 아니며, 도너스 연결이 없고,
  아직 보낸 적 없는 계정. 이름·이메일만 보낸다(`updateOnMatch:false` — 같은
  이메일 구성원이 있으면 도너스 값을 바꾸지 않는다). 이름은 UTF-8 100바이트로
  자르고, 이름이 비면 지어내지 않고 건너뛴다. **수신 동의는 보내지 않는다** —
  도너스에 '미확인'으로 남는다(받은 적 없는 동의·거부를 만들지 않는다).
  홈페이지에는 아직 수신 동의·이메일 변경 화면이 없다.
- 한 명씩 보내 잘못된 한 건이 다른 가입을 막지 않는다. 도너스가 200 과 올바른
  응답을 준 뒤에만 `donus_signup_submissions`(service_role 전용, 연락처 없음)에
  보냄으로 기록한다. 실패하면 시도 시각만 남겨 다음 실행의 줄 뒤로 보낸다 — 매번
  거절되는 계정이 뒤의 정상 가입을 막지 않는다(같은 이메일을 다시 보내도 도너스
  값은 바뀌지 않는다). 시간 예산으로 멈춘 계정은 자리를 지킨다. 한 실행에
  200명·240초까지. 도너스가 돌려준 구성원 인덱스로 연결을 만들지 않는다 — 연결은
  단방향 동기화가 이메일 대조 규칙으로 만든다.
- 개인정보처리방침 제9조(처리업무의 위탁)에 도너스를 수탁자로 적었다.
  홈페이지에서 계정을 지워도 도너스 구성원은 지워지지 않는다(사무국이 도너스에서
  정리). 마이그레이션 `20261113150000_donus_signup_submissions.sql` 도 백업 후
  따로 적용한다.

### 데이터 계층이 둘이다

- **supabase-js** (`NEXT_PUBLIC_SUPABASE_URL` + 키) — 공개 페이지 조회
  (`lib/api/artists.ts` 등)
- **Drizzle** (`DATABASE_URL`, `lib/db/index.ts`) — 트랜잭션 풀러(6543)라
  `prepare: false`

### 조회 함정

- 목록은 `range()` + `count: 'exact'`로 페이지를 나눈다
  (`/api/artists?q&page&limit&title…`). PostgREST 응답 한도와 앱의 페이지 크기
  제한은 별개이며, 작가 목록 제한은 `lib/api/artists.ts`의
  `MAX_ARTISTS_PAGE_SIZE`와 `pageRange()`를 따른다.
- `or()` 필터에 사용자 입력을 그대로 넣지 말 것 — `sanitizeSearchTerm` 을
  거친다.
- `artists.membership_type` 은 쉼표로 이은 복수 역할이고, 직함은 음절 사이에
  공백이 들어간 값('고 문')이 있다 — 그래서 `=` 대신 `lib/api/artists.ts` 의
  `spacingTolerantPattern` 으로 `ilike` 한다.
- `getArtists()`는 조회 오류를 기록한 뒤 빈 목록을 반환하기도 한다. 빈 화면을
  데이터 부재로 단정하지 말고 API 응답, 서버 로그, 대상 DB의 권한을 확인한다.

### 작가 공개 범위 — `visibility` + RLS

- `artists.visibility` 는 `public`·`members`·`hidden` 이고, 공개 조회는 RLS 정책
  `artists_public_read` 가 `public` 만 통과시킨다. 작품(`artworks`)도 작가가
  공개일 때만 보인다.
- 트리거 `trg_artists_grade_visibility`(함수
  `artists_enforce_grade_visibility`)가 등급에 따라 자동으로 숨긴다 —
  `membership_type` 에 **준회원·공모작가**가 있거나 `dues_status` 가 **'자격
  정지'** 면 `hidden`, 그 조건에서 벗어나면 `public` 으로 되돌린다. `visibility`
  를 손으로 바꿔도 트리거가 다시 맞춘다.
- `membership_type` 기본값이 **'준회원'** 이라 등급 없이 넣은 새 작가는 숨겨진
  채로 시작한다. 테스트 픽스처는 공개 등급('초대작가' 등)을 명시한다.
- `dues_status`(`정상`·`권한 제한`·`자격 정지`)는 **등급과 별개**다. 정회원이
  회비를 안 내도 등급은 그대로 두고 회비 상태만 바꾼다.
- 🔴 `artists` 는 **열 단위 grant** 다. 새 열을 공개 select 에 넣으면 anon·
  authenticated 에 grant 해야 하고, 빠지면 **작가 목록 전체가 빈 배열**이 된다.
  `dues_status`·`claimed_by_user_id` 는 일부러 grant 하지 않았다.
- 🔴 공개 API 는 **anon 클라이언트 + `PUBLIC_ARTIST_COLUMNS`** 로 읽는다.
  service role 은 RLS 를 건너뛰어 숨긴 작가가 새어 나간다 — 상세 API
  `/api/artists/[id]` 가 그랬다(#117). 공개 범위를 검증할 때는 목록뿐 아니라
  **상세 API 까지** 숨긴 작가 id 로 404 를 확인한다.
- 운영 확인 당시 `claimed_by_user_id`가 채워진 작가는 없고 연결 화면도 없다. 이
  브랜치의 `/profile/edit`은 본인 연결이 있는 경우 서버 API로 조회·저장한다.
  연결 값은 `auth.users.id` UUID 문자열(text)이며 작가 UUID와 구분한다. 연결
  화면은 후속 작업이다. 공식 이름·등급·회비·공개 상태·소유권을 본인이 변경하지
  못한다. 계약은 `docs/03-analysis/artist-profile-self-service.md`를 본다.

## Primary Commands

### Development

```bash
npm run dev              # Development server using Webpack (Recommended)
npm run dev:turbo        # Turbo mode development (May have ESM issues with Clerk)
npm run build            # Compile-only build (not deployment validation)
NODE_ENV=production npm run build:full # Full deployment build
npm run start            # Start production server
npm run pre-commit       # Full quality check before commits
```

### Local Setup

- Next.js의 Node.js 요구 버전은 설치된 `node_modules/next/package.json`의
  `engines`를 확인한다. 루트 `package.json`의 하한만 믿지 않는다.
- 잠금 파일 기준 설치는 `npm ci`를 사용한다. peer dependency 옵션은 `.npmrc`에
  있다.
- `.env.example`을 참고해 `.env.local`을 준비하되 기존 파일을 덮어쓰지 않는다.
- `gallery:generate`는 현재 npm 스크립트가 아니다. 갤러리 명령은
  `package.json`을 확인한다.

### Database Management

```bash
npm run db:studio        # Open Drizzle Studio GUI (key tool)
npm run db:push          # Apply schema changes to database
npm run db:seed          # Seed development data
npm run db:check         # Check migration consistency
npm run db:generate      # Generate migrations from schema
```

### Quality Assurance

```bash
npm run type-check       # TypeScript validation
npm run lint             # ESLint checking
npm run lint:fix         # Auto-fix linting issues
npm run test             # Run Jest tests
npm run test:coverage    # Generate test coverage report
npm run format:check     # Prettier check (CI "Code Quality" runs this)
npm run test:e2e         # Playwright E2E
npm run design:lint      # DESIGN.md specification lint
npm run design:wcag      # Design token contrast checks
npm run design:diff      # Compare documented color tokens with implementation
```

CI 의 Code Quality 잡은 저장소 전체에 `format:check` 를 돌린다. 손으로 고친
CSS·마크다운이 Prettier 모양이 아니면 PR 이 빨갛게 된다(#204 가 그랬다). 푸시
전에 바꾼 파일만 `npx prettier --write <파일>` 로 맞춘다.

## Core Architecture

### Database System

- **Primary**: Supabase PostgreSQL — project `ASCA-2026` (see above)
- **Schema**: content tables with multi-language fields
- **Sync Engine**: Airtable → Supabase data sync (schema changes are not
  applied)
- **ORM**: Drizzle with type-safe queries in `lib/db/queries.ts`

### Key Tables

- `artists` - Artist profiles with multilingual fields
- `artworks` - Artwork data with category/metadata
- `exhibitions` - Exhibition management
- `events`, `news` - Content management
- `audit_logs` - Enterprise audit trail data
- Junction tables for many-to-many relationships

### Enterprise Architecture

The platform uses a sophisticated enterprise architecture for scalability and
security:

- **CQRS Pattern**: Separate buses for commands (`lib/cqrs/command-bus.ts`) and
  queries (`lib/cqrs/query-bus.ts`).
- **Event Bus**: Asynchronous system communication via
  `lib/events/event-bus.ts`.
- **Audit Trail**: Detailed tracking of all data changes and access attempts in
  `lib/audit/audit-trail.ts`.
- **Agent Pattern**: Specialized services (e.g., `lib/agents/artist-agent.ts`)
  handling complex domain logic.
- **Performance Monitoring**: Real-time metric collection and monitoring in
  `lib/monitoring/`.

### Authentication

- 이 브랜치의 런타임은 **Supabase Auth**다. 운영 제공자 전환·배포는 아직
  수행하지 않았다.
- 계획: `docs/01-plan/features/supabase-auth-migration.plan.md`.
  로그인·가입·복구·MFA· cookie 갱신과 API의 공통 계정 계층을 연결했다. 검증
  범위는 `docs/03-analysis/supabase-auth-session-migration.md`, 실제
  서비스·브라우저 검증과 운영 준비는
  `docs/03-analysis/supabase-auth-cutover-readiness.md`를 확인한다.
- Supabase 계정은 `account_profiles`, 이전 계정 매핑은 서버 전용
  `auth_identity_links`를 쓴다. Clerk webhook의 `user_profiles`와 섞지 않는다.
  가입만으로 작가 소유권·협회 정회원 자격을 부여하지 않는다.
- 계정 UUID와 작가 UUID는 다르다. `get_my_artist_ids()`로 본인에게 연결된 기존
  작가 ID를 조회한다.
- `claimed_by_user_id`는 `auth.users.id`의 UUID 문자열(text)이다. 작가 UUID와
  혼동하지 않는다. 본인 프로필 저장은 `/api/profile/artists/[id]`의 소유권
  검사와 허용 열만 사용한다. 공개 상태·등급·회비·소유권은 본인이 수정하지
  못한다. 계약은 `docs/03-analysis/artist-profile-self-service.md`를 확인한다.
- 신규 권한 검증은 검증된 세션 + DB 역할을 사용한다. `user_metadata`나 이메일
  일치로 관리자 권한을 부여하지 않는다.
- `requireSupabaseAdmin`은 DB `admin` 역할과 검증된 MFA `aal2`를 모두 요구한다.
- Server Actions for admin/membership are being replaced by secure API routes

### 다국어와 공개 API 타입

- UI 언어 코드는 `ko`, `en`, `ja`, `zh`다. 중국어는 번체(`zh-TW`)를 사용하며 DB
  컬럼 이름과 구분한다.
- Drizzle의 다국어 필드는 `lib/db/schema.ts`를 따른다(`titleCn`, `titleJp` 등).
  공개 Supabase 작가 행은 `name_zh`, `name_ja`를 사용하며
  `lib/api/artist-mapper.ts`가 `nameZh`, `nameJa` 등 화면 타입으로 변환한다.
  PostgREST 원시 행에 Drizzle의 camelCase 타입을 그대로 붙이지 않는다.
- 화면 번역은 `contexts/language-context.tsx`와 `lib/i18n/`을 따른다. 새
  번역표는 언어별 정적 표(`lib/i18n/locales/<언어>/static.ts`)에 연결한다. 기본
  언어의 SSR·첫 렌더에서 번역 키가 노출되지 않는지 확인한다.
- 영어 회차 단위·중국어 슬로건 풀이처럼 컴포넌트가 숨기는 번역 예외는 보존한다.
  빈 문자열이 `t()`에서 키 이름으로 돌아올 수 있으므로 숨김은 조건으로 처리한다.
- 협회명·슬로건 등 번체 한자는 `lang='zh-Hant'` 또는 `lang='zh-TW'`를 쓴다. 혼합
  문장의 보완은 `.cjk-tc-strict`로 하며, 일본어 본문의 자형에 일괄 적용하지
  않는다.
- 번역한 필터 라벨로 DB 필터 값을 바꾸지 않는다. 탐색 UI의 공통 레이블은
  `components/gallery/discovery-copy.ts`를 참조한다.

### UI 번역 (i18n)

화면 문구는 DB 필드가 아니라 클라이언트 번역표로 바꾼다. 언어: `ko`(기본)·`en`·
`ja`·`zh`. **중국어는 번체(`zh-TW`)로 통일한다** — 간체를 쓰지 말 것.
`lib/i18n/__tests__/zh-traditional.test.ts` 는 2026-10-11 에 섞여 있던 간체 글자
목록만 막으므로, 새 간체 글자는 통과할 수 있다.

- 컴포넌트에서는 `useLanguage()`(`contexts/language-context.tsx`)의 `t(key)`·
  `language` 를 쓴다. 날짜·숫자는 `metadata.locale` 로 포맷한다.
- **언어는 주소가 정한다** (`lib/i18n/locale-routing.ts`). 한국어는 지금 주소
  그대로(`/history`), 나머지는 접두사(`/en/history`·`/ja/…`·`/zh/…`)다.
  `proxy.ts` 가 접두사를 떼어 내부 rewrite 하고 요청 헤더 `x-asca-lang` 에
  언어를 싣는다(들어온 같은 헤더는 늘 지운다). 루트 레이아웃이 그 헤더로
  `<html lang>` 과 첫 렌더 언어·표를 정하므로 **서버 HTML 이 그 언어다.** 헤더를
  읽어 모든 페이지가 요청 시점 렌더(ƒ)다 — 페이지를 정적으로 만들려면
  `app/[lang]/` 구조로 옮겨야 한다.
- 언어 주소를 여는 페이지는 `LOCALIZED_PATHS` 의 **번역된 페이지뿐**이다. 나머지
  (약관·블로그 글·작가 상세 등)는 `/en/…` 으로 오면 한국어 주소로 307 한다.
  번역을 마친 페이지를 이 목록에 넣는다.
- 고른 언어는 쿠키 `asca-lang` 에 저장된다(proxy 가 읽는다). 쿠키가 en·ja·zh 면
  번역된 한국어 주소에서 그 언어 주소로 307 한다. 옛 `localStorage`
  `asca-language` 값은 한 번 쿠키로 옮기고 지운다 — 첫 로드에 서버가 단 쿠키(첫
  방문 자동 판단 등)보다 이 옛 선택이 앞선다. 자동 판단으로 온 언어 홈만 옛 선택
  언어로 되돌리고(60초짜리 표시 쿠키 `asca-lang-auto`), 직접 연 언어 주소는
  주소의 언어가 이긴다(쿠키도 그 언어로 두고 옛 값은 버린다). 언어 주소(/en
  등)로 들어오면 proxy 가 그 언어를 쿠키로 남긴다 — 본문의 한국어 주소 링크를
  눌러도 언어를 잃지 않는다.
- 쿠키가 없는 첫 방문 `/` 는 브라우저 언어 > 접속 국가(`x-vercel-ip-country`)
  > 영어 순으로 정해 en·ja·zh 면 그 언어 홈으로 307 한다
  > (`lib/i18n/first-visit-language.ts`). 검색 로봇·링크 미리보기·헤드리스
  > 브라우저는 늘 한국어 `/` 를 받는다 — 국가별로 홈 언어를 바꾸면 미국에서
  > 크롤하는 Google 이 홈을 영어로 색인한다. 다른 주소는 첫 방문이라도 보내지
  > 않는다.
- 링크는 `useLocalizedHref()`, 경로 비교는 `useRoutePath()`
  (`lib/i18n/use-locale-path.ts`)를 쓴다. `usePathname()` 을 그대로 비교하면
  `/en/history` 에서 메뉴 활성 표시가 어긋난다.
- 언어 주소의 `<title>`·description·canonical·hreflang 은
  `lib/seo/localized-metadata.ts` 가 만든다. 번역된 페이지는 한국어 `metadata`
  를 내보내지 않고
  `export const generateMetadata = localizedPageMetadata('<경로>', metadata)` 로
  넘긴다. 제목·설명 번역은 `lib/seo/localized-page-copy.ts`(규정 상세는
  `regsName*` 키)에 두며, `LOCALIZED_PATHS` 에 페이지를 넣으면 여기에도 세
  언어를 채워야 테스트가 통과한다. 사이트맵은 언어 주소와 hreflang 을 함께
  싣는다.
- 테스트는 `setTestLanguage(lang)`(`lib/i18n/testing.ts`)로 jsdom 주소를 바꿔
  언어를 고른다.
- 번역 문구는 **언어별 파일**에 화면 단위로 둔다:
  `lib/i18n/locales/<ko|en|ja|zh>/<화면>.ts`(`site-chrome`·`about`·`exhibitions`·
  `home` 등). 클라이언트는 한국어 표만 처음 번들에 싣고, 다른 언어 표는 고를 때
  받는다(`lib/i18n/locales/index.ts`의 `loadLocale`). 그래서 **네 언어를 한
  파일에 다시 모아 클라이언트에서 불러오지 말 것** — 모든 페이지 첫 번들에 네
  언어가 실린다(`lib/i18n/__tests__/locales.test.ts`가 막는다).
- 새 화면 표를 만들면 ① 네 언어 파일을 만들고 ② 네 언어의 `static.ts` 에 모두
  펼쳐 넣고 ③ 네 언어를 묶는 `lib/i18n/translations/<화면>.ts` 를 둔다(테스트·
  서버용, `lib/i18n/translations.ts` 도 서버·테스트 전용이다). 키 접두사로
  화면을 구분한다 (`site*`·`intro*`·`history*`·`ex*`).
- 4개 언어 키가 빠짐없이 같아야 한다. 빠진 키는 화면에 키 이름이 그대로 나온다.
- 연혁 기록은 `app/history/_data/history-i18n.ts` 가 바꾼다. 날짜는 규칙으로,
  제목·장소는 표로 바꾸고, 한자로 된 공식 전시명은 그대로 둔다.
- 한국어로만 존재하는 본문(블로그 제목 등)은 요소에 `lang='ko'` 를 단다
  (`components/home/home-journal.tsx`). 화면 검사는 이 요소를 뺀다.
- 번역 검증은 단위 테스트만으로 부족하다. 배포본을 언어별로 열어 **화면에 남은
  한글 텍스트를 센다**. 같은 스크립트를 한국어로도 돌려 0 이 아닌 값이 나오는지
  확인해야 측정이 유효하다(대조군).

## Admin System

### 관리자 판정

- 운영 관리자 준비 대상은 `info@orientalcalligraphy.org`다. 검증된 이메일로
  Supabase 계정을 만들고 `public.account_profiles.role`을 `admin`으로 부여한 뒤
  `/auth/mfa`에서 TOTP를 등록·검증한다. 이메일만으로 자동 승격하지 않는다.
- `archiveIdentity()`는 `getAccount()`의 검증된 DB 역할과 MFA를 사용한다.
  `role === 'admin' && assuranceLevel === 'aal2'`인 경우에만 관리자다. 반환 계약
  `{ userId, admin }`은 유지하며 userId는 `auth.users.id` UUID다.
- `ADMIN_EMAILS`·`SUPER_ADMIN_EMAILS`와 Clerk `user_profiles`는 native 관리자
  판정에 사용하지 않는다. 기존 Clerk 설정은 롤백 검증까지 보존한다.
- 관리자 초기 준비와 마이그레이션 적용 → Preview 검증 → 운영 배포 절차는
  `docs/03-analysis/supabase-auth-admin-cutover.md`와 PR 체크리스트를 따른다.
  초기 관리자 로그인·MFA·회비 API 검증을 마치기 전 운영 전환하지 않는다.

### 동작하는 관리 화면

- `/admin` → `/admin/artists` 로 보낸다.
- **`/admin/artists` — 작가 회비 관리**: 이름 검색·등급·회비 상태 필터, 행마다
  `dues_status` 변경(`PATCH /api/admin/artists/[id]`, Origin 검사·분당 60회·
  `auditTrail.trackDataChange` 기록). 회비 상태를 바꾸면 트리거가 공개 여부를
  맞추고, 응답에 바뀐 `visibility` 가 온다.
- 메뉴(`components/admin/admin-nav-items.ts`)에는 **페이지가 있는 화면만**
  싣는다. 테스트가 href 마다 `app/admin/**/page.tsx` 가 있는지 확인한다.
- `/admin/contests`의 인증 경계는 공통 Supabase 계정 계층으로 교체했다. 레거시
  회원·공모전 제품 기능을 완성한 것으로 보지 않으며, `/admin/membership`의 예시
  화면과 함께 기존 메뉴 제외 상태를 유지한다.

### Permission System (RBAC)

Hierarchical and resource-based permissions defined in
`lib/admin/permissions.ts`:

- **Roles**: `SUPER_ADMIN`, `ADMIN`, `MODERATOR`, `EDITOR`, `ARTIST`, `MEMBER`.
- **Wildcards**: Supports `*` for full access or `resource:*` for
  resource-specific wildcards.
- **Validation**: Use `hasPermission` or `assertPermission` in routes and
  components.
- **Security Context**: Operations are validated against a context containing
  user ID and required permissions.

## Security Guidelines

### Data Protection & Compliance

- **Input Sanitization**: Always use `sanitizeInput()` from
  `lib/security/security-middleware.ts` for user-provided data.
- **Audit Logging**: All sensitive mutations MUST be logged via
  `auditTrail.trackDataChange()`.
- **Access Tracking**: Unauthorized access attempts must be tracked via
  `auditTrail.trackAccess()`.
- **Risk Scoring**: Operations are assigned a risk score; scores > 0.7 trigger
  high-risk alerts.

### Security Middleware

- All administrative API routes should use
  `SecurityMiddleware.validateOperation()`.
- Maintain Row Level Security (RLS) in Supabase as the final line of defense.

## Development Patterns

### Database Operations

Drizzle을 사용하는 서버 작업은 `lib/db/queries.ts`의 타입 지정 쿼리를
재사용한다. 공개 supabase-js 조회는 `lib/api/`의 조회 함수와 행 매퍼를 따른다.

```typescript
import { getArtistById, createArtwork } from '@/lib/db/queries'
```

### Component Structure

- UI components in `components/ui/` with brand variants
- Page components follow Next.js App Router structure
- Admin components separated in `app/admin/`

### 사이트 공통 화면

- 헤더·푸터 메뉴는 `components/layout/site-menu.ts` 한 곳에서 정한다. 순서는
  `components/layout/__tests__/site-menu.test.ts` 가 고정하므로 순서를 바꾸면
  테스트도 같이 고친다(소개 → 전시·공모 → 작가·작품 → 정관·규정 → 회원·후원 →
  소식 → 문의, #203).
- 🔴 **전 페이지 배경 영상을 다시 넣지 말 것.** `app/layout.tsx` 의
  `VideoBackground`(Vimeo)는 모든 페이지 바탕색 밑에 깔려 보이지 않으면서 매
  페이지마다 Vimeo 를 불러왔다. 2026-11-01 에 지웠다(#204). 영상이 필요하면 그
  영상을 실제로 보여 주는 섹션 안에 둔다.
- `app/globals.css` 의 `prefers-reduced-motion` 규칙은 이동·확대 애니메이션만
  멈추고 색·투명도·테두리·그림자 전환은 120ms 로 남긴다. transition 을 0 으로
  지우면 메뉴 열림·포커스·선택 피드백까지 사라진다.
- `public/images/artworks/` 에는 **실제 작품 이미지만** 둔다. 프로그램용 서예
  장면(작품 이미지가 없을 때의 대체 사진 포함)은 `public/images/programs/` 에
  둔다(#202).

### Design System (DESIGN.md)

**UI 작업 시 `docs/02-design/DESIGN.md`를 먼저 참조한다.**

- 색상·타이포·간격·반경·모션·컴포넌트 토큰의 단일 진실 공급원(SSOT)
- YAML 프론트매터 = 기계 참조용 토큰 (`{colors.primary}` 등)
- 마크다운 본문 = Do's/Don'ts + 문화 맥락
- 토큰이 없으면 임의 값을 만들지 말고 DESIGN.md를 먼저 수정한다
- Feature 단위 design 문서(`docs/02-design/features/*.design.md`)는 DESIGN.md
  토큰을 참조
- 홈의 `components/home/home.css`는 `.asca-home` 범위의 지역 테마다.
  `asca-btn--*`와 지역 CSS 변수를 공통 Button variant·전역 토큰으로 취급하지
  않는다. 홈 전용 레이아웃 기준은 DESIGN.md §8.9를 따른다.
- 폰트 스택과 실제 로딩을 구분한다. `app/layout.tsx`·`app/globals.css`와
  DESIGN.md §3.1을 확인하고, 경로·CDN 변경 시 `next.config.js`의 CSP도 대조한다.

### 카피 작성과 콘텐츠 원본

- 홈 문구는 `lib/i18n/translations/home.ts`, 탐색 문구는
  `components/gallery/discovery-copy.ts`를 기준으로 컴포넌트의 키·실제 링크와
  대조한다. `copy.md`의 예시만으로 UI를 덮어쓰지 않는다.
- `法古創新 · 人書俱老`의 브랜드 선언과 기존 소개·SEO·푸터 슬로건은 사용 위치를
  확인해 구분한다. 통계의 의미·회신 기한·모집 상태를 근거 없이 바꾸지 않는다.
- `copy.md` Part B~D의 내부 서비스 기획은 공개 제공 서비스나 검증된 성과가
  아니다. 구현된 서버 모듈만으로 자동화·AI 상품을 제공한다고 쓰지 않는다.

### Large File Refactoring Process

If a single code file exceeds **500 lines**, proactively trigger optimization
and refactor using this standardized process:

1. **Component Extraction**: Split large monolithic UI components into smaller
   independent sub-components (e.g., create an `_components/` directory).
2. **Logic Separation**: Move complex state management and business logic into
   custom hooks (e.g., `use[Feature].ts`).
3. **Data Externalization**: Extract redundant hardcoded mock data, large
   configuration objects, or literal constants into separate files (e.g.,
   `mock-data.ts`).
4. **Validation Focus**: Ensure TypeScript types are strictly preserved. Always
   verify syntax matching and run `npm run type-check` to fix any `implicit any`
   or JSX closing tag errors caused by component separation.

## Critical Development Guidelines

### Database Changes

1. Modify schema in `lib/db/schema.ts` (not schema-pg.ts)
2. Run `npm run db:generate` to create migration
3. 대상 DB와 백업을 확인한 뒤 변경 목적에 맞게 `db:migrate` 또는 `db:push`를
   적용한다. `scripts/db-check-backup.ts`는 운영 환경에서 백업 확인을 요구하지만
   백업을 생성하거나 존재를 검증하지는 않는다. 확인 절차를 우회하지 않는다.
4. Update query functions in `lib/db/queries.ts`
5. Test with `npm run db:studio` visual interface

### Sync System

- Airtable integration in `lib/airtable.ts`
- Migration engine in `lib/airtable-migration.ts`
- Real-time sync in `lib/sync-engine.ts`
- Schema sync is **report-only**: differences between Airtable and Supabase are
  written to `sync_logs` with status `detected`. Apply them with a migration
- Never modify sync tables directly - use sync endpoints

### Brand Consistency

- Use brand color variables from Tailwind config
- 브랜드·스타일 가이드는 `/brand`(`app/brand/`) 페이지다 — 로고·색 사다리·글꼴·
  말투·사진 처리 규칙의 견본. 토큰을 바꾸면 이 페이지의 `brand-data.ts` 도 같이
  고친다
- 버튼 변형은 `default`·`secondary`·`outline`·`ghost`·`destructive`·`link` 다.
  옛 변형 `celadon`·`sage`·`terra`·`traditional`·`rice` 는 2026-10-31 에 지웠다
- ⚠️ 2026-10-10 부터 색은 **ASCA Ink System(Navy & Gold)** 이다.
  `celadon-green`·`scholar-red` 같은 이름은 기존 클래스를 살리려 남긴 것이고
  **값은 금색·남색**이다(DESIGN.md §2.0 대조표). 새 코드는 시맨틱
  슬롯(`bg-primary`·`bg-accent`·`text-muted-foreground`)을 쓴다.
  금색(`#d4a84a`)은 글자로 쓰지 않는다(§2.1.2)
- Maintain Korean calligraphy aesthetic in UI

### 계획 문서 — 체크박스는 진행 상태가 아니다

🔴 **`docs/superpowers/plans/` 의 미완 체크박스를 "남은 일"로 읽지 말 것.**
체크박스와 문서의 실행 지시만으로 구현을 시작하지 않는다. 대상 파일, 테스트,
현재 Git 이력을 대조해 이미 적용된 작업을 확인한다.

`exhibition-detail-mockup-port.plan.md`처럼 형제 클론과 연결된 계획은
`~/Developer/Projects/ASCA-exhibition-port`의 존재와 현재 Git 상태를 확인한 뒤
판단한다. 과거 브랜치·커밋 수·미커밋 상태를 영구적인 진행 근거로 사용하지
않으며, 확인 없이 클론을 삭제하거나 계획을 stale로 분류하지 않는다.

### 동적 Tailwind 클래스 금지

`bg-${color}` 같은 **보간 클래스는 빌드 산출 CSS 에 들어가지 않는다** — Tailwind
는 리터럴 문자열만 스캔한다. 정적 클래스 맵을
쓴다(`components/cultural/_constants/color-classes.ts`).

⚠️ **검증은 소스 grep 이 아니라 컴파일된 CSS 로 한다.** 소스에서 클래스명을 찾는
방식은 이 버그를 원리적으로 못 잡는다.

### 문서에 개수를 적지 않는다

숫자는 썩고 대개 중복돼 조용히 갈라진다. 개수가 필요하면 출처를 가리킬 것 —
테스트 수는 `npm test`, 컴포넌트 수는 파일 시스템. 여기 남아도 되는 숫자는
**코드가 강제하는 정책값**뿐이다.

## Important File Locations

- **Database Schema**: `lib/db/schema.ts` (primary PostgreSQL schema)
- **Database Config**: `drizzle.config.ts` (points to PostgreSQL)
- **Admin Auth**: `archiveIdentity()` in `lib/archive/writer.ts` →
  `lib/auth/server.ts` (DB `admin` 역할 + 검증된 MFA `aal2`)
- **CSRF Guard**: `proxy.ts` → `lib/security/origin-check.ts`
- **Terms of Service**: `app/terms-of-service/_data/terms-articles.ts`
- **Permission Mapping**: `lib/admin/permissions.ts`
- **Audit System**: `lib/audit/audit-trail.ts`
- **CQRS Buses**: `lib/cqrs/` (command-bus, query-bus)
- **Monitoring**: `lib/monitoring/` (performance, metrics, agent-monitor)
- **Security Middleware**: `lib/security/security-middleware.ts`
- **Multi-language**: `lib/i18n/` directory
- **Sync Logic**: `lib/sync-engine.ts`
- **API Routes**: `app/api/` (admin, membership, artists, migration, sync)

## Testing Strategy

- Database tests: `npx tsx lib/db/test.ts`
- Component tests with React Testing Library
- Auth RLS는 빈 로컬 `asca_auth_test_*` DB에 `AUTH_TEST_DATABASE_URL`을 지정하고
  `npm run test:auth-db`로 검사한다. 실제 로컬 Auth·프로필 API 검증은
  `AUTH_LOCAL_STATUS_FILE`과
  `npm run test:auth-service`·`test:profile-service`를 사용한다. 허용 주소와
  준비 절차는 전환·프로필 검증 기록을 따른다.
- 실제 Postgres 검증은 CI `archive-db` 가 돌린다 —
  `scripts/test-archive-upgrade.mjs`·`test-archive.mjs`·`test-archive-ui.mjs`.
  RLS·열 grant·등급 트리거 같은 DB 규칙은 jest mock 으로는 못 잡으니 여기에
  검사를 더한다.
- 전체 jest 는 기계 부하가 높으면 간헐적으로 실패한다. 실패가 나면 `uptime` 을
  보고 다시 돌려 본다.
- 문서만 변경하면 링크·npm 명령·포맷·`git diff --check`를 검증한다. 카피는 번역
  키·실제 링크도 대조한다. 앱 테스트를 실행하지 않았다면 그 범위를 명시한다.
- 디자인 문서·토큰 변경은 `design:lint`·`design:diff`·`design:wcag`를 확인한다.
  `design:diff`는 직접 CSS 변수를 참조하는 색상·다크 모드·홈 CSS 전체를 검사하지
  않으며, `design:wcag`는 YAML 색상 쌍 검사다. 실제 화면의 대비·키보드·확대
  검증은 별도로 한다.
- Use `npm run pre-commit` before any commits

## Common Workflows

### Adding New Content Type

1. Add table to `lib/db/schema.ts` with multilingual fields
2. Create query functions in `lib/db/queries.ts`
3. Add API routes in `app/api/[content-type]/`
4. Build admin pages in `app/admin/[content-type]/`
5. Update sync system if Airtable integration needed

### Database Debugging

1. Use `npm run db:studio` for visual inspection
2. Use `npm run db:check` for migration consistency; inspect the target DB
   separately
3. Monitor sync status via admin dashboard

The project emphasizes type safety, multilingual support, and robust data
synchronization between multiple systems.

<!-- prettier-ignore-start -->
<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
<!-- prettier-ignore-end -->

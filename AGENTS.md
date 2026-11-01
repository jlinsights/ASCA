# AGENTS.md

This file provides guidance to Codex when working with code in this repository.
It mirrors the project instructions in `docs/CLAUDE.md`.

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

### Supabase — `ASCA-2026` (`caxjyimsuvjnbmjoxfad`)

- 옛 프로젝트 `fiaoduraycyjselasmdn` 은 400일 넘게 정지돼 **복구 불가**다.
- **데이터가 있는 테이블은 `artists` 뿐이다.** 공지·전시·행사·작품 등 공개 CMS
  테이블은 `supabase/migrations/20261010233903_asca2026_public_cms_tables.sql`
  로 만든 **빈 테이블**이다. 그 이전 마이그레이션은 옛 스키마(auth.users FK,
  user_metadata 관리자 정책, 없는 'korean' 검색 설정)라 **재실행하지 말 것.**
- 홈·연혁 콘텐츠는 저장소 데이터에서 온다:
  `app/history/_data/history-events.ts`, `lib/data/blog-posts.json`.
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

### 데이터 계층이 둘이다

- **supabase-js** (`NEXT_PUBLIC_SUPABASE_URL` + 키) — 공개 페이지 조회
  (`lib/api/artists.ts` 등)
- **Drizzle** (`DATABASE_URL`, `lib/db/index.ts`) — 트랜잭션 풀러(6543)라
  `prepare: false`

### 조회 함정

- PostgREST 는 한 번에 **최대 1,000행**만 준다. 목록은 `range()` +
  `count: 'exact'` 로 페이지를 나눈다(`/api/artists?q&page&limit&title…`).
- `or()` 필터에 사용자 입력을 그대로 넣지 말 것 — `sanitizeSearchTerm` 을
  거친다.
- `artists.membership_type` 은 쉼표로 이은 복수 역할이고, 직함은 음절 사이에
  공백이 들어간 값('고 문')이 있다 — 그래서 `=` 대신 `lib/api/artists.ts` 의
  `spacingTolerantPattern` 으로 `ilike` 한다.

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
npm run build            # Production build
npm run start            # Start production server
npm run pre-commit       # Full quality check before commits
```

### Database Management

```bash
npm run db:studio        # Open Drizzle Studio GUI (key tool)
npm run db:push          # Apply schema changes to database
npm run db:seed          # Seed development data
npm run db:reset         # Complete reset: drop + push + seed
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

### Multi-language Pattern

All content tables use consistent multilingual structure:

- `title`, `titleKo`, `titleEn`, `titleCn`, `titleJp`
- `description`, `descriptionKo`, `descriptionEn`, `descriptionCn`,
  `descriptionJp`

### UI 번역 (i18n)

화면 문구는 DB 필드가 아니라 클라이언트 번역표로 바꾼다. 언어: `ko`(기본)·`en`·
`ja`·`zh`. **중국어는 번체(`zh-TW`)로 통일한다** — 간체를 쓰지 말 것.
`lib/i18n/__tests__/zh-traditional.test.ts` 는 2026-10-11 에 섞여 있던 간체 글자
목록만 막으므로, 새 간체 글자는 통과할 수 있다.

- 컴포넌트에서는 `useLanguage()`(`contexts/language-context.tsx`)의 `t(key)`·
  `language` 를 쓴다. 날짜·숫자는 `metadata.locale` 로 포맷한다.
- 선택한 언어는 `localStorage` 의 `asca-language` 에 저장된다. URL 에 언어가
  없으므로(로케일 라우팅 없음) 서버 렌더·메타데이터는 한국어다.
- 번역표는 `lib/i18n/translations/*.ts` 에 화면 단위로 둔다(`site-chrome`·
  `about`·`exhibitions`·`home` 등). **새 파일은 `lib/i18n/translations.ts` 의
  4개 언어 블록 모두에 펼쳐 넣어야** `t()` 가 찾는다. 키 접두사로 화면을
  구분한다 (`site*`·`intro*`·`history*`·`ex*`).
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

Always use typed queries from `lib/db/queries.ts`:

```typescript
import { getArtistById, createArtwork } from '@/lib/db/queries'
```

### Multi-language Content

Use the established pattern for all content:

```typescript
{
  title: string,      // Korean (default)
  titleEn?: string,   // English
  titleCn?: string,   // Chinese
  titleJp?: string    // Japanese
}
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
3. Apply with `npm run db:push`
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
작업이 끝나도 아무도 돌아가서 체크하지 않는다.

`2026-05-17-dynamic-tailwind-class-fix` 가 실제로 그랬다 — 체크박스 **53개 전부
미완**인데 상단에는 실행
지시(`**For agentic workers:** REQUIRED SUB-SKILL: …`)가 달려 있었다. 그대로
실행하면 이미 적용된 리팩터를 되돌린다. 2026-09-14 에 **정지 헤더**를
달았다(Task 1 산출물 2파일 실재 + 대상 5개 컴포넌트에 동적 클래스 0건으로 확인).

⚠️ **`exhibition-detail-mockup-port.plan.md` 는 다르다 — 진짜 진행 중이다.**
형제 클론 `~/Developer/Projects/ASCA-exhibition-port` 의
`feat/exhibition-detail-port` 브랜치에 고유 커밋 21개(+다른 3개 브랜치에 20개)와
미커밋 변경이 있다. 같은 저장소의 두 번째 작업 클론이므로 **지우거나 stale 로
표시하지 말 것.**

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
2. Check schema with `scripts/check-supabase-schema.js`
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

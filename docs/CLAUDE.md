# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

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
- 프로덕션 주소는 `asca-main.vercel.app` 이다. ⚠️ `orientalcalligraphy.org`
  루트· `www` 의 DNS(Cloudflare)는 아직 **Webflow** 를 가리킨다. 이 저장소를
  배포해도 그 도메인은 바뀌지 않는다(하위 도메인 anam·heelang·catalog2025·jury
  는 각각 다른 Vercel 프로젝트).
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
- 계정–작가 연결 칸 `claimed_by_user_id` 는 있지만 **채워진 행이 없고** 연결하는
  화면도 없다. 그래서 `/profile/edit` 은 지금 누구에게나 조회·저장이 실패한다
  (Clerk 사용자 id 를 작가 uuid 로 조회하고, 브라우저 anon 클라이언트로 직접
  update 한다). Supabase Auth 전환 후 서버 API 로 다시 만든다.

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
```

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

- 지금 main 은 **Clerk** 이다(Supabase Auth 는 제거된 상태).
- ⚠️ **Supabase Auth 로 전환하는 작업이 `feat/supabase-auth` 에서 진행 중이다.**
  인증·헤더·`/profile`·관리자 보호 라우트를 그 브랜치가 고치고 있으니, 이 영역을
  바꾸기 전에 그 브랜치와 겹치는지 확인한다.
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

- 관리자 계정은 `info@orientalcalligraphy.org` 다. 비밀번호 로그인이다(자동
  로그인·`/admin/dev-login` 은 없다).
- 관리자 여부는 `lib/archive/writer.ts` 의 `archiveIdentity()` 가 정한다 — Clerk
  의 **검증된 대표 이메일**이 Vercel 환경변수 `ADMIN_EMAILS`(또는
  `SUPER_ADMIN_EMAILS`)에 있으면 관리자다(`lib/auth/admin-roles.ts`). 관리자 API
  는 이걸로 401·403 을 가르고 그다음에만 service role 을 쓴다.
- ⚠️ `lib/auth/middleware.ts` 의 관리자 확인은 DB 에 **없는 `user_profiles`**
  테이블을 봐서 항상 실패한다. 새 관리자 기능은 `archiveIdentity()` 를 쓴다.

### 동작하는 관리 화면

- `/admin` → `/admin/artists` 로 보낸다.
- **`/admin/artists` — 작가 회비 관리**: 이름 검색·등급·회비 상태 필터, 행마다
  `dues_status` 변경(`PATCH /api/admin/artists/[id]`, Origin 검사·분당 60회·
  `auditTrail.trackDataChange` 기록). 회비 상태를 바꾸면 트리거가 공개 여부를
  맞추고, 응답에 바뀐 `visibility` 가 온다.
- 메뉴(`components/admin/admin-nav-items.ts`)에는 **페이지가 있는 화면만**
  싣는다. 테스트가 href 마다 `app/admin/**/page.tsx` 가 있는지 확인한다.
- ⚠️ `/admin/contests` 는 위 `user_profiles` 때문에 항상 튕기고,
  `/admin/membership` 은 예시 데이터라 메뉴에서 뺐다.

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
- 버튼 변형 `celadon`·`sage`·`terra`·`traditional` 은 옛 이름이다. 새 코드는
  `default`·`secondary`·`outline`·`ghost` 를 쓴다
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
- **Admin Auth**: `archiveIdentity()` in `lib/archive/writer.ts` (Clerk +
  `ADMIN_EMAILS`)
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

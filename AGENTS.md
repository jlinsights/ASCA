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
- **Admin Dashboard**: Complete CMS for managing artists, artworks, exhibitions
- **Advanced Gallery**: Filtering, categorization, and viewing features

## 작업 원칙

- 한국어로 응답하고 파일 작업과 셸의 작업 위치에는 절대 경로를 사용한다.
- 변경 전 대상 파일과 관련 코드를 읽고, 시작 시 `git status --short --branch`로
  기존 변경을 확인한다. 사용자의 미커밋 변경은 보존한다.
- 명시적 요청 없이 커밋·푸시·병합하지 않는다.
- 변경 시 `.commit_message.txt`를 먼저 읽고, 이모지를 포함한 한국어 한 줄로
  덮어쓴다. revert 작업이면 비운다.
- `AGENTS.md`와 `docs/CLAUDE.md`의 공통 본문은 함께 갱신한다. 루트 `CLAUDE.md`는
  `docs/CLAUDE.md`를 불러오는 진입 문서로 유지한다.
- 형제 작업 폴더의 변경·병합 여부는 현재 `git worktree list`와 해당 폴더의 Git
  상태·이력을 대조한다. 과거 세션 요약만으로 작업을 재실행하지 않는다.
- 웹 브라우징은 `/Users/jaehong/.agents/skills/gstack/browse/SKILL.md`를 따른다.
  `mcp__claude-in-chrome__*` 도구는 사용하지 않는다.
- 일반 설치·사용 안내는 `README.md`, 실행 명령은 `package.json`, 환경 변수는
  `.env.example`과 `lib/config/env.ts`를 기준으로 한다.
- 코드 검사, 빌드, 배포, 인증된 브라우저 확인은 서로 다른 검증이다. 실제로
  통과한 범위만 완료로 보고한다.

## 운영 환경과 데이터

### 배포 — Vercel `asca-main`

- `vercel.json` 의 빌드 명령은 **`npm run build:full`** 이다. page-data 수집이
  켜져 `lib/config/env.ts` 의 zod 검증이 돌고, **`DATABASE_URL` 이 없으면 빌드가
  죽는다.** Production·Preview 양쪽에 있어야 한다.
- 로컬·CI 의 `npm run build` 는 compile-only 라 이 실패를 **못 잡는다.** 배포
  검증은 `NODE_ENV=production npm run build:full` 로 한다(셸에
  `NODE_ENV=development` 가 남아 있으면 prerender 가 `useContext` null 로
  죽는다).
- 배포 프로젝트 참조는 `asca-main`, 주소는 `asca-main.vercel.app`이다. 실제
  배포·플랜·DNS 연결 상태는 작업 시 확인한다. 이 저장소의 배포와
  `orientalcalligraphy.org` 도메인 연결 변경은 별도 작업이다.
- 필수 환경 변수는 `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`,
  `CLERK_SECRET_KEY`다. 정확한 검증 규칙은 `lib/config/env.ts`를 따른다.
- `DATABASE_URL`은 PostgreSQL 연결 문자열이다. SQLite 파일 URL을 사용하지
  않는다. service role 키와 서버 비밀키는 클라이언트 코드나 저장소에 넣지
  않는다.

### Supabase와 마이그레이션

- 프로젝트 참조는 `ASCA-2026` (`caxjyimsuvjnbmjoxfad`)이다. 작업 대상은 실제
  환경 설정과 대조하고, 테이블의 데이터 유무는 조회 후 판단한다.
- 공개 CMS 테이블 생성 이력은
  `supabase/migrations/20261010233903_asca2026_public_cms_tables.sql`을
  참조한다. 그 이전 마이그레이션에는 옛 프로젝트의 auth.users FK, 관리자 정책,
  검색 설정이 있으므로 현재 DB에 일괄 재실행하지 않는다.
- 홈은 `app/page.tsx`에서 연혁·블로그 데이터를 읽고
  `components/home/home-data.ts`로 집계해 `components/home/`에 전달한다. 원본은
  `app/history/_data/history-events.ts`, `lib/data/blog-posts.json`이다. 홈
  통계나 전시 기록을 수정할 때 CMS 데이터로 간주하지 않는다.
- 공개 CMS의 RLS는 읽기 공개, 쓰기 service_role 제한을 유지한다.
- `execute_sql` 같은 임의 SQL RPC를 만들지 않는다. 구조 변경은 마이그레이션으로
  한다.
- DB 덤프·개인정보·자격 증명은 커밋하지 않는다.

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
npm run test:e2e         # Playwright; see Testing Strategy for auth limitations
npm run design:lint      # DESIGN.md specification lint
npm run design:wcag      # Design token contrast checks
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

- **Clerk** handles all authentication (Supabase Auth is fully removed)
- Server Actions for admin/membership are being replaced by secure API routes

### 다국어와 공개 API 타입

- UI 언어 코드는 `ko`, `en`, `ja`, `zh`다. DB 컬럼 이름과 구분한다.
- Drizzle의 다국어 필드는 `lib/db/schema.ts`를 따른다(`titleCn`, `titleJp` 등).
  공개 Supabase 작가 행은 `name_zh`, `name_ja`를 사용하며
  `lib/api/artist-mapper.ts`가 `nameZh`, `nameJa` 등 화면 타입으로 변환한다.
  PostgREST 원시 행에 Drizzle의 camelCase 타입을 그대로 붙이지 않는다.
- 화면 번역은 `contexts/language-context.tsx`와 `lib/i18n/`을 따른다. 새
  번역표는 `lib/i18n/translations.ts`의 정적 통합표에도 연결한다. 기본 언어의
  SSR·첫 렌더에서 번역 키가 노출되지 않는지 확인한다.
- 번역한 필터 라벨로 DB 필터 값을 바꾸지 않는다. 탐색 UI의 공통 레이블은
  `components/gallery/discovery-copy.ts`를 참조한다.

## Admin System

### 관리자 인증

- `/admin`은 `app/admin/layout.tsx`의 `AdminProtectedRoute`를 사용한다.
- 요청 인증 처리는 `proxy.ts`와 Clerk 설정, 권한 판단은 관리자 관련 구현을
  확인한다.
- 특정 이메일만으로 무인증 로그인이나 전체 권한을 가정하지 않는다.
- 관리자 동작은 실제 Clerk 세션과 해당 역할로 검증한다.

### Key Admin Features

- Artist/artwork management
- Exhibition scheduling
- News/event publishing
- Database migration monitoring
- Real-time sync controls
- **Audit Log Viewer**: High-risk activity monitoring and compliance reporting
- **System Health**: Performance metrics and agent status tracking

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
- Follow component variants: celadon, sage, terra, traditional
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
`/Users/jaehong/Developer/Projects/ASCA-exhibition-port`의 존재와 현재 Git
상태를 확인한 뒤 판단한다. 과거 브랜치·커밋 수·미커밋 상태를 영구적인 진행
근거로 사용하지 않으며, 확인 없이 클론을 삭제하거나 계획을 stale로 분류하지
않는다.

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
- **Admin Auth**: Clerk Authentication integration
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
- 관리자 기능은 실제 Clerk 로그인과 역할별 권한으로 검증한다.
  `/admin/dev-login`은 현재 존재하는 테스트 경로로 가정하지 않는다.
- `playwright.config.ts`는 개발 서버를 시작하며 `PLAYWRIGHT_BASE_URL`로 대상
  URL을 정한다. `proxy.ts`는 `NODE_ENV=test` 또는 `PLAYWRIGHT_BASE_URL`이 설정된
  서버에서 Clerk 보호 대신 E2E 프록시를 사용한다. 이 조건의 테스트는 실제 관리자
  인증 검증을 대신하지 못하며 운영 서버에 해당 설정을 넣지 않는다.
- 문서만 변경하면 링크·npm 명령·포맷·`git diff --check`를 검증한다. 앱 테스트를
  실행하지 않았다면 그 범위를 명시한다.
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

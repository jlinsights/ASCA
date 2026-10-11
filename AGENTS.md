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

## 운영 환경과 데이터 (2026-10-11 기준)

### 배포 — Vercel `asca-main`

- `vercel.json` 의 빌드 명령은 **`npm run build:full`** 이다. page-data 수집이
  켜져 `lib/config/env.ts` 의 zod 검증이 돌고, **`DATABASE_URL` 이 없으면 빌드가
  죽는다.** Production·Preview 양쪽에 있어야 한다.
- 로컬·CI 의 `npm run build` 는 compile-only 라 이 실패를 **못 잡는다.** 배포
  검증은 `NODE_ENV=production npm run build:full` 로 한다(셸에
  `NODE_ENV=development` 가 남아 있으면 prerender 가 `useContext` null 로
  죽는다).
- Hobby 플랜이라 동시 빌드 1개 — Preview 는 Production 뒤에서 대기한다.
- 프로덕션 주소는 `asca-main.vercel.app` 이다. ⚠️ `orientalcalligraphy.org`
  루트· `www` 의 DNS(Cloudflare)는 아직 **Webflow** 를 가리킨다. 이 저장소를
  배포해도 그 도메인은 바뀌지 않는다(하위 도메인 anam·heelang·catalog2025·jury
  는 각각 다른 Vercel 프로젝트).

### Supabase — `ASCA-2026` (`caxjyimsuvjnbmjoxfad`)

- 옛 프로젝트 `fiaoduraycyjselasmdn` 은 400일 넘게 정지돼 **복구 불가**다.
- **데이터가 있는 테이블은 `artists` 뿐이다.** 공지·전시·행사·작품 등 공개 CMS
  테이블은 `supabase/migrations/20261011000001_asca2026_public_cms_tables.sql`
  로 만든 **빈 테이블**이다. 그 이전 마이그레이션은 옛 스키마(auth.users FK,
  user_metadata 관리자 정책, 없는 'korean' 검색 설정)라 **재실행하지 말 것.**
- 홈·연혁 콘텐츠는 저장소 데이터에서 온다:
  `app/history/_data/history-events.ts`, `lib/data/blog-posts.json`.
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

- **Clerk** handles all authentication (Supabase Auth is fully removed)
- Server Actions for admin/membership are being replaced by secure API routes

### Multi-language Pattern

All content tables use consistent multilingual structure:

- `title`, `titleKo`, `titleEn`, `titleCn`, `titleJp`
- `description`, `descriptionKo`, `descriptionEn`, `descriptionCn`,
  `descriptionJp`

## Admin System

### Special Admin Account

- Email: `info@orientalcalligraphy.org`
- Auto-login without password
- Full CMS access at `/admin`

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
- Follow component variants: celadon, sage, terra, traditional
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
- Admin functionality testing via `/admin/dev-login`
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

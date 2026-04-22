---
template: design
version: 1.2
feature: warning-cleanup-cycle-2
date: 2026-04-22
author: jhlim725
project: ASCA (my-v0-project)
version_project: 0.1.0
parent_cycle: warning-cleanup
---

# warning-cleanup-cycle-2 Design Document

> **Summary**: Stage 3/4/5/7 상세 설계 — 파일별 분리 맵, barrel export 규칙, sub-component 네이밍, Server/Client 경계, 병합 순서
>
> **Project**: ASCA (my-v0-project)
> **Version**: 0.1.0
> **Author**: jhlim725
> **Date**: 2026-04-22
> **Status**: Draft
> **Planning Doc**: [warning-cleanup-cycle-2.plan.md](../../01-plan/features/warning-cleanup-cycle-2.plan.md)
> **Parent Design**: [warning-cleanup.design.md](./warning-cleanup.design.md) — Stage 3/4/5 원 설계 계승

---

## 1. Overview

### 1.1 Design Goals

- `npm run lint:strict` 0 warnings 달성
- 기존 외부 import 경로 100% 보존 (barrel 패턴)
- 도메인별 응집도 + 순환 참조 0
- Next.js 'use client' 경계 유지
- 각 Stage 독립 커밋 (rollback 가능)

### 1.2 Design Principles

- **Barrel first**: 분리 폴더는 `index.ts`가 단일 진입점
- **Domain cohesion**: 파일 크기 맞추기보다 도메인 경계 우선
- **Zero behavior change**: 모든 분리 후 동작 동일
- **Presentational extraction**: 페이지는 data fetching + layout, sub-component는 순수 렌더
- **shadcn protection**: 외부 upstream 원본은 수정하지 않고 override

---

## 2. Architecture

### 2.1 Dependency Flow (변경 없음)

```
Presentation ──→ Application ──→ Domain ←── Infrastructure
(app/, components/)     ↓
                        └──→ Infrastructure (lib/)
```

본 Cycle은 레이어 내부 파일 세분화만 수행.

### 2.2 Barrel Pattern

```typescript
// lib/types/gallery/index.ts
export * from './artwork';
export * from './image';
export * from './viewer';
export * from './comparison';
export * from './filters';

// 외부 호출자 (변경 불필요)
import { Artwork, GalleryImage } from '@/lib/types/gallery';
```

### 2.3 Dependencies

| Component | Depends On | Notes |
|-----------|-----------|-------|
| Barrel `index.ts` | 동일 폴더 subfiles | 순환 참조 방지 위해 sub-file끼리 import 최소화 |
| `_components/*` | 페이지의 데이터 타입, 유틸 | Props로만 데이터 주입 |
| GraphQL schema 병합 | template literal 조합 | `mergeTypeDefs` 의존성 추가 X |

---

## 3. Data Model (Split Maps)

### 3.1 Stage 3 — Types

#### `lib/types/gallery.ts` (710줄) → `lib/types/gallery/`

```
lib/types/gallery/
├── index.ts              # barrel: export * from './artwork' 등
├── artwork.ts            # Artwork, ArtworkMeta, ArtworkCategory, ArtworkStatus
├── image.ts              # GalleryImage, ImageVariant, ImageMetadata, ImageOptimization
├── viewer.ts             # ZoomableViewerState, StrokeAnimation, ViewerControls
├── comparison.ts         # ArtworkComparison, ComparisonMode, ComparisonResult
└── filters.ts            # GalleryFilter, SortOption, PaginationState
```

**분리 기준**: 기존 710줄을 도메인별로 100~200줄 단위.

#### `lib/types/membership.ts` (597줄) → `lib/types/membership/`

```
lib/types/membership/
├── index.ts
├── member.ts             # Member, MemberProfile, MemberStatus, MemberRole
├── application.ts        # Application, ApplicationStatus, ApplicationReview
├── subscription.ts       # Subscription, Plan, BillingCycle
├── benefits.ts           # Benefits, Privileges, Tier
└── audit.ts              # MembershipAuditLog, AuditAction
```

### 3.2 Stage 4 — Services/Schema/Icons

#### `lib/services/image-service.ts` (687줄) → `lib/services/image/`

```
lib/services/image/
├── index.ts              # barrel: ImageService 클래스 re-export 또는 함수 barrel
├── upload.ts             # uploadImage, getUploadUrl, multipartUpload
├── transform.ts          # resizeImage, cropImage, convertFormat
├── validation.ts         # validateImage, validateMimeType, checkDimensions
├── storage.ts            # Supabase Storage 연동, S3 호환 API
└── metadata.ts           # extractExif, getDimensions, getColorPalette
```

**의존성**: `storage.ts`는 `validation.ts` 사용, `transform.ts`는 `metadata.ts` 참조. `index.ts`는 순수 barrel.

#### `lib/api/membership.ts` (515줄) → `lib/api/membership/`

```
lib/api/membership/
├── index.ts
├── applications.ts       # CRUD
├── benefits.ts           # 혜택 조회/적용
├── subscriptions.ts      # 구독 관리
└── admin.ts              # 관리자 전용 승인/거부
```

#### `lib/graphql/schema.ts` (783줄) → `lib/graphql/schema/`

```
lib/graphql/schema/
├── index.ts              # 병합된 typeDefs export
├── common.graphql.ts     # 공통 타입 (PageInfo, Connection 등)
├── user.graphql.ts
├── artwork.graphql.ts
├── exhibition.graphql.ts
├── event.graphql.ts
├── notice.graphql.ts
└── member.graphql.ts
```

**병합 전략**:
```typescript
// lib/graphql/schema/index.ts
import { userTypeDefs } from './user.graphql';
import { artworkTypeDefs } from './artwork.graphql';
// ...

export const typeDefs = `
  ${commonTypeDefs}
  ${userTypeDefs}
  ${artworkTypeDefs}
  ${exhibitionTypeDefs}
  ${eventTypeDefs}
  ${noticeTypeDefs}
  ${memberTypeDefs}
`;
```

**의존성 추가 없음** — template literal 조합만 사용.

#### `lib/icons.ts` (512줄) → `lib/icons/`

```
lib/icons/
├── index.ts              # 모든 아이콘 re-export
├── social.ts             # Kakao, Facebook, Instagram, Twitter, YouTube
├── navigation.ts         # Menu, ChevronLeft, Home, Back
├── action.ts             # Save, Delete, Edit, Search, Filter
└── domain.ts             # Calligraphy, Brush, Scroll, Stamp (서예 도메인)
```

### 3.3 Stage 5a — Page Extraction

#### 추출 패턴 (예: `app/artists/page.tsx` 755줄)

```
Before:
  app/artists/page.tsx (755줄)
    - 데이터 fetching
    - 상태 관리
    - 필터 UI
    - 그리드 렌더
    - 카드 렌더
    - 페이지네이션

After:
  app/artists/
    ├── page.tsx                       # < 200줄 (data + composition)
    └── _components/
        ├── ArtistsHero.tsx            # 상단 히어로 + 검색
        ├── ArtistsFilter.tsx          # 카테고리/지역/연도 필터
        ├── ArtistsGrid.tsx            # 리스트 렌더링 로직
        ├── ArtistsCard.tsx            # 개별 카드
        ├── ArtistsPagination.tsx      # 페이지네이션
        └── useArtistsFilter.ts        # (선택) URL state hook
```

#### 페이지별 서브 컴포넌트 스케치

| Page | Sub-components (draft) |
|------|------------------------|
| `artists/page.tsx` | Hero, Filter, Grid, Card, Pagination |
| `artworks/[id]/page.tsx` | ArtworkHero, ArtworkDetails, ArtworkGallery, ArtistInfo, RelatedWorks |
| `artworks/genre/[genre]/page.tsx` | GenreHero, GenreFilter, GenreGrid |
| `artworks/upload/artwork-upload-client.tsx` | UploadForm, UploadSteps, UploadPreview, CategorySelector |
| `awards/[year]/page.tsx` | YearHero, WinnerList, WinnerCard, YearNavigation |
| `events/page.tsx` | EventsHero, EventsFilter, EventsGrid, EventsCard |
| `events/[id]/page.tsx` | EventHero, EventDetails, EventSchedule, EventRegistration |
| `exhibitions/page.tsx` | ExhibitionsHero, ExhibitionsFilter, ExhibitionsList, ExhibitionCard |
| `exhibitions/[id]/page.tsx` | ExhibitionHero, ExhibitionInfo, ExhibitionArtworks, ExhibitionArtists |
| `history/page.tsx` | HistoryHero, HistoryTimeline, HistorySection, HistoryMilestone |
| `programs/cultural-exchange/page.tsx` | ProgramHero, ProgramOverview, ProgramDetails, ProgramSchedule |
| `admin/membership/page.tsx` | AdminHeader, ApplicationList, ApplicationCard, ApplicationDialog, FilterBar |
| `articles-of-incorporation-and-bylaws/_components/bylaws-content.tsx` | BylawsToc, BylawsArticle, BylawsAppendix (기존 `_components` 내부 세분화) |
| `profile/membership/_components/profile-tabs.tsx` | ProfileTab (탭별 콘텐츠를 각각 파일로), ProfileTabList, ProfileTabContent |
| `academy/_components/sac-academy.tsx` | AcademyHero, AcademyCourses, AcademyInstructors, AcademyCTA |

### 3.4 Stage 5b — Component Decomposition

| Component | Sub-components / Hooks |
|-----------|------------------------|
| `components/gallery/StrokeAnimationPlayer.tsx` (741) | Player, Controls, Timeline, useStrokeAnimation |
| `components/gallery/ArtworkComparison.tsx` (681) | ComparisonPanel, ComparisonSlider, useComparison |
| `components/gallery/GalleryGrid.tsx` (617) | GridItem, GridFilter, useGalleryGrid |
| `components/gallery/ZoomableImageViewer.tsx` (555) | ZoomControls, ViewerCanvas, usePanZoom |
| `components/cultural/CulturalAccessibility.tsx` (627) | A11yPanel, A11yToggle, useA11ySettings |
| `components/cultural/CulturalCalendar.tsx` (611) | CalendarView, CalendarEvent, CalendarMonthSelector |
| `components/cultural/LearningHub.tsx` (527) | HubSection, HubCard, HubFilter |
| `components/layout/layout-footer.tsx` (501) | FooterNav, FooterSocial, FooterCopyright |
| `components/ui/sidebar.tsx` (671) | **shadcn 원본인지 확인** → override 우선 |

### 3.5 sidebar.tsx 결정 프로토콜

```
1. `grep "shadcn" components/ui/sidebar.tsx` → 주석 확인
2. `diff` with https://ui.shadcn.com/r/styles/default/sidebar.json upstream
3. 원본이면: `.eslintrc.json`에 override 추가
4. 자체 작성이면: SidebarGroup, SidebarItem, SidebarTrigger 분리
```

---

## 4. Component API (추출된 sub-component 예시)

### 4.1 ArtistsGrid (Server-friendly)

```typescript
// app/artists/_components/ArtistsGrid.tsx
import type { Artist } from '@/lib/types/artist';
import { ArtistsCard } from './ArtistsCard';

interface ArtistsGridProps {
  artists: Artist[];
  filter?: { category?: string; region?: string };
}

export function ArtistsGrid({ artists, filter }: ArtistsGridProps) {
  const filtered = filter ? applyFilter(artists, filter) : artists;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filtered.map(artist => (
        <ArtistsCard key={artist.id} artist={artist} />
      ))}
    </div>
  );
}
```

### 4.2 Client-component 분리 (상태 있음)

```typescript
// app/artists/_components/ArtistsFilter.tsx
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface ArtistsFilterProps {
  categories: string[];
}

export function ArtistsFilter({ categories }: ArtistsFilterProps) {
  const router = useRouter();
  const params = useSearchParams();
  // ...
}
```

### 4.3 page.tsx (슬림)

```typescript
// app/artists/page.tsx
import { fetchArtists, fetchCategories } from '@/lib/api/artists';
import { ArtistsHero } from './_components/ArtistsHero';
import { ArtistsFilter } from './_components/ArtistsFilter';
import { ArtistsGrid } from './_components/ArtistsGrid';

export default async function ArtistsPage() {
  const [artists, categories] = await Promise.all([
    fetchArtists(),
    fetchCategories(),
  ]);

  return (
    <main>
      <ArtistsHero />
      <ArtistsFilter categories={categories} />
      <ArtistsGrid artists={artists} />
    </main>
  );
}
```

---

## 5. UI/UX Design

UI 동작 변경 없음. 시각 회귀 검증:

### 5.1 Visual Regression

- 각 추출 전후 스크린샷 비교 (Playwright)
- Breakpoints: 320 / 768 / 1024 / 1440
- 우선순위: artists, artworks/[id], admin/membership (상위 트래픽)

### 5.2 Server/Client 경계 유지 규칙

| Component Type | Rule |
|----------------|------|
| Data fetching | page.tsx (Server) |
| 인터랙티브 UI (상태, 이벤트) | `_components/*.tsx` with `'use client'` |
| Pure presentational | Server (기본) |
| URL state | Client + `useSearchParams` |

---

## 6. Error Handling

변경 없음. 기존 `try/catch` + `structuredLogger` 패턴 유지. 단, 추출 시 error boundary 누락 방지:

| Error Scenario | Handler Location |
|----------------|------------------|
| Server fetch 실패 | page.tsx의 error.tsx |
| Client-side mutation 실패 | `_components/*`의 toast/alert |
| Validation 실패 | sub-component 내부 |

---

## 7. Security Considerations

- [x] 'use client' 경계를 통한 서버 전용 데이터 누수 방지 — page.tsx에서만 secret 사용
- [x] GraphQL schema 분리 시 introspection 노출 정책 동일 유지 (production에서 disable)
- [x] Image service 분리 시 Storage signed URL 로직 무변경
- [x] Auth middleware / session 관련 타입은 분리 대상 아님 (현 파일 구조 유지)

---

## 8. Test Plan

### 8.1 Test Strategy

| Type | Target | Tool |
|------|--------|------|
| Type | 전체 | `tsc --noEmit` |
| Unit | 분리된 utility (있다면) | Jest |
| Integration | 페이지 data fetching | Jest (app/api/**/__tests__) |
| E2E | 추출된 페이지 스모크 | Playwright (test:e2e:ci) |
| Regression | 기존 jest 테스트 100% | `npm run test:ci` |

### 8.2 Test Gates per Stage

**모든 Stage 종료 조건**:
```bash
npm run type-check && npm run lint
```

**Stage 7 최종 조건**:
```bash
npm run lint:strict && \
npm run type-check && \
npm run test:ci && \
npm run test:e2e:ci && \
npm run build
```

### 8.3 Specific Test Cases

- [ ] `import { Artwork } from '@/lib/types/gallery'` 그대로 동작 (barrel)
- [ ] Drizzle ORM 타입 추론 유지 (`lib/types/membership`의 Member)
- [ ] GraphQL schema introspection 응답 동등 (분리 전후 hash 비교)
- [ ] 추출된 페이지의 SSR 출력 HTML 동등 (주요 5 페이지)
- [ ] E2E: artists/events/exhibitions/admin-membership 스모크
- [ ] Build: `.next/standalone/*`와 번들 manifest 크기 +2% 이내

---

## 9. Clean Architecture

### 9.1 Layer 유지

| Layer | Target Files | Stage |
|-------|--------------|-------|
| Domain | `lib/types/gallery/`, `lib/types/membership/` | 3 |
| Application | `lib/services/image/`, `lib/api/membership/` | 4 |
| Infrastructure | `lib/graphql/schema/`, `lib/icons/` | 4 |
| Presentation | `app/**/_components/`, `components/**/` | 5 |

### 9.2 Import Rules (재확인)

| From | Can Import | Cannot Import |
|------|-----------|---------------|
| `_components/*` | 같은 페이지 util, `@/lib/types`, `@/components/ui` | 다른 페이지의 `_components/` (금지) |
| `lib/types/gallery/*` | 다른 `lib/types/*` | `lib/services`, `lib/api` (순환 위험) |
| barrel `index.ts` | sub-file만 | sub-file이 barrel을 import 금지 |
| shadcn 원본 | 수정 불가 | override로 해결 |

### 9.3 Circular Dependency Detection

```bash
npx madge --circular --extensions ts,tsx lib/
npx madge --circular --extensions ts,tsx app/
```

각 Stage 완료 후 실행 권장 (Stage 3부터).

---

## 10. Coding Convention Reference

### 10.1 Naming

| Target | Rule | 예시 |
|--------|------|------|
| 분리된 type 파일 | camelCase.ts | `artwork.ts`, `subscription.ts` |
| 분리된 service 파일 | camelCase.ts | `upload.ts`, `metadata.ts` |
| GraphQL partial | `{domain}.graphql.ts` | `user.graphql.ts` |
| barrel | `index.ts` | 고정 |
| `_components/` 파일 | PascalCase.tsx | `ArtistsGrid.tsx` |
| `_components/` 훅 | `use*.ts` | `useArtistsFilter.ts` |
| 폴더 | kebab-case 또는 기능명 | `gallery/`, `_components/` |

### 10.2 Import Order (barrel 도입 후)

```typescript
// 1. External
import { useState } from 'react';

// 2. Internal absolute — barrel 우선
import { Artwork } from '@/lib/types/gallery';  // barrel
import { info } from '@/lib/logging';

// 3. Relative
import { ArtistsCard } from './ArtistsCard';

// 4. Types
import type { Artist } from '@/lib/types/artist';
```

### 10.3 File Size Convention

| Type | Target | Hard limit |
|------|--------|-----------|
| 일반 소스 | 300줄 | 500줄 |
| 도메인 type 파일 | 200줄 | 300줄 |
| 페이지 page.tsx | 150줄 | 200줄 |
| `_components/*.tsx` | 200줄 | 400줄 |
| 테스트 | 제한 없음 (override) | — |

---

## 11. Implementation Guide

### 11.1 Stage 실행 순서 및 커밋 전략

| Stage | 작업 | Commit 단위 | Gate |
|-------|------|------------|------|
| 3 | Types 2 파일 분리 | Stage 단위 (1 commit) | type-check + grep 호출자 |
| 4a | `image-service.ts` | 1 commit | type-check |
| 4b | `api/membership.ts` | 1 commit | type-check |
| 4c | `graphql/schema.ts` | 1 commit | type-check + GraphQL introspection 비교 (선택) |
| 4d | `icons.ts` | 1 commit | type-check |
| 5a-1 | 페이지 5개 (batch #1: artists, artworks/[id], artworks/genre, artworks/upload, awards) | 페이지별 커밋 (5 commits) | 페이지별 type-check + lint |
| 5a-2 | 페이지 7개 (batch #2: events*, exhibitions*, history, programs, admin/membership, bylaws, profile-tabs, sac-academy) | 페이지별 커밋 (8 commits) | 동일 |
| 5b-1 | `components/gallery/*` 4개 | 컴포넌트별 (4 commits) | type-check + screenshot 비교 |
| 5b-2 | `components/cultural/*` 3개 | 컴포넌트별 (3 commits) | 동일 |
| 5b-3 | `layout/footer` + `ui/sidebar` | 2 commits (sidebar는 override면 1) | 동일 |
| 7 | 최종 검증 | 검증만 (commit 없음) 또는 override tweak 1 commit | 전체 gate |

**예상 총 commit 수**: ~25–28

### 11.2 Rollback Strategy

- 각 파일별 독립 commit → 개별 revert 가능
- `git bisect`로 회귀 추적
- Stage 3/4 파손 시: `git reset --hard <previous stage>`
- Stage 5 파손 시: 페이지별 revert

### 11.3 Commit Message Template

```
refactor(cycle-2/stage-{N}): {파일/페이지명} {action}

- {세부 변경}
- {세부 변경}

Warning delta: {before} → {after}
File line reduction: {before} → {after}
```

### 11.4 Tool 설치 (선택)

```bash
# 순환 의존성 탐지
npm install -D madge

# jscodeshift 사용 시 (자동화하려면)
npx jscodeshift -t <transform.js> <path>
```

---

## 12. Success Metrics

| Metric | Before | Target | Measurement |
|--------|--------|--------|-------------|
| ESLint warnings | 30 | 0 | `npm run lint` |
| `lint:strict` exit code | 1 | 0 | 직접 |
| 최대 소스 파일 줄 수 | 916 | ≤ 500 | `wc -l` |
| TypeScript errors | 0 | 0 | `tsc --noEmit` |
| Circular dependencies | unknown | 0 | `madge --circular` |
| Test pass rate | 현재 | 100% 유지 | `test:ci` |
| Bundle size | 현재 | +2% 이내 | build manifest |
| 시각 회귀 | N/A | diff < 1% | Playwright screenshot |

---

## 13. Risks & Open Questions

| Topic | Risk | Mitigation/Action |
|-------|------|-------------------|
| shadcn sidebar | 분리하면 upstream 업데이트 차단 | 원본 확인 후 override 우선 |
| GraphQL schema 분리 | 병합 순서 버그 | template literal + introspection 비교 |
| profile-tabs.tsx (916줄) | 가장 큰 파일, 분리 난이도 높음 | Tab별 독립 파일 + dynamic import 고려 |
| Server/Client 경계 | 추출 중 'use client' 누락 | 각 파일 상단 확인, E2E로 검증 |
| Next.js route export (force-dynamic 등) | 이동 시 누락 가능 | page.tsx에서만 export, `_components/*`에는 미배치 |

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-22 | Initial Cycle #2 design — 파일별 분리 맵, barrel 규칙, Server/Client 경계, 25+ commit plan | jhlim725 |

---
template: design
version: 1.2
feature: warning-cleanup
date: 2026-04-22
author: jhlim725
project: ASCA (my-v0-project)
version_project: 0.1.0
---

# warning-cleanup Design Document

> **Summary**: ESLint warning 182건을 제거하기 위한 단계별 기술 설계 — ESLint override, structuredLogger 치환 맵, 파일 분리 맵, hooks 수정 가이드
>
> **Project**: ASCA (my-v0-project)
> **Version**: 0.1.0
> **Author**: jhlim725
> **Date**: 2026-04-22
> **Status**: Draft
> **Planning Doc**: [warning-cleanup.plan.md](../../01-plan/features/warning-cleanup.plan.md)

### Pipeline References

| Phase | Document | Status |
|-------|----------|--------|
| Phase 1 | Schema Definition | N/A (유지보수 작업) |
| Phase 2 | Coding Conventions | 부분 적용 — 본 문서에서 정의 |
| Phase 3 | Mockup | N/A |
| Phase 4 | API Spec | N/A |

---

## 1. Overview

### 1.1 Design Goals

- `npm run lint:strict` (max-warnings 0) 통과
- 기존 동작 100% 유지 (behavioral 변경 금지)
- 코드 가독성·모듈성 향상 (Single Responsibility)
- ESLint override를 활용한 현실적 정책 확립 (테스트/스크립트/생성 파일 예외)

### 1.2 Design Principles

- **Zero-behavior-change**: 로거 치환·파일 분리 시 외부 동작 동일
- **Import stability**: 분리된 파일은 `index.ts` re-export로 기존 import 경로 보존
- **Incremental**: 단계별 커밋 (lint diff 추적 가능)
- **Convention first**: 1단계에서 ESLint override를 먼저 확정해 작업 범위 축소

---

## 2. Architecture

### 2.1 Cleanup Flow Diagram

```
┌───────────────────────────────────────────────────────────┐
│                     Cleanup Pipeline                       │
└───────────────────────────────────────────────────────────┘

Stage 1: ESLint override
  │
  ▼
Stage 2: console → structuredLogger
  │
  ├──▶ lib/logging/* (자체 로거, eslint-disable)
  ├──▶ lib/realtime/*
  ├──▶ lib/services/*
  └──▶ lib/middleware/*, lib/optimization/*
  │
  ▼
Stage 3: 타입 파일 분리 (Domain layer)
  │
  ├──▶ lib/types/gallery.ts → gallery/
  └──▶ lib/types/membership.ts → membership/
  │
  ▼
Stage 4: 서비스/스키마 분리 (Infrastructure)
  │
  ├──▶ lib/services/image-service.ts → image/
  ├──▶ lib/api/membership.ts → membership/
  ├──▶ lib/graphql/schema.ts → schema/
  └──▶ lib/icons.ts → icons/
  │
  ▼
Stage 5: 페이지/컴포넌트 추출 (Presentation)
  │
  ├──▶ app/**/page.tsx → app/**/_components/
  └──▶ components/gallery, cultural 세분화
  │
  ▼
Stage 6: React hooks deps 수정
  │
  ▼
Stage 7: 최종 검증 (lint:strict + type-check + build + test)
```

### 2.2 Data Flow (로거 치환 예시)

```
Before: console.error('failed', err)

After:  import { error } from '@/lib/logging';
        error('failed', { error: err })
```

### 2.3 Dependencies

| Component | Depends On | Purpose |
|-----------|-----------|---------|
| 치환 대상 모듈 | `lib/logging` (structured-logger) | 일관된 로깅 파이프라인 |
| 분리된 타입 파일 | 없음 (Domain 독립) | 순환 참조 방지 |
| 분리된 서비스 파일 | `lib/types/*`, `lib/db/*` | 기존 의존성 유지 |
| ESLint override | `.eslintrc.json` | 경로별 규칙 완화 |

---

## 3. Data Model

### 3.1 ESLint Configuration

```typescript
// .eslintrc.json 변경 후
{
  "extends": ["next/core-web-vitals"],
  "rules": {
    "no-console": "warn",
    "react-hooks/exhaustive-deps": "warn",
    "prefer-const": "error",
    "no-var": "error",
    "max-lines": ["warn", { "max": 500, "skipBlankLines": true, "skipComments": true }]
  },
  "overrides": [
    {
      "files": [
        "app/admin/**/*.tsx",
        "app/admin/**/*.ts"
      ],
      "rules": {
        "no-restricted-imports": [
          "error",
          {
            "patterns": [
              "**/app/profile/membership/_components/*",
              "**/components/gallery/dashboard/*"
            ]
          }
        ]
      }
    },
    {
      "files": ["**/__tests__/**/*", "**/*.test.ts", "**/*.test.tsx", "e2e/**/*"],
      "rules": {
        "max-lines": "off",
        "no-console": "off"
      }
    },
    {
      "files": ["scripts/**/*", "tools/**/*", "ops/**/*"],
      "rules": {
        "no-console": "off",
        "max-lines": "off"
      }
    },
    {
      "files": ["lib/logging/**/*"],
      "rules": {
        "no-console": "off"
      }
    },
    {
      "files": ["lib/db/schema.ts", "lib/db/schema-pg.ts"],
      "rules": {
        "max-lines": "off"
      }
    }
  ]
}
```

### 3.2 Logger Replacement Map

| 현재 | 치환 후 | 비고 |
|------|---------|------|
| `console.log(msg)` | `info(msg)` | log → info |
| `console.log(msg, ctx)` | `info(msg, ctx)` | context object 유지 |
| `console.warn(msg, ...)` | `warn(msg, ctx)` | |
| `console.error(msg, err)` | `error(msg, { error: err })` | error는 context로 |
| `console.debug(msg, ...)` | `debug(msg, ctx)` | |
| `console.info(msg, ...)` | `info(msg, ctx)` | |

### 3.3 Import Pattern

```typescript
// Before
console.error('Realtime connection failed', err);

// After
import { error } from '@/lib/logging';
error('Realtime connection failed', { error: err });
```

---

## 4. File Split Map

### 4.1 Stage 3 — Types Split

#### `lib/types/gallery.ts` (710줄) → `lib/types/gallery/`

```
lib/types/gallery/
├── index.ts              # re-export (기존 import 경로 보존)
├── artwork.ts            # Artwork, ArtworkMeta, ArtworkCategory
├── image.ts              # GalleryImage, ImageVariant, ImageMetadata
├── viewer.ts             # ZoomableViewer, StrokeAnimation 관련
├── comparison.ts         # ArtworkComparison 관련
└── filters.ts            # Gallery filter/sort types
```

#### `lib/types/membership.ts` (597줄) → `lib/types/membership/`

```
lib/types/membership/
├── index.ts
├── member.ts             # Member, MemberProfile
├── application.ts        # Application, ApplicationStatus
├── subscription.ts       # Subscription, Plan
├── benefits.ts           # Benefits, Privileges
└── audit.ts              # Audit log types
```

### 4.2 Stage 4 — Services/Schema Split

#### `lib/services/image-service.ts` (687줄) → `lib/services/image/`

```
lib/services/image/
├── index.ts              # 기존 ImageService 클래스 또는 barrel
├── upload.ts             # uploadImage, getUploadUrl
├── transform.ts          # resizeImage, cropImage, formatConversion
├── validation.ts         # validateImage, validateMimeType
├── storage.ts            # S3/Supabase Storage 연동
└── metadata.ts           # EXIF, dimensions 추출
```

#### `lib/api/membership.ts` (780줄 예상) → `lib/api/membership/`

```
lib/api/membership/
├── index.ts
├── applications.ts       # application CRUD
├── benefits.ts
├── subscriptions.ts
└── admin.ts              # 관리자 전용 operations
```

#### `lib/graphql/schema.ts` → `lib/graphql/schema/`

```
lib/graphql/schema/
├── index.ts              # gql 문자열 병합 후 export
├── user.graphql.ts
├── artwork.graphql.ts
├── exhibition.graphql.ts
├── event.graphql.ts
└── notice.graphql.ts
```

#### `lib/icons.ts` → `lib/icons/`

```
lib/icons/
├── index.ts              # 모든 아이콘 re-export
├── social.ts
├── navigation.ts
├── action.ts
└── domain.ts             # 도메인 특화(서예 등)
```

### 4.3 Stage 5 — Page/Component Extraction

#### 페이지 컴포넌트 추출 패턴

```
Before:
  app/artists/page.tsx (900+ lines, mix of state/UI/logic)

After:
  app/artists/
    ├── page.tsx          # < 200 lines (data fetching + layout)
    └── _components/
        ├── ArtistsHero.tsx
        ├── ArtistsFilter.tsx
        ├── ArtistsGrid.tsx
        ├── ArtistsCard.tsx
        └── ArtistsPagination.tsx
```

적용 대상:
- `app/artists/page.tsx`
- `app/artworks/[id]/page.tsx`
- `app/artworks/genre/[genre]/page.tsx`
- `app/awards/[year]/page.tsx`
- `app/events/page.tsx`, `app/events/[id]/page.tsx`
- `app/exhibitions/page.tsx`, `app/exhibitions/[id]/page.tsx`
- `app/history/page.tsx`
- `app/programs/cultural-exchange/page.tsx`
- `app/articles-of-incorporation-and-bylaws/_components/bylaws-content.tsx`
- `app/profile/membership/_components/profile-tabs.tsx`
- `app/academy/_components/sac-academy.tsx`

#### 대형 컴포넌트 분리

```
components/gallery/GalleryGrid.tsx (700+)
  → GalleryGrid.tsx + GalleryGridItem.tsx + useGalleryGrid.ts

components/gallery/ArtworkComparison.tsx
  → ArtworkComparison.tsx + ComparisonPanel.tsx + useComparison.ts

components/gallery/StrokeAnimationPlayer.tsx
  → StrokeAnimationPlayer.tsx + animation-engine.ts + controls.tsx

components/gallery/ZoomableImageViewer.tsx
  → ZoomableImageViewer.tsx + zoom-controls.tsx + usePanZoom.ts

components/cultural/CulturalAccessibility.tsx
  → CulturalAccessibility.tsx + a11y-panel.tsx

components/cultural/CulturalCalendar.tsx
  → CulturalCalendar.tsx + calendar-view.tsx + calendar-event.tsx

components/cultural/LearningHub.tsx
  → LearningHub.tsx + hub-section.tsx + hub-card.tsx

components/layout/layout-footer.tsx
  → layout-footer.tsx + footer-nav.tsx + footer-social.tsx

components/ui/sidebar.tsx
  → sidebar.tsx + sidebar-group.tsx + sidebar-item.tsx (shadcn 원본이면 제외)
```

---

## 5. UI/UX Design

UI 동작 변경 없음 — 파일 리팩터링만 수행. 스토리북/E2E 스모크로 시각 회귀 검증.

### 5.1 Visual Regression Breakpoints

```
320 / 768 / 1024 / 1440
```

각 페이지당:
- 컴포넌트 추출 전/후 스크린샷 비교

### 5.2 Component List (예시 — artists 페이지)

| Component | Location | Responsibility |
|-----------|----------|----------------|
| ArtistsPage | `app/artists/page.tsx` | 데이터 fetching + layout |
| ArtistsHero | `app/artists/_components/ArtistsHero.tsx` | 상단 히어로 섹션 |
| ArtistsFilter | `app/artists/_components/ArtistsFilter.tsx` | 필터 UI + URL state |
| ArtistsGrid | `app/artists/_components/ArtistsGrid.tsx` | 리스트 렌더링 |
| ArtistsCard | `app/artists/_components/ArtistsCard.tsx` | 개별 카드 |

---

## 6. React Hooks Fix Design

### 6.1 exhaustive-deps 수정 패턴

#### Case 1: `app/admin/contests/[id]/applications/page.tsx:99`, `edit/page.tsx:66`, `page.tsx:95` — clerkUser 의존성

```typescript
// Before
useEffect(() => {
  if (!clerkUser) return;
  fetchData();
}, []);

// After — option A: 의존성 추가 + 가드
useEffect(() => {
  if (!clerkUser) return;
  fetchData();
}, [clerkUser]);

// After — option B: 의도적 1회 실행일 경우
useEffect(() => {
  if (!clerkUser) return;
  fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps — clerkUser 초기 로드 후 1회만 실행
}, []);
```

선택 기준: `clerkUser` 변경 시 재호출되어야 하면 A, 초기 1회면 B. 본 프로젝트는 admin 페이지 특성상 **A** 선호.

#### Case 2: `components/ui/image-uploader.tsx:84` — validateFile 의존성

```typescript
// Before
const handleDrop = useCallback((files) => {
  validateFile(files[0]);
  ...
}, [onUpload]);

// After
const validateFile = useCallback((file: File) => {
  ...
}, [maxSize, allowedTypes]);  // validateFile 자체도 useCallback으로 stable

const handleDrop = useCallback((files) => {
  validateFile(files[0]);
  ...
}, [onUpload, validateFile]);
```

### 6.2 img-element 수정

```typescript
// components/gallery/SocialShare.tsx:139
// Before
<img src={previewUrl} alt="preview" />

// After
import Image from 'next/image';
<Image src={previewUrl} alt="preview" width={200} height={200} />
```

### 6.3 anonymous-default-export 수정

```typescript
// drizzle.config.ts:4
// Before
export default {
  schema: './lib/db/schema.ts',
  ...
};

// After
import type { Config } from 'drizzle-kit';

const config: Config = {
  schema: './lib/db/schema.ts',
  ...
};

export default config;
```

---

## 7. Security Considerations

- [x] 로거 치환 시 민감 데이터 노출 금지 (PII, 토큰) — 기존 console도 마찬가지
- [x] ESLint override 범위가 production 코드로 확대되지 않도록 제한
- [x] 외부 API 호출부에 console 남기지 않음 (이미 structuredLogger로 유도)

---

## 8. Test Plan

### 8.1 Test Scope

| Type | Target | Tool |
|------|--------|------|
| Type Check | 전체 | `tsc --noEmit` |
| Unit Test | 기존 테스트 전체 회귀 | Jest |
| E2E | 주요 사용자 흐름 | Playwright (test:e2e:ci) |
| Lint | max-warnings 0 | `lint:strict` |
| Build | production build | `next build` |

### 8.2 Test Cases

- [ ] Happy path: 기존 Jest 테스트 100% 통과
- [ ] Type Safety: 분리된 타입 파일에서 순환 참조 없음
- [ ] Import 호환성: 기존 `import { X } from '@/lib/types/gallery'` 경로 유지
- [ ] Logger output: structuredLogger 포맷으로 로그 생성 확인 (샘플 3건)
- [ ] Build size: `.next/build-manifest.json` 크기 증가 5% 이내
- [ ] E2E: 갤러리, 전시, 이벤트, 로그인, 프로필 페이지 스모크

### 8.3 Regression Gate

각 Stage 종료 시:
```bash
npm run type-check && npm run lint && npm run test:ci
```

---

## 9. Clean Architecture

### 9.1 Layer Structure (본 작업 영향 영역)

| Layer | Responsibility | Location | Stage |
|-------|---------------|----------|-------|
| Presentation | UI, pages, components | `app/`, `components/` | Stage 5 |
| Application | Services | `lib/services/` | Stage 4 |
| Domain | Types | `lib/types/` | Stage 3 |
| Infrastructure | API, DB, logging | `lib/api/`, `lib/db/`, `lib/logging/` | Stage 2, 4 |

### 9.2 Dependency Rules

```
Presentation ──→ Application ──→ Domain ←── Infrastructure
                      │
                      └──→ Infrastructure
```

본 작업은 레이어 경계 **변경 없음** — 각 파일이 속한 레이어 내에서 분리만 수행.

### 9.3 Import Path Preservation

모든 분리 작업은 `index.ts` barrel 파일로 기존 import 경로 유지:

```typescript
// Before (외부 호출자)
import { Artwork } from '@/lib/types/gallery';

// After split (호출자 변경 불필요)
import { Artwork } from '@/lib/types/gallery';
// ↑ 이 import는 lib/types/gallery/index.ts에서 artwork.ts를 re-export
```

---

## 10. Coding Convention Reference

### 10.1 Naming Conventions

| Target | Rule | 본 작업 적용 |
|--------|------|--------------|
| 분리된 타입 파일 | camelCase.ts | `artwork.ts`, `subscription.ts` |
| 분리된 서비스 파일 | camelCase.ts | `upload.ts`, `transform.ts` |
| 추출된 컴포넌트 | PascalCase.tsx | `ArtistsGrid.tsx`, `GalleryGridItem.tsx` |
| 추출된 훅 | `use` 접두사 | `useGalleryGrid.ts`, `usePanZoom.ts` |
| 폴더명 | kebab-case / 기능명 | `_components/`, `gallery/` |

### 10.2 Import Order (유지)

```typescript
// 1. External
import { useState } from 'react';

// 2. Internal absolute
import { Button } from '@/components/ui';
import { info, error } from '@/lib/logging';

// 3. Relative
import { GalleryGridItem } from './GalleryGridItem';

// 4. Types
import type { Artwork } from '@/lib/types/gallery';
```

### 10.3 This Feature's Conventions

| Item | Convention |
|------|-----------|
| Logger | `import { info, warn, error } from '@/lib/logging'` 만 사용 |
| Barrel export | 분리된 폴더는 `index.ts`에서 re-export |
| eslint-disable | 한 줄 범위로 제한 + 사유 주석 필수 |
| 파일 크기 | 목표 300줄, 최대 500줄 |
| Feature flag | 없음 (backward-compat 불필요) |

---

## 11. Implementation Guide

### 11.1 File Structure After Cleanup

```
lib/
├── logging/              # 기존 유지
├── types/
│   ├── gallery/          # NEW
│   └── membership/       # NEW
├── services/
│   └── image/            # NEW (from image-service.ts)
├── api/
│   └── membership/       # NEW
├── graphql/
│   └── schema/           # NEW
└── icons/                # NEW (from icons.ts)

app/
├── artists/
│   ├── page.tsx          # slimmed
│   └── _components/      # NEW
├── events/
│   └── _components/      # NEW
├── exhibitions/
│   └── _components/      # NEW
└── ...

components/
├── gallery/              # 내부 분리
└── cultural/             # 내부 분리

.eslintrc.json            # overrides 추가
```

### 11.2 Implementation Order

1. **Stage 1 — ESLint override (10분)**
   - `.eslintrc.json` overrides 추가
   - `npm run lint` 재측정 → 예상 warning 감소량 확인
   - Commit: `chore: ESLint override로 test/script 규칙 완화`

2. **Stage 2 — Logger 치환 (60분)**
   - `lib/realtime/**`, `lib/middleware/**`, `lib/services/**`, `lib/optimization/**` 순
   - 파일별 `console.*` → structuredLogger 일괄 치환
   - Commit: `refactor: console.* → structuredLogger 치환`

3. **Stage 3 — 타입 분리 (60분)**
   - `lib/types/gallery.ts` → `gallery/` 분할
   - `lib/types/membership.ts` → `membership/` 분할
   - `tsc --noEmit`로 순환 참조 검증
   - Commit: `refactor: gallery/membership 타입 도메인별 분리`

4. **Stage 4 — 서비스/스키마 분리 (90분)**
   - `lib/services/image-service.ts` → `image/`
   - `lib/api/membership.ts` → `membership/`
   - `lib/graphql/schema.ts` → `schema/`
   - `lib/icons.ts` → `icons/`
   - Commit: 각 분리마다 별도 커밋

5. **Stage 5 — 페이지/컴포넌트 추출 (120분)**
   - 페이지 우선순위: artists → events → exhibitions → artworks → awards → history → programs
   - 컴포넌트 우선순위: gallery → cultural → layout → ui
   - Commit: 페이지/컴포넌트 단위로 분리

6. **Stage 6 — React hooks 수정 (30분)**
   - 4건 exhaustive-deps
   - 1건 img-element (`next/image`)
   - 1건 anonymous-default-export
   - Commit: `fix: React hooks deps 및 img-element 수정`

7. **Stage 7 — 최종 검증 (20분)**
   - `npm run lint:strict` → 0 warnings
   - `npm run type-check`
   - `npm run build`
   - `npm run test:ci`
   - Commit: 없음 (검증만)

### 11.3 Rollback Strategy

- 각 Stage는 독립 커밋 → 문제 발생 시 해당 Stage만 revert
- `git bisect`로 회귀 원인 추적 가능
- Stage 5(페이지 추출)는 페이지 단위로 세분화 커밋

### 11.4 Commit Message Template

```
refactor({stage}): {description}

- {change 1}
- {change 2}

Warning delta: {before} → {after}
```

---

## 12. Success Metrics

| Metric | Before | Target | Measurement |
|--------|--------|--------|-------------|
| ESLint warnings | 182 | 0 | `npm run lint` |
| Max file lines (source) | 916 | ≤ 500 | `wc -l` |
| TypeScript errors | 0 | 0 (유지) | `tsc --noEmit` |
| Test pass rate | 현재 | 100% 유지 | `test:ci` |
| Build time | ~23s | +5% 이내 | `next build` |
| Bundle size | 현재 | +2% 이내 | `.next/build-manifest.json` |

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-22 | Initial design — 7-stage 실행 계획, 파일 분리 맵, logger 치환 맵 | jhlim725 |

---
template: plan
version: 1.2
feature: warning-cleanup-cycle-2
date: 2026-04-22
author: jhlim725
project: ASCA (my-v0-project)
version_project: 0.1.0
parent_cycle: warning-cleanup (Cycle #1, completed-partial)
---

# warning-cleanup-cycle-2 Planning Document

> **Summary**: 남은 30 `max-lines` warnings 제거 — Stage 3/4/5/7 수행.
> lib/types, lib/services, lib/api, lib/graphql, lib/icons 분리 + 앱
> 페이지/컴포넌트 `_components/` 추출 + 최종 검증
>
> **Project**: ASCA (my-v0-project) **Version**: 0.1.0 **Author**: jhlim725
> **Date**: 2026-04-22 **Status**: Draft **Parent Cycle**:
> [warning-cleanup.report.md](../../04-report/features/warning-cleanup.report.md)
> — Cycle #1 83.5% 완료

---

## 1. Overview

### 1.1 Purpose

Cycle #1에서 deferred된 구조적 리팩터링을 완료하여 `lint:strict`(max-warnings 0)
최종 통과 달성. 대형 파일 30개를 500줄 이하로 분리하고 전체 검증 파이프라인을
통과시킨다.

### 1.2 Background

- Cycle #1에서 182 → 30 warnings (-83.5%) 달성, 모두
  `no-console`/`hooks`/`img`/`anonymous` 제거
- 남은 30건은 전부 `max-lines` — 구조적 파일 분리가 필요
- 기계적 치환과 달리 도메인 이해가 요구되는 작업이라 Cycle #1에서 분리 실행
- Cycle #1의 Lessons Learned 반영:
  - Stage 크기 상한 1시간 기준
  - logger API 계약을 Design에서 사전 검증
  - 대규모 기계적 작업은 codemod 우선 검토

### 1.3 Related Documents

- Parent Cycle Report: `docs/04-report/features/warning-cleanup.report.md`
- Parent Analysis: `docs/03-analysis/warning-cleanup.analysis.md`
- Parent Design: `docs/02-design/features/warning-cleanup.design.md` (Stage
  3/4/5 원 설계 보존)

---

## 2. Scope

### 2.1 In Scope

- [ ] **Stage 3** — Types 분리 (2파일 → 폴더)
  - [ ] `lib/types/gallery.ts` (710) →
        `lib/types/gallery/{artwork,image,viewer,comparison,filters,index}.ts`
  - [ ] `lib/types/membership.ts` (597) →
        `lib/types/membership/{member,application,subscription,benefits,audit,index}.ts`
- [ ] **Stage 4** — Services/Schema 분리 (4파일 → 폴더)
  - [ ] `lib/services/image-service.ts` (687) →
        `lib/services/image/{upload,transform,validation,storage,metadata,index}.ts`
  - [ ] `lib/api/membership.ts` (515) →
        `lib/api/membership/{applications,benefits,subscriptions,admin,index}.ts`
  - [ ] `lib/graphql/schema.ts` (783) →
        `lib/graphql/schema/{user,artwork,exhibition,event,notice,member,index}.ts`
  - [ ] `lib/icons.ts` (512) →
        `lib/icons/{social,navigation,action,domain,index}.ts`
- [ ] **Stage 5a** — Page 컴포넌트 추출 (10 페이지)
  - [ ] `app/artists/page.tsx` (755) → `_components/`
  - [ ] `app/artworks/[id]/page.tsx` (890) → `_components/`
  - [ ] `app/artworks/genre/[genre]/page.tsx` (517)
  - [ ] `app/artworks/upload/artwork-upload-client.tsx` (514)
  - [ ] `app/awards/[year]/page.tsx` (786)
  - [ ] `app/events/page.tsx` (510), `app/events/[id]/page.tsx` (557)
  - [ ] `app/exhibitions/page.tsx` (709), `app/exhibitions/[id]/page.tsx` (561)
  - [ ] `app/history/page.tsx` (527)
  - [ ] `app/programs/cultural-exchange/page.tsx` (686)
  - [ ] `app/admin/membership/page.tsx` (854)
  - [ ] `app/articles-of-incorporation-and-bylaws/_components/bylaws-content.tsx`
        (745)
  - [ ] `app/profile/membership/_components/profile-tabs.tsx` (916) ← 최대 크기
  - [ ] `app/academy/_components/sac-academy.tsx` (572)
- [ ] **Stage 5b** — Component 세분화 (7 컴포넌트)
  - [ ] `components/gallery/*` (4): StrokeAnimationPlayer(741),
        ArtworkComparison(681), GalleryGrid(617), ZoomableImageViewer(555)
  - [ ] `components/cultural/*` (3): CulturalAccessibility(627),
        CulturalCalendar(611), LearningHub(527)
  - [ ] `components/layout/layout-footer.tsx` (501)
  - [ ] `components/ui/sidebar.tsx` (671) — shadcn 원본이면 `.eslintrc`
        override로 대체
- [ ] **Stage 7** — 최종 검증
  - [ ] `npm run lint:strict` → exit 0
  - [ ] `npm run type-check`
  - [ ] `npm run build`
  - [ ] `npm run test:ci`

### 2.2 Out of Scope

- 신규 기능, 비즈니스 로직 변경, API 시그니처 변경
- 테스트 신규 작성 (기존 테스트 회귀만 검증)
- UI/UX 변경, 시각적 출력 변경
- Performance 최적화 (별도 feature)
- `components/ui/sidebar.tsx`가 shadcn 원본일 경우 분리 작업 건너뛰고 override
  선택

---

## 3. Requirements

### 3.1 Functional Requirements

| ID    | Requirement                                                                       | Priority | Status  |
| ----- | --------------------------------------------------------------------------------- | -------- | ------- |
| FR-01 | `lib/types/gallery.ts` 도메인별 분리, `index.ts` barrel로 기존 import 호환성 유지 | High     | Pending |
| FR-02 | `lib/types/membership.ts` 분리 + barrel                                           | High     | Pending |
| FR-03 | `lib/services/image-service.ts` upload/transform/validation/storage/metadata 분리 | High     | Pending |
| FR-04 | `lib/api/membership.ts` 도메인별 분리                                             | High     | Pending |
| FR-05 | `lib/graphql/schema.ts` 도메인별 gql 파일 + 병합 export                           | Medium   | Pending |
| FR-06 | `lib/icons.ts` 카테고리별 분리                                                    | Medium   | Pending |
| FR-07 | `app/**/page.tsx` 섹션 컴포넌트 추출 (14개)                                       | Medium   | Pending |
| FR-08 | `components/gallery`, `components/cultural`, `layout/footer` 하위 분리 (7개)      | Medium   | Pending |
| FR-09 | `components/ui/sidebar.tsx` shadcn 원본 확인 후 override 또는 분리 결정           | Low      | Pending |
| FR-10 | 모든 분리 후 `lint:strict` + `type-check` + `build` + `test:ci` 통과              | High     | Pending |

### 3.2 Non-Functional Requirements

| Category             | Criteria                              | Measurement                         |
| -------------------- | ------------------------------------- | ----------------------------------- |
| Code Quality         | `npm run lint:strict` exit 0          | CI / 수동                           |
| Import Compatibility | 기존 외부 호출자 변경 0               | `grep` 기존 import 경로 그대로 동작 |
| Build                | `next build` 성공, 번들 크기 +2% 이내 | `.next/build-manifest.json` 비교    |
| Regression           | 기존 jest + playwright 100% 통과      | `test:ci`, `test:e2e:ci`            |
| Visual Regression    | 주요 페이지 스크린샷 동등             | (선택) Playwright screenshot        |
| Performance          | LCP/INP 회귀 없음                     | (선택) Lighthouse 비교              |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] `npm run lint` → 0 warnings
- [ ] `npm run lint:strict` → exit 0
- [ ] `npm run type-check` → 0 errors
- [ ] `npm run test:ci` → 기존 통과 테스트 유지
- [ ] `npm run build` → 성공
- [ ] 모든 분리된 파일 500줄 이하 (또는 명시적 override 정당화)
- [ ] PDCA Report 작성 (Cycle #2)

### 4.2 Quality Criteria

- [ ] 분리된 모듈의 기능별 응집도 유지 (단순 line 맞추기 금지)
- [ ] 도메인 용어 일관 (`artwork` / `artist` / `member` etc.)
- [ ] barrel `index.ts`는 타입 re-export만 포함 (구현 로직 금지)
- [ ] 추출된 `_components/*`는 Server/Client 경계 명확
- [ ] 분리 후 순환 의존성 0 (`tsc --noEmit` + `madge` 체크 권장)
- [ ] Cycle #1과 동일하게 Stage별 독립 커밋

---

## 5. Risks and Mitigation

| Risk                                                      | Impact | Likelihood | Mitigation                                                     |
| --------------------------------------------------------- | ------ | ---------- | -------------------------------------------------------------- |
| 타입 분리 후 순환 참조                                    | High   | Medium     | 분리 전 의존 그래프 작성, Domain 순수 유지                     |
| `lib/graphql/schema.ts` 분리 시 gql 병합 순서 이슈        | Medium | Medium     | `mergeTypeDefs`(graphql-tools) 사용 또는 template literal 조합 |
| 페이지 추출 중 'use client' 경계 훼손                     | High   | Low        | Server component에 client child 주입 패턴 준수                 |
| shadcn `sidebar.tsx` 임의 분리로 upstream 업데이트 어려움 | Medium | High       | 원본 확인 후 override 우선                                     |
| 추출로 인한 hydration mismatch                            | High   | Low        | E2E 스모크로 주요 페이지 검증                                  |
| 기존 export 경로 이름 충돌                                | Medium | Low        | barrel `index.ts`에서 일관 re-export, `grep`으로 사전 검증     |
| Next.js `force-dynamic` / `revalidate` 옵션 분리 시 누락  | High   | Medium     | page.tsx 최상단 export 유지, 추출은 sub-component만            |

---

## 6. Architecture Considerations

### 6.1 Project Level

Dynamic — 기존 레벨 유지. 본 작업은 구조 재배치만.

### 6.2 Key Decisions

| Decision         | Options                          | Selected                               | Rationale                |
| ---------------- | -------------------------------- | -------------------------------------- | ------------------------ |
| Types 분리 전략  | 파일별 유지 / 도메인 폴더 / flat | **도메인 폴더**                        | Design 문서 일치, 확장성 |
| Barrel export    | 없음 / 필수                      | **필수 `index.ts`**                    | 호출자 호환성            |
| Schema 병합      | 수동 / graphql-tools             | **수동 template literal**              | 의존성 추가 최소화       |
| shadcn sidebar   | 분리 / override                  | **override 우선**                      | upstream 보호            |
| 페이지 추출 위치 | 인라인 / `_components/`          | **`_components/`**                     | Next.js App Router 관용  |
| Commit 단위      | Stage별 / 파일별                 | **파일별 (Stage 5)** + Stage별 (3/4/7) | Stage 5는 커서           |

### 6.3 Clean Architecture

```
After Cycle #2:
lib/
├── types/
│   ├── gallery/{artwork,image,viewer,comparison,filters,index}.ts
│   └── membership/{member,application,subscription,benefits,audit,index}.ts
├── services/
│   └── image/{upload,transform,validation,storage,metadata,index}.ts
├── api/
│   └── membership/{applications,benefits,subscriptions,admin,index}.ts
├── graphql/
│   └── schema/{user,artwork,exhibition,event,notice,member,index}.ts
└── icons/{social,navigation,action,domain,index}.ts

app/
├── artists/{page.tsx, _components/*}
├── artworks/{page.tsx, [id]/{page.tsx, _components/*}, genre/[genre]/*}
├── events/{page.tsx, _components/*, [id]/*}
├── exhibitions/{...}
├── awards/[year]/{page.tsx, _components/*}
├── history/{page.tsx, _components/*}
├── programs/cultural-exchange/{page.tsx, _components/*}
├── admin/membership/{page.tsx, _components/*}
├── articles-of-incorporation-and-bylaws/_components/bylaws-content.tsx → 분할
├── profile/membership/_components/profile-tabs.tsx → 분할
└── academy/_components/sac-academy.tsx → 분할

components/
├── gallery/ → 하위 컴포넌트 분리 (4파일)
├── cultural/ → 하위 컴포넌트 분리 (3파일)
├── layout/layout-footer.tsx → footer-nav + footer-social
└── ui/sidebar.tsx → override (shadcn 원본) 또는 분리
```

---

## 7. Convention Prerequisites

### 7.1 Existing

- [x] `CLAUDE.md`, `.eslintrc.json`, `.prettierrc`, `tsconfig.json`
- [x] Cycle #1 `.eslintrc.json` override (tests/scripts/logging/env/seed)

### 7.2 New Conventions for Cycle #2

| Category           | Rule                                                     | Priority |
| ------------------ | -------------------------------------------------------- | -------- |
| Barrel export      | 분리된 폴더는 반드시 `index.ts`에서 전체 re-export       | High     |
| 파일 크기          | 신규 파일은 300줄 목표, 500줄 상한                       | High     |
| 컴포넌트 추출 경로 | Next.js 페이지 추출은 `_components/` (kebab-case 폴더)   | High     |
| 훅 추출            | 페이지별 훅은 `_hooks/` 또는 `_components/use*.ts`       | Medium   |
| Server/Client 경계 | 추출된 sub-component는 기본 Server, 필요 시 'use client' | High     |
| Storybook          | (선택) 추출된 `_components/*`에 대해 basic story 추가    | Low      |

### 7.3 Env Vars

변경 없음.

---

## 8. Next Steps

1. [ ] `/pdca design warning-cleanup-cycle-2` — 파일별 상세 분리 맵,
       sub-component API, 병합 순서 정의
2. [ ] (선택) `madge` 설치해 의존 그래프 사전 점검
3. [ ] `/pdca do warning-cleanup-cycle-2` — Stage 3부터 순차 실행
4. [ ] 각 Stage별 type-check + lint 재측정
5. [ ] `/pdca analyze warning-cleanup-cycle-2` — 최종 Gap 분석
6. [ ] (필요 시) `/pdca iterate`
7. [ ] `/pdca report warning-cleanup-cycle-2` — 최종 완료 보고서

---

## 9. Execution Plan

| Stage | 작업                                                                                                                        | 파일 수            | 예상 시간 | Warning 제거 |
| ----- | --------------------------------------------------------------------------------------------------------------------------- | ------------------ | --------- | ------------ |
| 3     | Types 분리 (gallery, membership)                                                                                            | 2 → ~12            | 90분      | -2           |
| 4a    | `image-service.ts` 분리                                                                                                     | 1 → ~6             | 60분      | -1           |
| 4b    | `api/membership.ts` 분리                                                                                                    | 1 → ~5             | 45분      | -1           |
| 4c    | `graphql/schema.ts` 분리                                                                                                    | 1 → ~7             | 60분      | -1           |
| 4d    | `icons.ts` 분리                                                                                                             | 1 → ~5             | 30분      | -1           |
| 5a-1  | 앱 페이지 추출 (7개 first batch: artists, artworks, awards, events, exhibitions)                                            | ~7 → +30           | 180분     | -7           |
| 5a-2  | 나머지 페이지 (7개: history, programs, admin/membership, bylaws, profile-tabs, sac-academy, artwork-upload, artworks/genre) | ~7 → +25           | 120분     | -7           |
| 5b-1  | `components/gallery/*` 분리                                                                                                 | 4 → +12            | 90분      | -4           |
| 5b-2  | `components/cultural/*` 분리                                                                                                | 3 → +9             | 60분      | -3           |
| 5b-3  | `components/layout/layout-footer` + sidebar 결정                                                                            | 2 → +4 or override | 30분      | -2           |
| 7     | 최종 검증 (`lint:strict` + build + test:ci)                                                                                 | -                  | 30분      | 0            |

**총 예상**: ~13시간, **목표**: 30 → 0 warnings

**권장 세션 분할**:

- Session A: Stage 3 + 4a + 4b (3.25시간)
- Session B: Stage 4c + 4d + 5a-1 (4.5시간)
- Session C: Stage 5a-2 + 5b (5시간)
- Session D: Stage 7 + 보고서 (1시간)

---

## 10. Dependencies & Prerequisites

### 10.1 From Cycle #1

- [x] ESLint override 적용됨 — tests/scripts 제외 상태
- [x] structuredLogger 통합 완료
- [x] Type-check clean baseline
- [x] 4 commits + 1 report commit — `f610369b`가 baseline

### 10.2 Tools

- [ ] (선택) `madge` — 순환 의존성 탐지: `npx madge --circular <entry>`
- [ ] `jscodeshift` (선택) — Stage 3/4의 export 자동 이동
- [x] 기존 `npm run` 스크립트 전부 활용

---

## Version History

| Version | Date       | Changes                                                           | Author   |
| ------- | ---------- | ----------------------------------------------------------------- | -------- |
| 0.1     | 2026-04-22 | Initial Cycle #2 plan — Stage 3/4/5/7, 13시간 예상, 30→0 warnings | jhlim725 |

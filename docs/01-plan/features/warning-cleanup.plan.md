---
template: plan
version: 1.2
feature: warning-cleanup
date: 2026-04-22
author: jhlim725
project: ASCA (my-v0-project)
version_project: 0.1.0
---

# warning-cleanup Planning Document

> **Summary**: ESLint warning 182건 정리 — no-console 139건 + max-lines 37파일 + 기타 6건을 구조화해 제거
>
> **Project**: ASCA (my-v0-project)
> **Version**: 0.1.0
> **Author**: jhlim725
> **Date**: 2026-04-22
> **Status**: Draft

---

## 1. Overview

### 1.1 Purpose

`npm run lint`에서 보고되는 ESLint warning 182건을 제거해 `lint:strict`(max-warnings 0) 통과 상태를 만들고, 구조적으로 비대해진 파일을 모듈화해 유지보수성을 개선한다.

### 1.2 Background

- 현재 lint는 0 errors / 182 warnings로 빌드는 통과하지만 `pre-commit` 정책의 잠재적 리스크.
- `no-console` 139건이 로깅/realtime 모듈에 집중 — 이미 `structured-logger`가 존재하므로 이중 로깅 상태.
- 500줄 초과 파일 37개, 최대 916줄. 테스트 파일/스키마/i18n 타입/페이지 컴포넌트에 분포.
- 이전 세션(2026-04-21)에서 code_analysis 결과를 기반으로 도출된 정리 요구사항.

### 1.3 Related Documents

- 이전 배포: `docs/04-report/features/asca-deploy-2026-04-09.report.md`
- 전역 규칙: `~/.claude/rules/common/coding-style.md` (800줄 상한), `~/.claude/rules/web/patterns.md`
- 린트 설정: `.eslintrc.json`

---

## 2. Scope

### 2.1 In Scope

- [ ] `no-console` 139건 정리: `console.*` → `structuredLogger` 치환 또는 eslint-disable 주석으로 의도 명시
- [ ] `max-lines` 37개 파일 중 **소스 파일(lib, components, app)** 분리 — 500줄 이하로
- [ ] `react-hooks/exhaustive-deps` 4건 의존성 수정
- [ ] `import/no-anonymous-default-export` 1건 수정
- [ ] `@next/next/no-img-element` 1건 → `next/image` 치환
- [ ] `lint:strict` 통과 (max-warnings 0) 검증

### 2.2 Out of Scope

- 테스트 파일(`__tests__/*.test.ts`)의 `max-lines` — 테스트 특성상 관용; `.eslintrc` override 권장
- DB 스키마(`lib/db/schema.ts`, `schema-pg.ts`) 분할 — Drizzle 특성상 단일 파일이 관용적
- `scripts/*.ts`의 `no-console` — CLI 스크립트 특성상 관용
- 신규 기능 추가, 비즈니스 로직 변경, 리팩터링 목적의 API 시그니처 변경

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | `lib/realtime/*`, `lib/logging/*`, `lib/middleware/*`, `lib/services/*`의 `console.*` 호출을 `structuredLogger`로 치환 | High | Pending |
| FR-02 | `lib/services/image-service.ts` (687줄) 모듈 분리 — upload/transform/validation 별 파일로 | High | Pending |
| FR-03 | `lib/types/gallery.ts` (710줄), `lib/types/membership.ts` (597줄) 도메인별 서브파일로 분리 | High | Pending |
| FR-04 | `app/**/page.tsx` 중 700줄 초과 페이지(`artists`, `events`, `exhibitions` 등)의 섹션 컴포넌트 추출 | Medium | Pending |
| FR-05 | `components/gallery/*`, `components/cultural/*` 대형 컴포넌트 하위 컴포넌트 분리 | Medium | Pending |
| FR-06 | `react-hooks/exhaustive-deps` 4건 의존성 배열 수정 또는 안전한 useCallback/useMemo 도입 | High | Pending |
| FR-07 | `.eslintrc.json`에 테스트 파일/스크립트 override 추가(`max-lines`, `no-console` 완화) | Medium | Pending |
| FR-08 | `@next/next/no-img-element`, `import/no-anonymous-default-export` 각 1건 수정 | Low | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| Code Quality | `npm run lint:strict` exit 0 | CI / 수동 실행 |
| Build | `npm run build` 성공, 번들 크기 증가 없음 | `next build` output |
| Regression | 기존 테스트 100% 통과 | `npm run test:ci` |
| Performance | LCP, INP 회귀 없음 | Lighthouse 비교 |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] `npm run lint` → 0 errors, 0 warnings
- [ ] `npm run lint:strict` → exit 0
- [ ] `npm run type-check` → exit 0
- [ ] `npm run test:ci` → 기존 통과 테스트 모두 유지
- [ ] `npm run build` → 성공
- [ ] 변경된 대형 파일이 500줄 이하 (또는 명시적 override)

### 4.2 Quality Criteria

- [ ] 분리된 모듈은 기능별 응집도 유지 (단순 줄 수 맞추기 금지)
- [ ] `structuredLogger` 치환 시 log level 의미 보존 (info/warn/error 매핑)
- [ ] 테스트 커버리지 현 상태 유지 (하락 0%)
- [ ] PR diff 리뷰 가능 크기로 단계별 커밋

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| 로거 치환 중 기존 로그 포맷 변경 → 로그 파이프라인 파싱 실패 | Medium | Medium | `structuredLogger` 어댑터 레이어 확인, 샘플 로그 비교 테스트 |
| 대형 파일 분리 중 타입 순환 참조 발생 | High | Medium | `types/` 서브 디렉터리 설계 먼저 확정 후 이동, `tsc --noEmit`로 단계별 검증 |
| 컴포넌트 추출 중 hydration mismatch 발생 | High | Low | 'use client' 경계 유지, 스토리북/E2E로 스모크 테스트 |
| i18n 타입(4개 언어) 필드 분리 시 누락 | Medium | Medium | `grep -n "Cn\|Jp\|En"`로 필드 완전성 검증 후 커밋 |
| exhaustive-deps 수정이 무한 렌더 유발 | High | Low | 의존성 추가 전 안정화(`useCallback`/stable ref) 적용 |

---

## 6. Architecture Considerations

### 6.1 Project Level Selection

| Level | Characteristics | Recommended For | Selected |
|-------|-----------------|-----------------|:--------:|
| **Starter** | Simple structure | Static sites | ☐ |
| **Dynamic** | Feature-based modules, services layer | Web apps with backend, SaaS MVPs | ☑ |
| **Enterprise** | Strict layer separation, DI | High-traffic systems | ☐ |

ASCA는 이미 Dynamic 구조(`lib/services`, `lib/realtime`, `lib/graphql`)로 운영 중 — 본 작업도 해당 레이어 내부에서 모듈 세분화만 수행.

### 6.2 Key Architectural Decisions

| Decision | Options | Selected | Rationale |
|----------|---------|----------|-----------|
| Logger | console / structuredLogger / pino | **structuredLogger** | 이미 프로젝트에 구현·운영 중 |
| 파일 분리 방식 | 유지 / 도메인별 / 기능별 | **도메인별** | types/gallery → gallery/{artwork,image,viewer}.ts |
| Lint override | 전체 완화 / 경로별 override | **경로별 override** | 테스트·스크립트 특성 반영 |
| 컴포넌트 추출 | 인라인 / 로컬 `_components/` | **로컬 `_components/`** | 기존 패턴 따름 (`app/academy/_components`) |

### 6.3 Clean Architecture Approach

```
Dynamic Level 유지 — 파일 재배치만 수행

Before:
lib/types/gallery.ts (710줄)
lib/services/image-service.ts (687줄)

After:
lib/types/gallery/
  ├── index.ts        (re-export)
  ├── artwork.ts
  ├── image.ts
  └── viewer.ts
lib/services/image/
  ├── index.ts
  ├── upload.ts
  ├── transform.ts
  └── validation.ts
```

---

## 7. Convention Prerequisites

### 7.1 Existing Project Conventions

- [x] `CLAUDE.md` 존재 (`~/CLAUDE.md`, 프로젝트별 CLAUDE.md)
- [ ] `docs/01-plan/conventions.md` 미확인
- [x] `.eslintrc.json` 존재
- [x] `.prettierrc`, `.prettierignore` 존재
- [x] `tsconfig.json` 존재

### 7.2 Conventions to Define/Verify

| Category | Current State | To Define | Priority |
|----------|---------------|-----------|:--------:|
| 로깅 | structuredLogger 존재하나 혼용 | `console.*` 전면 금지 + 경로 override | High |
| 파일 크기 | 500줄 룰 / 전역 규칙은 800줄 | 소스 500, 테스트 1200, 스크립트 무제한 override | High |
| Import order | ESLint 기본 | 변경 없음 | Low |
| Env vars | `env.example` 존재 | 변경 없음 | - |
| Error handling | 혼재 | structuredLogger.error 통일 | Medium |

### 7.3 Environment Variables Needed

| Variable | Purpose | Scope | To Be Created |
|----------|---------|-------|:-------------:|
| (신규 변수 없음) | - | - | ☐ |

### 7.4 Pipeline Integration

본 작업은 9-phase Pipeline 밖의 유지보수 성격 — Phase 문서 미적용.

---

## 8. Next Steps

1. [ ] `/pdca design warning-cleanup` — Design 문서 작성 (파일별 분리 맵, 치환 규칙 테이블, override 패치)
2. [ ] Design 검토 및 승인
3. [ ] `/pdca do warning-cleanup` — 단계별 구현 (단계 1: eslint override → 단계 2: logger 치환 → 단계 3: 파일 분리 → 단계 4: exhaustive-deps)
4. [ ] `/pdca analyze warning-cleanup` — Gap 분석 (lint 0 warnings 달성 여부)
5. [ ] (필요 시) `/pdca iterate warning-cleanup`
6. [ ] `/pdca report warning-cleanup`

---

## 9. Execution Plan (구현 순서 제안)

| Stage | 작업 | 예상 영향 파일 | 예상 시간 |
|-------|------|---------------|-----------|
| 1 | `.eslintrc.json`에 테스트/스크립트 override 추가 | 1 | 10분 |
| 2 | `console.*` → `structuredLogger` 치환 | ~10 파일 | 60분 |
| 3 | `lib/types/gallery.ts`, `lib/types/membership.ts` 분리 | 2 → ~8 | 60분 |
| 4 | `lib/services/image-service.ts`, `lib/api/membership.ts` 분리 | 2 → ~6 | 60분 |
| 5 | `lib/graphql/schema.ts`, `lib/icons.ts` 분리 | 2 → ~6 | 45분 |
| 6 | `app/**/page.tsx` 섹션 추출 (artists, events, exhibitions, ...) | ~10 | 90분 |
| 7 | `components/gallery/*`, `components/cultural/*` 분리 | ~7 | 60분 |
| 8 | exhaustive-deps 4건 + img-element + anonymous-default 3건 | ~5 | 30분 |
| 9 | 최종 `lint:strict`, `type-check`, `build`, `test:ci` | - | 20분 |

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-22 | Initial draft — 182 warning 분류 및 9단계 실행 계획 | jhlim725 |

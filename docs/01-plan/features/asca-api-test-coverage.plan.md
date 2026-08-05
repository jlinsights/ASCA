# asca-api-test-coverage Planning Document

> **Summary**: API 라우트 49개 중 45개(92%)·lib 모듈 152개 중 134개(88%)가
> 미테스트인 커버리지 갭을 단계적으로 해소하는 **장기 로드맵**. 한 번의 사이클이
> 아니라 위험도 기반 3웨이브로 분할 실행한다.
>
> **Project**: ASCA **Author**: Claude (PDCA plan) **Date**: 2026-07-25
> **Status**: Backlog (미착수 — 착수 시 웨이브별 Design부터)

---

## 1. Overview

### 1.1 Purpose

전역 커버리지 7.82%(statements)의 실체는 "핵심 경로 집중, 나머지 공백"이다.
테스트 421개가 GraphQL·members·realtime 등 일부에 몰려 있고, mutation성 admin
라우트와 서비스 레이어 대부분이 무방비다. 회귀 위험이 높은 순서로 안전망을
넓힌다.

### 1.2 Background

- 출처: 2026-07-25 `/code_analysis` 유지보수성 차원(5.8/10) High 발견
- 미테스트 현황: API 라우트 45/49, lib 134/152, 컴포넌트 159/168
- 기존 자산: jest-infra-debt(2026-04) 인프라 5종 해결, TEST_ENV_DEFAULTS,
  `@jest-environment node` 패턴, jest-axe 스모크(9컴포넌트), Playwright E2E
  4파일
- 기존 격리 부채와 구분: realtime 4·repository 2·route 2 파일은 **작성됐으나
  격리**된 별도 부채(각자 사이클 존재) — 본 로드맵은 **미작성** 영역 대상

## 2. 3-Wave 로드맵

### Wave 1 — mutation성 API 라우트 (HIGH, ~1주 사이클 1개)

보안·데이터 변형 위험 최상위부터:

- [ ] W1-1 `app/api/secure/migration/*` (최근 변경, 파괴적 작업)
- [ ] W1-2 `app/api/admin/{metrics,logs,sync-academy}` (에러응답 표준화 회귀
      방지 포함 — 2026-07-25 수정분)
- [ ] W1-3 `app/api/cultural-exchange/applications` (사용자 입력 mutation)
- [ ] W1-4 `app/api/artworks`·`app/api/artists` (공개 read, limit 클램프 회귀
      방지 포함)
- 패턴: route handler 단위 테스트 (NextRequest mock + Clerk/DB mock은
  jest-infra-debt 자산 재사용). 라우트당 정상 1·검증실패 1·인증실패 1 최소
  3케이스

### Wave 2 — 서비스·레포지토리 레이어 (MEDIUM, ~1주 사이클 1개)

- [ ] W2-1 `lib/services/` 미테스트 서비스 (blog·image 계열 우선)
- [ ] W2-2 `lib/repositories/` 미테스트 레포지토리 — 단 base/member는 기존 격리
      부채 사이클과 중복 금지
- [ ] W2-3 `lib/api/validators.ts` 스키마 전수 (schema-enum-drift 교훈: source
      enum 바인딩 + it.each 회귀)

### Wave 3 — 컴포넌트 동작 테스트 (LOW, 선택)

- [ ] W3-1 폼·상태 로직 보유 컴포넌트만 선별 (renderHook+fakeTimers 패턴 재사용
      — gallery-cultural-bugfix 자산)
- [ ] W3-2 시각 위주 컴포넌트는 Playwright/E2E로 위임 (렌더 단위 테스트 지양 —
      전역 rules/web/testing 방침)

## 3. Out of Scope

- 기존 격리 부채 4종 해제 (realtime-jest-polyfill·repository-test-mock·
  sse-route-mock·route-auth-mock — 각자 사이클)
- 커버리지 임계값 상향 (regression-gate 원칙: floor는 별도 사이클에서 baseline
  재측정 후)
- E2E 신규 시나리오 (e2e-debt-roadmap 소관)

## 4. Success Criteria (웨이브별 산정)

- Wave 1 완료 시: API 라우트 테스트 4/49 → 12+/49, mutation 라우트 전부 커버
- Wave 2 완료 시: lib 커버리지 11% → 25%+
- 각 웨이브: test:ci GREEN 유지 + 신규 테스트가 실제 결함 검출력 보유
  (fail-injection 1회 이상 실증)

## 5. 착수 조건

이 문서는 백로그 계획이다. 착수 시 `/pdca design asca-api-test-coverage-w1`로
Wave 1을 독립 사이클화하고, 세션 Task #5를 해당 사이클로 승계한다.

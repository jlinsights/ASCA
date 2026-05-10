---
feature: jest-coverage-threshold-debt
date: 2026-05-10
phase: plan
parent_cycle: asca-test-suite-debt (PR #24, complete-with-split)
revision: α
status: draft
---

# Plan — jest-coverage-threshold-debt (rev α)

## §0. 컨텍스트

- `asca-test-suite-debt` 사이클 PR #24 CI 검증에서 발견.
- main + 모든 PR 의 `Tests` job 이 **`coverage threshold 70%` 미달** 로 exit 1.
  - 실측: statements 5.18%, branches 3.96%, lines 5.2%, functions 4.32%
  - Test Suites: 13 passed, Tests: 368 passed — **fail 은 coverage 만 원인**, test 자체 GREEN
- 70% 목표가 실현 불가능한 환경 (test 작성률 vs 코드베이스 규모 불균형). 정책 결정 필요.
- ⇒ 본 PR 과 무관한 **pre-existing coverage policy debt**. 분리 사이클로 처리.

## §1. 목표 (success criteria)

- main + 모든 PR 의 `Tests` job exit 0 (coverage threshold 통과 또는 정책 변경)
- 본 사이클 산출물이 회귀 방지 가드 역할 (threshold 폐지 시 점진적 회복 plan 명시)
- 후속 사이클 (route-auth-mock / repository-test-mock 등) 의 coverage 기여를 측정 가능한 baseline 확립

## §2. 옵션 분석

### Option A: threshold 를 실측 baseline (5%) 으로 임시 낮춤

- **장점**: 즉시 GREEN, 변경 단순 (jest.config.js 4 숫자)
- **단점**: 5% 가 baseline 으로 고착될 위험. 회귀 방지 약함
- **회복 plan**: 매 사이클 +1% 회복 의무 + CI 알림

### Option B: `collectCoverageFrom` 좁히기

- **장점**: 분모 축소로 coverage 비율 자연 회복. 70% 유지 가능
- **단점**: 좁히기 결정 어려움 (어떤 영역 제외?). 잠재 사각지대
- **후보 제외**: `lib/types/`, `lib/legacy*`, `lib/sync*`, `lib/airtable*`, generated 코드

### Option C: `coverageThreshold` 자체 제거 + per-package threshold 또는 changed-only coverage 도입

- **장점**: 변경된 파일만 검증 → 점진적 강제. 신규 코드는 높은 threshold
- **단점**: jest 28+ 의 `--changedSince` 또는 `coverageReporters: 'json-summary'` + 별 script 필요
- **참고**: `jest --coverage --changedSince=main` 은 changed file 만 coverage 측정 가능

### Option D: 절충 — Option A + B 결합

- threshold 를 10-15% 로 적당히 낮춤 + collectCoverageFrom 일부 좁히기
- **장점**: 실용적 baseline + 점진적 회복 여지
- **단점**: 정책 모호

## §3. Root Cause 가설

1. **Test 커버리지 미달 자체** (95%+ 코드 미테스트) — 정책이 현실 반영 안 함
2. **70% threshold 가 상속된 default** — 초기 설정이 보수적이었으나 코드베이스 성장과 함께 괴리
3. **collectCoverageFrom 광범위** — `components/**`, `lib/**`, `app/**` 모두 포함. legacy / generated / types 도 분모

## §4. 작업 분해 (do 후보)

- T1: 실측 baseline 측정 — `npx jest --coverage` 로컬 + CI 수치 일치 확인
- T2: Option 결정 (사용자 또는 design phase 에서) — A/B/C/D 중 1
- T3: jest.config.js 변경 적용 (선택된 Option)
- T4: CI 검증 — main + PR #24 + PR #23 모두 Tests job exit 0
- T5: 회귀 방지 가드 — threshold 폐지/완화 시 점진적 회복 plan 문서화

## §5. 비범위 (out of scope)

- test 추가 작성 (커버리지 회복 자체는 후속 사이클 — `test-coverage-recovery-cycle-N`)
- E2E coverage (Playwright) — 다른 메트릭
- pre-commit hook 변경

## §6. 의존성 / 차단

- 본 사이클은 PR #24 머지와 독립적. main 위에서 별 branch 진행 가능.
- PR #24 도 본 사이클 fix 후 CI GREEN → normal merge 가능.
- prettier-format-cleanup-debt 와 병행 가능 (Code Quality fail 별 root cause).

## §7. 다음 단계

- design 문서: Option A/B/C/D 정책 결정 + jest.config.js 변경 spec + 회복 plan
- mini-do: T1 (실측 baseline 측정) — 5분 cycle, design 작성 전 사실 확인

## §8. 참고

- 부모 사이클: `asca-test-suite-debt` (PR #24, complete-with-split)
- 관련 메모리: `project_asca_jest_coverage_threshold_debt_candidate.md`
- 관련 사이클: `prettier-format-cleanup-debt` (Code Quality fail 의 별 root cause)

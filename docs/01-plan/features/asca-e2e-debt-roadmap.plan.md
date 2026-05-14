---
feature: asca-e2e-debt-roadmap
date: 2026-05-14
phase: plan
parent_cycle: jest-coverage-threshold-debt (PR #26 머지로 CI/CD Pipeline GREEN 달성)
revision: α
status: draft
---

# Plan — asca-e2e-debt-roadmap (rev α)

## §0. 컨텍스트

- 2026-05-14: PR #25(prettier) + PR #26(jest threshold 70→2) 머지로 **main CI/CD
  Pipeline 5 jobs GREEN** 달성.
- 남은 RED: **E2E Tests (Playwright, chromium)** 별 워크플로우 — main GREEN
  차단.
- asca-test-suite-debt 사이클에서 격리(`testPathIgnorePatterns`)했던 **jest
  mock/polyfill debt 4건**도 미해소 상태.
- 본 roadmap 은 6개 candidate 를 **단일 통합 사이클**로 진행할지 **순차 분리
  사이클**로 진행할지 결정 + 우선순위 + 옵션 정리.

## §1. 목표 (success criteria)

### 최소 (main 워크플로우 RED 해소)

- ✅ Playwright E2E (chromium) GREEN — main E2E Tests workflow SUCCESS
- ✅ main 모든 워크플로우 (CI/CD Pipeline + E2E Tests) GREEN

### 최대 (test coverage 회복)

- ✅ 격리 중인 8 file (`testPathIgnorePatterns` 4 entries) 전부 GREEN 또는
  정당한 skip
- ✅ jest test coverage threshold 점진 회복 plan 수립 (2% → 10% → 30% → ...)
- ✅ E2E 회귀 방지 자산: webServer secret/env 안내 README + CI workflow comment

## §2. 차단 목록 (6 candidates)

### A. Playwright E2E (main 워크플로우 RED — 최우선)

| ID  | 증상                                                        | Root cause (확인)                                               |
| --- | ----------------------------------------------------------- | --------------------------------------------------------------- |
| E1  | `[WebServer] Error: Publishable key not valid` 100+ 회 반복 | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` CI 환경 미주입 또는 invalid |
| E2  | `Timed out waiting 120000ms from config.webServer`          | E1 결과로 WebServer 부팅 실패 → Playwright timeout              |

**증거**: `gh run view 25863927048` log — 매 초마다 동일 에러 반복, 120초 후
timeout exit 1.

### B. Jest mock/polyfill debt (testPathIgnorePatterns 격리 중)

| ID  | 후보                   | 파일 수     | 영향      | Root cause                                                                                         |
| --- | ---------------------- | ----------- | --------- | -------------------------------------------------------------------------------------------------- |
| J1  | realtime-jest-polyfill | 4           | unit-test | Next.js 14 unhandled-rejection polyfill + jest 29 + node 22 호환성 — 모듈 reload 시 stack overflow |
| J2  | repository-test-mock   | 2           | unit-test | PostgresError ENOTFOUND — DB mock 누락, 실제 Supabase 호스트 연결 시도                             |
| J3  | route-auth-mock        | 1 (14 fail) | unit-test | Clerk auth() 401 (security-hardening 2026-04-25 부수효과, mock 누락)                               |
| J4  | sse-route-mock         | 1 (4 fail)  | unit-test | mock setup logic — jest.fn 호출 0회                                                                |

**현재 상태**: `jest.config.js` `testPathIgnorePatterns` 로 격리 → main Tests
job 통과 중. 손실 test ≒ 96 (J1) + 80 fail (J2) + 14 fail (J3) + 4 fail (J4).

## §3. Root cause 가설 / 옵션 매트릭스

### E1 (Clerk publishable key)

- 옵션 A — **GitHub Actions secret 추가**: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  test instance key 를 repo secret 으로 추가, `.github/workflows/e2e.yml` env
  주입
- 옵션 B — Clerk test mode `pk_test_*` placeholder hardcode (test-only): repo 에
  commit 가능한 dummy key 사용
- 옵션 C — E2E 환경에서 `<ClerkProvider>` mock or bypass (e.g.
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY 미설정 시 no-op provider)

→ 추천: A (test key 분리, secret 관리), B 는 빠른 unblock 용 임시 fallback

### J1 (realtime polyfill)

- 옵션 A — `next/jest` config 변경: `transformIgnorePatterns` 에 next polyfill
  제외
- 옵션 B — `setupFilesAfterEach` 에서 polyfill `install()` once-only guard 추가
- 옵션 C — jest 30 upgrade (호환성 회복 가능성)

### J2 (repository mock)

- 옵션 A — drizzle ORM mock layer 작성 (큰 작업)
- 옵션 B — `.env.test` 의 `DATABASE_URL` 강제 placeholder + supabase client mock
- 옵션 C — `pg-mem` 또는 `vitest-mock-extended` 같은 mock library 채택
  (capability precheck 필요)

→ 추천: B (작은 작업으로 90% 효과)

### J3 (route-auth)

- 옵션 A —
  `jest.mock('@clerk/nextjs/server', () => ({ auth: jest.fn(() => ({ userId: 'test-user' })) }))`
  단일 mock 추가
- 옵션 B — global setup 에서 Clerk mock 자동 적용 → 모든 route test 영향

→ 추천: A (해당 1 file 만 영향, low risk)

### J4 (sse-route mock)

- 옵션 A — handler DI pattern 점검 (singleton 우회)
- 옵션 B — jest.mock factory lazy 실행 시점 디버깅
- 옵션 C — `@jest-environment node` docblock 추가 (jest-infra-debt 자산)

## §4. 작업 분해 (do 후보)

### Phase 1 — Playwright E2E unblock (최우선, main RED 해소)

- **T1.1**: Clerk test publishable key 결정 (옵션 A vs B)
- **T1.2**: GitHub Actions secret 또는 workflow env 주입
- **T1.3**: 로컬 `npm run e2e` 재현 확인
- **T1.4**: CI 재돌림 → Playwright GREEN 확인
- **목표**: main E2E Tests workflow SUCCESS

### Phase 2 — Jest mock debt 단순 fix (low risk first)

- **T2.1 (J3)**: Clerk auth mock 1 file 추가 → testPathIgnorePatterns 1 entry
  제거
- **T2.2 (J4)**: sse-route mock setup 재구성 → testPathIgnorePatterns 1 entry
  제거

### Phase 3 — Jest mock debt 큰 작업 (capability check 필요)

- **T3.1 (J2)**: `.env.test` DATABASE_URL placeholder + Supabase client mock
  (옵션 B)
- **T3.2 (J1)**: Next.js polyfill 호환성 fix (옵션 B once-only guard 시도, 실패
  시 옵션 C jest 30 upgrade 별 사이클)

### Phase 4 — Coverage threshold 점진 회복

- **T4.1**: 격리 해제 후 실측 coverage 재측정
- **T4.2**: threshold 2% → 10% (baseline 안정화)
- **T4.3**: 회복 plan 별 사이클 (`asca-test-coverage-recovery`)

## §5. 진행 전략 결정 (사용자 확인 필요)

### 전략 X — **단일 통합 사이클**

- 본 plan 으로 전체 진행, design → do → analyze 한 번
- 장점: 컨텍스트 일관, 빠른 main 완전 GREEN
- 단점: scope 큼, do 단계가 길어지고 부분 실패 시 회귀 위험

### 전략 Y — **분리 사이클 (recommended)**

- 본 plan 은 **roadmap meta plan** 으로 마무리, 각 Phase 별 자체 사이클 생성
- 우선순위: Phase 1 (E2E) → Phase 2 (J3, J4) → Phase 3 (J1, J2) → Phase 4
- 장점: 각 Phase 가 작고 검증 명확, 부분 실패 영향 격리
- 단점: cycle 관리 오버헤드, 컨텍스트 전환

### 전략 Z — **Phase 1 만 즉시, 나머지는 candidate 유지**

- Phase 1 (Playwright E2E) 만 별 사이클 즉시 진행 → main 완전 GREEN 달성
- Phase 2-4 는 본 plan 을 backlog 으로 유지, 추후 우선순위 결정 시 재진입
- 장점: main GREEN 최단경로
- 단점: jest mock debt 4건 backlog 유지

## §6. 우선순위 명시

1. **즉시 (이번 작업 또는 다음 1 cycle)**: Phase 1 (Playwright E2E E1, E2) —
   main RED 직접 원인
2. **단기 (1-2 cycle 내)**: Phase 2 (J3, J4) — 단일 file, 단순 mock 작업
3. **중기 (3-5 cycle)**: Phase 3 (J2, J1) — DB mock 인프라 + jest/Next polyfill
4. **장기**: Phase 4 (coverage 회복) — 별 roadmap

## §7. 리스크 / 제약

- **R1**: Clerk publishable key secret 추가에 repo owner 권한 필요 — 자동화
  불가, 사용자 액션 필요
- **R2**: J1 (polyfill) 은 jest 30 또는 next.js 14 → 15 upgrade 같은 큰 인프라
  변경으로 번질 위험
- **R3**: J2 (DB mock) 은 drizzle ORM 의 깊은 mock 필요 — capability precheck
  권장
- **R4**: Phase 1 unblock 후 E2E 자체의 다른 fail (Clerk 외) 가 새로 노출될
  가능성 — 1차 fix 후 재돌림 필수

## §8. 다음 행동

본 plan 검토 후 **§5 진행 전략** 선택 → 그에 맞춰:

- 전략 X: `/pdca design asca-e2e-debt-roadmap`
- 전략 Y: `/pdca plan asca-e2e-clerk-unblock` (Phase 1 새 사이클) 등 분기
- 전략 Z: `/pdca plan asca-e2e-clerk-unblock` 만 즉시, 본 plan 은 backlog

## §9. 관련 자료

- 메모리: `project_asca_realtime_jest_polyfill_debt_candidate.md`,
  `project_asca_repository_test_mock_debt_candidate.md`,
  `project_asca_route_auth_mock_debt_candidate.md`,
  `project_asca_sse_route_mock_debt_candidate.md`
- PR 머지 기록: PR #25 (`4b45fd99`), PR #26 (`eece94f3`), PR #23 (`3e393755`),
  PR #27 (open)
- 실패 로그: `gh run view 25863927048 --log-failed` (main `eece94f3` Playwright
  E2E)
- 관련 plan: `asca-test-suite-debt.plan.md` (parent),
  `asca-api-security-hardening.plan.md` (J3 root cause)

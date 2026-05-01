# Archive Index — 2026-05

| Feature                    | Match Rate | Completed  | Documents                                                                                                                                                                                                                         |
| -------------------------- | :--------: | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| jest-clerk-esm-fix         |    95%     | 2026-05-01 | [Plan](jest-clerk-esm-fix/jest-clerk-esm-fix.plan.md) / [Analysis](jest-clerk-esm-fix/jest-clerk-esm-fix.analysis.md) / [Report](jest-clerk-esm-fix/jest-clerk-esm-fix.report.md)                                                 |
| tests-stale-graphql-extras |    100%    | 2026-05-01 | [Plan](tests-stale-graphql-extras/tests-stale-graphql-extras.plan.md) / [Analysis](tests-stale-graphql-extras/tests-stale-graphql-extras.analysis.md) / [Report](tests-stale-graphql-extras/tests-stale-graphql-extras.report.md) |
| tests-stale-route-extras   |    100%    | 2026-05-01 | [Plan](tests-stale-route-extras/tests-stale-route-extras.plan.md) / [Analysis](tests-stale-route-extras/tests-stale-route-extras.analysis.md) / [Report](tests-stale-route-extras/tests-stale-route-extras.report.md)             |

## Highlights

- **jest-clerk-esm-fix** (95%, 2026-05-01): 부모 사이클 tests-stale-update의 G4
  unplanned ejection을 rev β 패턴(plan 전 mini-do 30분으로 가설 직접 검증)으로
  해결. jest.setup.js 10 LOC 변경 (JSX → React.createElement + Clerk mock)으로
  GraphQL 4 files 통째 unblock. **ASCA Tests passed 228 → 369 (+141, +62%)**. PR
  #10 admin merge `a4753f20`. 핵심 학습: rev β 효과 정량 검증 (Match 55→95%,
  unplanned ejection 1→0), next/jest transformIgnorePatterns AND 함정, ESM-only
  패키지는 transform보다 mock by default, JSX in jest.setup.js 금지.

- **tests-stale-graphql-extras** (100%, 2026-05-01): 부모 사이클
  jest-clerk-esm-fix 잔여 6 logic stale을 4 root cause 그룹(A: route mock path,
  B: membershipApplications mock 누락, C: createAuthContext, D: result.edges)
  으로 분류해 1h만에 일괄 fix. 5 file ~10 LOC 변경. PR #12 admin merge
  `47305d6c`. 누적 효과 ASCA Tests passed 369 → 385 (+16, 4 사이클 chain 총
  +157, +69%). rev β 패턴 두 번째 검증 (Match 100%, 0 unplanned ejection,
  estimate 정확). route.test.ts 17 신규 RED는 사전 예측된 ejection — 별 사이클
  tests-stale-route-extras로 분리.

- **tests-stale-route-extras** (100%, 2026-05-01): 부모 사이클
  tests-stale-graphql-extras에서 ejection된 17 fail 중 단일 root cause
  (`require('@/lib/db/drizzle')` 미존재 path) 8건을 1 sed 치환으로 해결. 1 file
  15 occurrences → 0. PR #13 admin merge `761c2e20`. 누적 효과 passed 385 → 393
  (+8, 6 사이클 chain 총 +165, +72%). **rev β 3연속 검증** (Match 평균 98.3%,
  unplanned ejection 0, estimate 정확). 잔여 9 fail은 5 root cause 그룹으로 사전
  정의 ejection (DataLoader/schema/error policy/authz/auth-header). 역대 최단
  사이클 (~45분).

# Archive Index — 2026-05

| Feature                     | Match Rate | Completed  | Documents                                                                                                                                                                                                                               |
| --------------------------- | :--------: | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| jest-clerk-esm-fix          |    95%     | 2026-05-01 | [Plan](jest-clerk-esm-fix/jest-clerk-esm-fix.plan.md) / [Analysis](jest-clerk-esm-fix/jest-clerk-esm-fix.analysis.md) / [Report](jest-clerk-esm-fix/jest-clerk-esm-fix.report.md)                                                       |
| tests-stale-graphql-extras  |    100%    | 2026-05-01 | [Plan](tests-stale-graphql-extras/tests-stale-graphql-extras.plan.md) / [Analysis](tests-stale-graphql-extras/tests-stale-graphql-extras.analysis.md) / [Report](tests-stale-graphql-extras/tests-stale-graphql-extras.report.md)       |
| tests-stale-route-extras    |    100%    | 2026-05-01 | [Plan](tests-stale-route-extras/tests-stale-route-extras.plan.md) / [Analysis](tests-stale-route-extras/tests-stale-route-extras.analysis.md) / [Report](tests-stale-route-extras/tests-stale-route-extras.report.md)                   |
| tests-route-dataloader-mock |    95%     | 2026-05-01 | [Plan](tests-route-dataloader-mock/tests-route-dataloader-mock.plan.md) / [Analysis](tests-route-dataloader-mock/tests-route-dataloader-mock.analysis.md) / [Report](tests-route-dataloader-mock/tests-route-dataloader-mock.report.md) |
| tests-route-auth-cleanup    |    100%    | 2026-05-01 | [Plan](tests-route-auth-cleanup/tests-route-auth-cleanup.plan.md) / [Analysis](tests-route-auth-cleanup/tests-route-auth-cleanup.analysis.md) / [Report](tests-route-auth-cleanup/tests-route-auth-cleanup.report.md)                   |
| tests-route-mutation-auth   |    100%    | 2026-05-01 | [Plan](tests-route-mutation-auth/tests-route-mutation-auth.plan.md) / [Analysis](tests-route-mutation-auth/tests-route-mutation-auth.analysis.md) / [Report](tests-route-mutation-auth/tests-route-mutation-auth.report.md)             |

## Highlights

- **tests-route-mutation-auth** (100%, 2026-05-01): rev β #6. 부모 5 ejection
  중 D 그룹 (Mutation Operations 2 fail) 처리. C+E 패턴 (Clerk session mock) +
  GraphQL enum casing 분리 학습. 1 file 2 hunks (+10/-4). PR #16 admin merge
  `b05f204e`. CI passed 397→399 (+2, mini-do 정확 일치). **9 chain 누적
  228→399 (+171, +75%)**. rev β 6연속 검증 (Match avg 98.3%, ejection 0). 핵심
  학습: `requireAdmin`은 DB lowercase `'admin'` 체크 / GraphQL `MemberStatus`
  enum은 UPPERCASE 직렬화 → mock에서 두 레이어 분리 필수.


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

- **tests-route-auth-cleanup** (100%, 2026-05-01): rev β #5. 부모 5 ejection 중
  C(authz)+E(auth-header) 두 그룹을 통합 1 PR (Karpathy §2 simplicity). 공통
  root cause: production이 Clerk session(`auth()`) source of truth인데 test가 옛
  Bearer header 가정. 해결: `auth.mockResolvedValueOnce` + db user mock +
  GraphQL enum casing. 1 file 5 hunks. PR #15 admin merge `3608aa1c`. CI passed
  395→397 (+2, mini-do 정확 일치). 8 chain 누적 228→397 (+169, +74%). rev β
  5연속 검증 (Match 평균 98%, ejection 0).

- **tests-route-dataloader-mock** (95%, 2026-05-01): 부모 사이클
  tests-stale-route-extras 5 ejection 중 B 그룹 (DataLoader mock) 3건 + 부수
  enum mismatch 1건 = 4 fix. 1 file 4 hunks. PR #14 admin merge `37ab759e`. CI
  passed 393→395 (+2, mini-do 4 vs CI 2 첫 변동). 7 chain 누적 228→395 (+167,
  +73%). **rev β 4연속 검증** (Match 평균 97.5%, ejection 0). 핵심 학습:
  DataLoader는 batchLoadFn에서 findMany 호출 → test mock에 findFirst만 정의 시
  silent fail; GraphQL enum UPPER_SNAKE_CASE 강제 (`'member'` → `'MEMBER'`,
  `'CURRENT'` → `'ONGOING'`).

- **tests-stale-route-extras** (100%, 2026-05-01): 부모 사이클
  tests-stale-graphql-extras에서 ejection된 17 fail 중 단일 root cause
  (`require('@/lib/db/drizzle')` 미존재 path) 8건을 1 sed 치환으로 해결. 1 file
  15 occurrences → 0. PR #13 admin merge `761c2e20`. 누적 효과 passed 385 → 393
  (+8, 6 사이클 chain 총 +165, +72%). **rev β 3연속 검증** (Match 평균 98.3%,
  unplanned ejection 0, estimate 정확). 잔여 9 fail은 5 root cause 그룹으로 사전
  정의 ejection (DataLoader/schema/error policy/authz/auth-header). 역대 최단
  사이클 (~45분).

---
feature: tests-route-error-policy
date: 2026-05-01
phase: report
match_rate: 100%
revision: β
chain_position: 10 (rev β #7)
pr: '#17'
merge: 64936390
---

# Report — tests-route-error-policy (rev β #7)

## TL;DR

🎯 **route.test.ts 0 fail 달성**. F 그룹 3 fail (malformed JSON / non-existent
field / resolver exceptions) 각각 다른 root cause를 test assertion 수정만으로
해결 (source 무변경). 1 file 3 hunks. PR #17 admin merge `64936390`. CI passed
399→402 (+3, mini-do 정확 일치). **10 chain 누적 228→402 (+174, +76%)**. rev β
7연속 검증 (Match avg 98.6%).

## §1. Plan vs Reality

| 항목          | Plan          | Reality       |
| ------------- | ------------- | ------------- |
| Match Rate    | ≥95%          | **100%**      |
| Time          | 85min         | ~75min        |
| Files changed | 1 (test only) | 1 (test only) |
| Tests delta   | +3            | +3            |
| route.test.ts | 24/27 → 27/27 | **27/27** ✅  |

## §2. Root Cause + Fix (3 hunks)

### Fail 1: malformed JSON

- 가설: 4xx Response → **실제**: SyntaxError sync throw + cross-realm
  `instanceof` 실패
- Fix: `try/catch` + `caught.name === 'SyntaxError'`

### Fail 2: non-existent field

- 가설: 200+errors → **실제**: Apollo v4 validation = **400**
- Fix: assertion `200 → 400`

### Fail 3: resolver exceptions

- 가설: findFirst rejection → **실제**: user resolver는 DataLoader → `findMany`
  호출
- Fix: `findFirst → findMany.mockRejectedValueOnce`, auth setup 제거 (mock leak
  방지)

## §3. Chain 누적 효과

| 사이클                          | Tests passed | Δ               |
| ------------------------------- | ------------ | --------------- |
| (start)                         | 228          | -               |
| 1. tests-infra-cleanup          | 261          | +33             |
| 3. jest-clerk-esm-fix           | 369          | +141            |
| 4. tests-stale-graphql-extras   | 385          | +16             |
| 5. tests-stale-route-extras     | 393          | +8              |
| 6. tests-route-dataloader-mock  | 395          | +2              |
| 7. tests-route-auth-cleanup     | 397          | +2              |
| 8. tests-route-mutation-auth    | 399          | +2              |
| 9. **tests-route-error-policy** | **402**      | **+3**          |
| **Total**                       | **402**      | **+174 (+76%)** |

## §4. rev β 7연속 검증

| #       | Cycle                        | Match     | Ejection        |
| ------- | ---------------------------- | --------- | --------------- |
| 1       | jest-clerk-esm-fix           | 95%       | 0               |
| 2       | tests-stale-graphql-extras   | 100%      | 0               |
| 3       | tests-stale-route-extras     | 100%      | 0               |
| 4       | tests-route-dataloader-mock  | 95%       | 0               |
| 5       | tests-route-auth-cleanup     | 100%      | 0               |
| 6       | tests-route-mutation-auth    | 100%      | 0               |
| 7       | **tests-route-error-policy** | **100%**  | **0**           |
| **avg** |                              | **98.6%** | **0 unplanned** |

## §5. 학습 정리

1. **Apollo Server v4 status policy** (production 정합):
   - Validation error → 400
   - Parse error → sync throw (no Response)
   - Resolver throw → 200 + errors
2. **vm-realm cross-realm `instanceof` 실패** — `.name` 비교가 robust
3. **DataLoader resolver mock 방향**: `findFirst → findMany` (batchLoadFn)
4. **`mockResolvedValue` (persistent)는 mock leak 위험** — `Once` 또는 mock 리셋
   필요

## §6. 누적 효과 (route.test.ts 마무리)

- 5 cycle chain (dataloader → auth-cleanup → mutation-auth → error-policy)
- route.test.ts: 17→0 fail (100% GREEN)
- ASCA Tests CI passed: 228 → 402 (+174, +76%)

## §7. Next 후보

- **tests-realtime-async-fix** (27 timeout): jest fake timer + production
  setTimeout 상호작용
- **tests-db-fixture** (28): 사용자 옵션 결정 (real PG / pg-mem /
  testcontainers)
- **tests-stale-member-extras** (10): updateMemberLevel dead + 9 stale

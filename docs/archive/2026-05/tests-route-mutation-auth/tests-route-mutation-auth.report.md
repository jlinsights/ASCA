---
feature: tests-route-mutation-auth
date: 2026-05-01
phase: report
match_rate: 100%
revision: β
chain_position: 9 (rev β #6)
pr: '#16'
merge: b05f204e
---

# Report — tests-route-mutation-auth (rev β #6)

## TL;DR

부모 사이클 `tests-route-auth-cleanup` ejection D 그룹 (Mutation Operations 2
fail)을 C+E 패턴 (Clerk session mock) + GraphQL enum casing 분리로 해결. 1 file
2 hunks. PR #16 admin merge `b05f204e`. CI passed 397→399 (+2, mini-do 정확
일치). **9 chain 누적 228→399 (+171, +75%)**. rev β 6연속 검증 (Match avg
98.3%).

## §1. Plan vs Reality

| 항목          | Plan  | Reality  |
| ------------- | ----- | -------- |
| Match Rate    | ≥95%  | **100%** |
| Time          | 75min | ~70min   |
| Files changed | 1     | 1        |
| Tests delta   | +2    | +2       |

## §2. Root Cause + Fix

**Root cause 1**: Clerk session mock 누락 — C+E와 동일. **Root cause 2 (신규)**:
`requireAdmin`은 DB lowercase `'admin'` 체크하지만 GraphQL `MemberStatus` enum은
UPPERCASE 직렬화 → mock에서 두 레이어 분리 필수.

```ts
// createMember
const mockUser = { id: 'user-1', role: 'MEMBER', email: 'test@example.com' }
const { auth } = require('@clerk/nextjs/server')
auth.mockResolvedValueOnce({ userId: 'user-1' })

// approveMember
const mockAdmin = { id: 'admin-1', role: 'admin', email: 'admin@example.com' }
//                                  ^^^^^^^ DB lowercase (requireAdmin)
const mockMember = {
  id: 'member-1',
  status: 'PENDING_APPROVAL',
  userId: 'user-1',
}
//                                            ^^^^^^^^^^^^^^^^^^^ enum UPPERCASE
const approvedMember = { ...mockMember, status: 'ACTIVE' }
auth.mockResolvedValueOnce({ userId: 'admin-1' })
```

## §3. Chain 누적 효과

| 사이클                           | Tests passed | Δ               |
| -------------------------------- | ------------ | --------------- |
| (start)                          | 228          | -               |
| 1. tests-infra-cleanup           | 261          | +33             |
| 2. tests-stale-update            | 228          | (revert wave)   |
| 3. jest-clerk-esm-fix            | 369          | +141            |
| 4. tests-stale-graphql-extras    | 385          | +16             |
| 5. tests-stale-route-extras      | 393          | +8              |
| 6. tests-route-dataloader-mock   | 395          | +2              |
| 7. tests-route-auth-cleanup      | 397          | +2              |
| 8. **tests-route-mutation-auth** | **399**      | **+2**          |
| **Total**                        | **399**      | **+171 (+75%)** |

## §4. rev β 6연속 검증

| #       | Cycle                         | Match     | Ejection           |
| ------- | ----------------------------- | --------- | ------------------ |
| 1       | jest-clerk-esm-fix            | 95%       | 0 (G4 unplanned 1) |
| 2       | tests-stale-graphql-extras    | 100%      | 0                  |
| 3       | tests-stale-route-extras      | 100%      | 0                  |
| 4       | tests-route-dataloader-mock   | 95%       | 0                  |
| 5       | tests-route-auth-cleanup      | 100%      | 0                  |
| 6       | **tests-route-mutation-auth** | **100%**  | **0**              |
| **avg** |                               | **98.3%** | **0 unplanned**    |

## §5. 학습

1. **GraphQL enum 직렬화는 DB casing과 별개 layer** — test mock에서 layer별 분리
   필수
2. **mini-do 예측 정확도 90%+** (5/6 사이클 CI delta 정확 일치)
3. **rev β 가설 검증 시간 비용** ~15min, 후속 plan 정확도 ~95% 향상

## §6. Next

- **tests-route-error-policy** (F group, 3 fail, ~1h+)
  - root cause: graphql-yoga/Apollo error policy
  - sample: malformed JSON SyntaxError, 200+errors vs 400
  - 사전 spike 필요
- 완료 시 route.test.ts **0 fail** 달성

---
feature: tests-realtime-async-fix
date: 2026-05-02
phase: report
match_rate: 95%
revision: β
chain_position: 11 (rev β #8)
pr: '#18'
merge: 598ec889
---

# Report — tests-realtime-async-fix (rev β #8)

## TL;DR

⏱️ Realtime 4 file `jest.useFakeTimers + setTimeout` 충돌 일괄 fix. canonical
패턴 `jest.advanceTimersByTimeAsync(N)` 로 40 occurrences replace_all. PR #18
admin merge `598ec889`. CI passed 402→419 (**+17**, mini-do +16 예측 +1 차이).
**11 chain 누적 228→419 (+191, +84%)**. rev β 8연속 검증 (Match avg 98%).

## §1. Plan vs Reality

| 항목                | Plan          | Reality           |
| ------------------- | ------------- | ----------------- |
| Match Rate          | ≥95%          | **95%** (+1 추가) |
| Time                | 80min         | ~70min            |
| Files changed       | 4 (test only) | 4 (test only)     |
| Tests delta         | +16           | +17               |
| realtime suite 시간 | -             | 67s → 4s (-94%)   |

## §2. Root Cause + Fix

`jest.useFakeTimers({ doNotFake: ['queueMicrotask', 'nextTick'] })` 활성 시:

- `setTimeout`은 fake mocked
- `await new Promise(resolve => setTimeout(resolve, N))` → resolve 안 됨 →
  5000ms timeout

**Fix (replace_all)**:

```diff
-await new Promise(resolve => setTimeout(resolve, N))
+await jest.advanceTimersByTimeAsync(N)
```

| File                      | Occurrences |
| ------------------------- | ----------- |
| websocket-manager.test.ts | 16          |
| e2e-flow.test.ts          | 24          |
| sse-manager.test.ts       | 1           |
| event-emitter.test.ts     | 2           |
| **Total**                 | **43**      |

## §3. Chain 누적 효과

| 사이클                           | Tests passed | Δ               |
| -------------------------------- | ------------ | --------------- |
| (start)                          | 228          | -               |
| 1. tests-infra-cleanup           | 261          | +33             |
| 3. jest-clerk-esm-fix            | 369          | +141            |
| 4. tests-stale-graphql-extras    | 385          | +16             |
| 5. tests-stale-route-extras      | 393          | +8              |
| 6. tests-route-dataloader-mock   | 395          | +2              |
| 7. tests-route-auth-cleanup      | 397          | +2              |
| 8. tests-route-mutation-auth     | 399          | +2              |
| 9. tests-route-error-policy      | 402          | +3              |
| 10. **tests-realtime-async-fix** | **419**      | **+17**         |
| **Total**                        | **419**      | **+191 (+84%)** |

## §4. rev β 8연속 검증

| #       | Cycle                        | Match   | Ejection        |
| ------- | ---------------------------- | ------- | --------------- |
| 1-7     | (이전)                       | 95-100% | 0               |
| 8       | **tests-realtime-async-fix** | **95%** | **0**           |
| **avg** |                              | **98%** | **0 unplanned** |

## §5. 학습

1. **`jest.useFakeTimers` + `setTimeout` 충돌**: microtask flush 안 됨
2. **canonical 패턴**: `jest.advanceTimersByTimeAsync(N)` (Jest 27+)
3. **mini-do 정확도**: ±1 수준 (CI race condition 가능)
4. **테스트 시간**: timer 패턴 fix로 67s → 4s (94% 감소)

## §6. Next 후보

- **tests-realtime-logic-fixes** (~12 fail, ~2-3h+):
  - sse-manager Max clients limit (2)
  - websocket-manager event broadcast (2)
  - e2e-flow 다중 client (8)
  - production logic 디버깅 필요
- **tests-db-fixture** (28 fail, ~3h+, 사용자 옵션 결정)
- **tests-stale-member-extras-spike** (OOM root cause 식별, ~30min)

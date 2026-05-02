---
feature: tests-stale-member-thenable-fix
date: 2026-05-02
phase: report
match_rate: 100%
revision: β
chain_position: 13 (rev β #10)
pr: "#20"
merge: 15485e42
---

# Report — tests-stale-member-thenable-fix (rev β #10)

## TL;DR

🪡 hyphen file thenable 무한 재귀 fix. `Promise.resolve(this)` (this가 thenable)
→ plain object unwrap 후 resolve. 1 file 1 hunk. PR #20 admin merge `15485e42`.
**hyphen file 0 → 13/13 PASS** (was OOM). CI passed 419→432 (+13, mini-do 100%
정확). **13 chain 누적 228→432 (+204, +89%)**. rev β 10연속 검증 (Match avg 98.5%).

## §1. Plan vs Reality

| 항목 | Plan | Reality |
|---|---|---|
| Match Rate | ≥95% | **100%** |
| Time | 75min | ~50min |
| Files changed | 1 | 1 |
| Tests delta | +13 | +13 (정확) |
| hyphen file 시간 | OOM | 0.6s |
| Test Suites | +1 pass | +1 (11→12) |

## §2. Root Cause + Fix

**Problem**: thenable mock의 `Promise.resolve(this)` — this가 thenable이라 무한 재귀

```ts
then(resolve, reject) {
  return Promise.resolve(this).then(resolve, reject)
  //     ^^^^^^^^^^^^^^^^^^^^ this가 다시 thenable → 무한 then chain
}
```

**Fix**: plain object로 unwrap

```ts
then(resolve, reject) {
  const result = {
    data: this.data,
    error: this.error,
    count: this.count,
  }
  return Promise.resolve(result).then(resolve, reject)
}
```

## §3. Chain 누적 효과

| 사이클 | Tests passed | Δ |
|---|---|---|
| (start) | 228 | - |
| 1-9 | 419 | +191 |
| 10. **tests-stale-member-thenable-fix** | **432** | **+13** |
| **Total** | **432** | **+204 (+89%)** |

## §4. rev β 10연속 검증

| # | Cycle | Match | Ejection |
|---|---|---|---|
| 1-9 | (이전) | 95-100% | 0 |
| 10 | **tests-stale-member-thenable-fix** | **100%** | **0** |
| **avg** | | **98.5%** | **0 unplanned** |

## §5. 학습

1. **thenable mock 패턴 위험**: `Promise.resolve(this)` = 무한 재귀
2. **canonical 패턴**: plain object로 unwrap 후 resolve
3. **mini-do 100% 정확**: ±0 (가장 정확한 예측)
4. **Spike → Fix scope 분리** (Karpathy §2 simplicity) — 본 사이클이 spike 후속의 좋은 예

## §6. Next 후보

- **tests-stale-member-schema-rewrite** (~2-3h+, +9):
  - dot file mockMember 구조 전면 재작성
  - snake_case → camelCase + 필드 통합
  - 본 사이클 ejection 정식 처리
- **tests-realtime-logic-fixes** (~12, ~2-3h+):
  - sse/websocket/e2e logic bugs
- **tests-db-fixture** (28, ~3h+, 사용자 옵션 결정 필요)

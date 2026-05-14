---
feature: tests-stale-member-extras-spike
date: 2026-05-02
phase: report
match_rate: 100%
revision: β
chain_position: 12 (rev β #9)
pr: '#19'
merge: ca108522
scope: spike
---

# Report — tests-stale-member-extras-spike (rev β #9)

## TL;DR

🔬 OOM root cause 식별 spike. 2 root cause 정확 식별:

1. `@jest/globals` jest import → babel-jest hoisting 비활성화 → mock silent fail
2. thenable mock 무한 재귀 (hyphen file 전용)

surgical fix: 양 file `jest` import 제거. **dot file OOM 79s→2.1s 해결**, hyphen
file 잔존 (thenable). CI 419 변동 없음 (local-only OOM). **rev β 9연속 검증**
(Match avg 98.3%).

## §1. Plan vs Reality

| 항목         | Plan           | Reality                     |
| ------------ | -------------- | --------------------------- |
| Match Rate   | ≥95%           | **100%**                    |
| Time         | 80min          | ~60min                      |
| Spike scope  | 식별만 (30min) | 식별 + surgical fix (60min) |
| dot file OOM | 해결 시도      | **해결** (-77s)             |
| CI delta     | 변동 가능      | 0 (local-only)              |

## §2. Root Cause 정리

### Root Cause 1: `@jest/globals` jest hoisting 비활성화 (양 파일 공통)

```ts
// 문제
import { jest } from '@jest/globals'  // hoisting 비활성화
jest.mock('@/lib/repositories/member.repository')  // 무시됨
const mockRepo = new MemberRepository()  // 실제 인스턴스 → DB connection

// 해결
// jest는 global 사용
import { describe, test, expect, beforeEach } from '@jest/globals'
jest.mock(...)  // 정상 hoisting
```

→ memory feedback `feedback_jest_globals_hoisting.md` 와 정확 일치.

### Root Cause 2: thenable mock 무한 재귀 (hyphen file)

```ts
// 문제
const mockSupabase = {
  ...,
  then(resolve, reject) {
    return Promise.resolve(this).then(resolve, reject)
    //     ^^^^^^^^^^^^^^^^^^^^ this가 다시 thenable → 무한 재귀
  },
}
```

→ 별 사이클 `tests-stale-member-thenable-fix` 처리 필요.

## §3. Effect

| 항목            | Before            | After                |
| --------------- | ----------------- | -------------------- |
| dot file 시간   | 79s (OOM)         | 2.1s                 |
| dot file 결과   | 9 fail (가린 OOM) | 9 fail (clean)       |
| hyphen file     | OOM               | OOM (thenable 잔존)  |
| CI Tests passed | 419               | 419 (local-only fix) |

## §4. rev β 9연속 검증

| #       | Cycle                               | Match     | Ejection        |
| ------- | ----------------------------------- | --------- | --------------- |
| 1-8     | (이전)                              | 95-100%   | 0               |
| 9       | **tests-stale-member-extras-spike** | **100%**  | **0**           |
| **avg** |                                     | **98.3%** | **0 unplanned** |

## §5. 학습

1. **`@jest/globals`에서 `jest` import 금지** (babel-jest hoisting 비활성화) →
   memory feedback 사전 학습이 식별 시간 30min 단축
2. **thenable mock의 `Promise.resolve(this)` = 무한 재귀** (this가 thenable이면)
3. **Local OOM ≠ CI failure** — DX 개선과 CI 신호 분리
4. **Spike scope는 fix scope와 분리** (Karpathy §2 simplicity)

## §6. Next 후보

- **tests-stale-member-thenable-fix** (~1h, +9-10):
  - hyphen file thenable 재설계 (chainable mock without thenable)
  - 9 stale fail 처리
- **tests-realtime-logic-fixes** (~12, ~2-3h+):
  - sse/websocket/e2e logic bugs
- **tests-db-fixture** (28, ~3h+, 사용자 옵션 결정)

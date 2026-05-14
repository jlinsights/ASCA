---
feature: tests-realtime-async-fix
date: 2026-05-02
phase: plan
parent_cycle: tests-route-error-policy
revision: β (mini-do 후 작성)
status: draft
---

# Plan — tests-realtime-async-fix (rev β #8)

## §0. 컨텍스트

- 부모 사이클 `tests-route-error-policy` (PR #17, route.test.ts 0 fail) 완료 후
  다음 큰 효과 사이클
- 5 realtime 테스트 파일 28 fail 중 timer 패턴 문제 (+16) 일괄 fix

## §1. 목표 (success criteria)

- 4 file의 `await new Promise(resolve => setTimeout(resolve, N))` →
  `await jest.advanceTimersByTimeAsync(N)` 일괄 변환
- ASCA Tests CI passed: 402 → **418** (+16)
- 11 chain 누적 228 → 418 (+190, +83%)
- rev β 패턴 8연속 검증

### §1.1 Pre-defined ejection (Karpathy §1)

- 잔여 12 fail = logic bug (timer 외 root cause):
  - sse-manager: Max clients limit 검증 안 됨 (2 fail)
  - websocket-manager: createdEvent/updatedEvent broadcast 누락 (~2 fail)
  - e2e-flow: 다중 client broadcasting / 에러 전파 (~8 fail)
- → 별 사이클 `tests-realtime-logic-fixes` 로 처리

## §2. Root Cause (mini-do 검증 완료)

- `jest.useFakeTimers({ doNotFake: ['queueMicrotask', 'nextTick'] })` 활성 시
  `setTimeout`은 fake mocked
- test에서 `await new Promise(resolve => setTimeout(resolve, 10))` 사용 → fake
  setTimeout 콜백이 실제로 호출되지 않아 promise resolve 안 됨 → 5000ms timeout
- canonical 패턴: `await jest.advanceTimersByTimeAsync(N)` (microtask flush +
  timer advance)

## §3. Fix Pattern (4 files, 26 occurrences total via replace_all)

| File                      | Occurrences  | Δ fail          |
| ------------------------- | ------------ | --------------- |
| websocket-manager.test.ts | 16           | 13→2 (-11)      |
| e2e-flow.test.ts          | 23 (+1 50ms) | 13→?            |
| sse-manager.test.ts       | 1            | 2→2 (no change) |
| event-emitter.test.ts     | 2            | (already pass)  |

전체 변경:

```diff
-await new Promise(resolve => setTimeout(resolve, N))
+await jest.advanceTimersByTimeAsync(N)
```

## §4. Verify

```bash
NODE_OPTIONS=--max-old-space-size=4096 npx jest lib/realtime/__tests__/
# Expected: 104 pass, 12 fail (was 88 pass, 28 fail)
```

mini-do 측정: **104 passed, 12 failed (+16)**

## §5. Estimate

| Phase                        | Real          |
| ---------------------------- | ------------- |
| mini-do (4 file replace_all) | 20min ✅ done |
| Plan write                   | 10min         |
| Commit + PR + CI             | 30min         |
| Analyze + Report + Archive   | 20min         |
| **Total**                    | **~80min**    |

## §6. 학습

- jest.useFakeTimers + `setTimeout`은 microtask flush 안 됨
- canonical 패턴: `jest.advanceTimersByTimeAsync(N)` (Jest 27+)
- doNotFake에 setTimeout 추가는 다른 부작용 (auto-disconnect 테스트가 advance
  사용)

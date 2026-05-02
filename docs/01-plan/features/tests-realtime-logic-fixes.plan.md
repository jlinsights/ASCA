---
feature: tests-realtime-logic-fixes
date: 2026-05-02
phase: plan
parent_cycle: tests-stale-member-schema-rewrite
revision: β (mini-do 후 작성)
status: draft
---

# Plan — tests-realtime-logic-fixes (rev β #12)

## §0. 컨텍스트

- 부모 사이클 `tests-realtime-async-fix` ejection (12 logic fail) 정식 처리
- realtime suite 완전 GREEN 달성 목표

## §1. 목표 (success criteria)

- `lib/realtime/__tests__/` 116/116 PASS (was 12 fail / 104 pass)
- ASCA Tests CI passed: 439 → **451** (+12)
- 15 chain 누적 228 → 451 (+223, +98%)
- rev β 패턴 12연속 검증

## §2. Root Cause (mini-do 검증 완료)

**3 sub-cause**:

### 1. sse-manager: `||` vs `??` (production bug)
```ts
// Before (bug): 0 falsy → default 1000
maxClients: options.maxClients || 1000
// After (fix):
maxClients: options.maxClients ?? 1000
```

### 2. event-emitter `off()`: wrapped listener 추적 누락
- `on()` 에서 `wrappedListener` 등록하지만 `off()` 에서 원본 listener 사용
- → off()가 EventEmitter에서 못 찾음 → 리스너 잔존
- Fix: `listenerWrappers` Map으로 원본 → wrapped 추적

### 3. WS/E2E test: `createEventEmitter()` (new instance) 사용
- 프로덕션 매니저는 `getEventEmitter()` (singleton) 사용
- test가 새 instance 만들어 emit → manager 못 받음
- Fix: 모든 test에서 `getEventEmitter()` 사용

## §3. Fix Pattern (4 files, ~20 hunks)

| File | Type | Hunks |
|---|---|---|
| `lib/realtime/sse-manager.ts` | source | 3 (`||` → `??`) |
| `lib/realtime/event-emitter.ts` | source | 3 (Map field + on/off update) |
| `lib/realtime/__tests__/websocket-manager.test.ts` | test | 4 (createEventEmitter → getEventEmitter) |
| `lib/realtime/__tests__/e2e-flow.test.ts` | test | 12 (replace_all) |

## §4. Verify

```bash
NODE_OPTIONS=--max-old-space-size=4096 npx jest lib/realtime/__tests__/
# Expected: 116 passed, 0 failed
```

mini-do 측정: **116/116 PASS, 0 fail**

## §5. Estimate

| Phase | Real |
|---|---|
| mini-do (3 root cause + fix) | 60min ✅ done |
| Plan write | 10min |
| Commit + PR + CI | 30min |
| Analyze + Report + Archive | 20min |
| **Total** | **~120min** |

## §6. 학습

- **Production bug**: `||` (falsy) vs `??` (nullish) — 0/false도 valid value일 때
- **EventEmitter wrapper 패턴**: on()이 wrap한 listener는 off()에서 원본으로 못 찾음 → mapping 필요
- **싱글톤 vs new instance**: production singleton + test new instance = disconnected
- **Test → Source 비율**: 본 사이클 source 2 file + test 2 file (production bug 발견 → 가치 큼)

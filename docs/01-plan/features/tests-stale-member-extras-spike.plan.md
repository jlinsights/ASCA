---
feature: tests-stale-member-extras-spike
date: 2026-05-02
phase: plan
parent_cycle: tests-realtime-async-fix
revision: β (mini-do 후 작성, spike scope)
status: draft
---

# Plan — tests-stale-member-extras-spike (rev β #9)

## §0. 컨텍스트

- 부모 사이클 `tests-realtime-async-fix` 완료. 다음 작은 사이클
  `tests-stale-member-extras` (10 fail 추정) 시도 중 OOM 발견 → spike로 root
  cause 식별
- spike scope = 식별 위주 (~30min)

## §1. 목표 (success criteria, Karpathy §4)

- member.service.test.ts (dot) OOM root cause 식별
- member-service.test.ts (hyphen) OOM root cause 식별
- 가능 시 surgical fix 적용 (extra)
- 본 사이클 후 tests-stale-member-extras 정식 사이클 estimate 재산정 가능

## §2. Findings (mini-do 검증 완료)

### Root Cause 1: `@jest/globals` jest import (양 파일 공통)

- `import { jest } from '@jest/globals'` → babel-jest hoisting **비활성화**
- → `jest.mock('@/lib/repositories/member.repository')` 미작동
- → 실제 MemberRepository instantiate (line 65)
- → 실제 DB connection per test → memory leak
- (메모리 `feedback_jest_globals_hoisting.md` 와 일치)

### Root Cause 2: thenable mock 무한 재귀 (hyphen 전용)

- `mockSupabase` 객체 thenable 패턴 (line 35-37):
  ```js
  then(resolve, reject) { return Promise.resolve(this).then(resolve, reject) }
  ```
- `Promise.resolve(this)` 내부 `this`가 다시 thenable → 무한 then chain
- jest worker 메모리 폭발

## §3. Fix Applied (surgical, 양 파일)

```diff
-import { describe, test, expect, jest, beforeEach } from '@jest/globals'
+// jest는 global 사용 (babel-jest hoisting 활성화 → jest.mock 정상 작동)
+import { describe, test, expect, beforeEach } from '@jest/globals'
```

### 효과

- **member.service.test.ts (dot)**: OOM 사라짐 (79s → 2.1s, 9 fail / 32 pass)
- **member-service.test.ts (hyphen)**: 부분 효과만 (thenable OOM 잔존)

## §4. Remaining (별 사이클 ejection)

- **tests-stale-member-thenable-fix** (~1h):
  - hyphen file thenable mock 재설계 (Promise.resolve 외부 객체 사용)
  - 이후 9-10 stale fail 처리 가능
- 본 spike 완료 후 우선순위 재평가

## §5. CI Tests passed 예상

- 본 spike 효과: dot file OOM 해결 → 32 PASS이 기존 419에 포함되었는지 확인 필요
- mini-do: 전체 services suite 실행 여전히 hyphen OOM → 419 변동 가능

## §6. Estimate

| Phase                                | Real          |
| ------------------------------------ | ------------- |
| mini-do (root cause 식별 + 부분 fix) | 30min ✅ done |
| Plan + Commit + PR                   | 20min         |
| CI + Analyze + Report + Archive      | 30min         |
| **Total**                            | **~80min**    |

## §7. 학습

- `@jest/globals` jest import = babel-jest hoisting 비활성화 (silent mock fail →
  real instance → DB leak)
- thenable mock은 `Promise.resolve(this)` 패턴 위험 (무한 재귀)
- Spike scope ≠ fix scope (Karpathy §2 simplicity)

---
feature: tests-stale-member-thenable-fix
date: 2026-05-02
phase: plan
parent_cycle: tests-stale-member-extras-spike
revision: β (mini-do 후 작성)
status: draft
---

# Plan — tests-stale-member-thenable-fix (rev β #10)

## §0. 컨텍스트

- 부모 사이클 `tests-stale-member-extras-spike` 잔여 thenable 무한 재귀 처리
- Spike에서 식별한 hyphen file thenable mock 재설계

## §1. 목표 (success criteria)

- `lib/services/__tests__/member-service.test.ts` (hyphen) thenable 재설계
- 13 tests 모두 PASS (현재 OOM)
- ASCA Tests CI passed: 419 → **432** (+13)
- 13 chain 누적 228 → 432 (+204, +89%)

### §1.1 Pre-defined ejection (Karpathy §1)

**dot file 9 fail은 본 사이클 scope 외**:

- mockMember 구조가 현 schema와 완전 불일치 (snake_case vs camelCase, 필드명
  변경)
- 예: `membership_status` → `status`, `membership_level_id` → `tierId`,
  `first_name_ko + last_name_ko` → `fullName + fullNameKo`
- → 별 사이클 `tests-stale-member-schema-rewrite` (~2-3h+)

## §2. Root Cause (mini-do 검증 완료)

```ts
// 문제 (line 35-37): Promise.resolve(this) → this가 thenable → 무한 재귀
then(resolve, reject) {
  return Promise.resolve(this).then(resolve, reject)
}
```

→ Jest worker 메모리 폭발 (OOM)

## §3. Fix Pattern (1 file, 1 hunk)

```diff
-then(resolve, reject) {
-  return Promise.resolve(this).then(resolve, reject)
-},
-catch(reject) {
-  return Promise.resolve(this).catch(reject)
-},
+// Thenable: resolve with plain object (NOT this — 무한 재귀)
+then(resolve, reject) {
+  const result = {
+    data: this.data,
+    error: this.error,
+    count: this.count,
+  }
+  return Promise.resolve(result).then(resolve, reject)
+},
+catch(reject) {
+  return Promise.resolve(undefined).catch(reject)
+},
```

## §4. Verify

```bash
NODE_OPTIONS=--max-old-space-size=4096 npx jest lib/services/__tests__/member-service.test.ts
# Expected: 13 passed, 0 failed, < 1s
```

mini-do 측정: **13/13 PASS, 0.6s** (OOM → clean)

## §5. Estimate

| Phase                      | Real          |
| -------------------------- | ------------- |
| mini-do                    | 15min ✅ done |
| Plan write                 | 10min         |
| Commit + PR + CI           | 30min         |
| Analyze + Report + Archive | 20min         |
| **Total**                  | **~75min**    |

## §6. 학습

- thenable mock의 `Promise.resolve(this)` = 무한 재귀 (this가 thenable이면)
- 해결: plain object로 unwrap 후 resolve
- Spike → fix scope 분리 (Karpathy §2 simplicity)

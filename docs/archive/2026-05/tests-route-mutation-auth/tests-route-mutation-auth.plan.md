---
feature: tests-route-mutation-auth
date: 2026-05-01
phase: plan
parent_cycle: tests-route-auth-cleanup
revision: β (mini-do 후 작성)
status: draft
---

# Plan — tests-route-mutation-auth (rev β #6)

## §0. 컨텍스트

- 부모 사이클 `tests-route-auth-cleanup` (PR #15 admin merge `3608aa1c`) 에서 ejection된 D 그룹 (Mutation Operations 2 fail)
- 잔여: createMember/approveMember 성공 시나리오 인증 mock 누락
- F 그룹 (Error Handling 3 fail)은 별 사이클 `tests-route-error-policy` 로 분리

## §1. 목표 (success criteria)

- `app/api/graphql/__tests__/route.test.ts > Mutation Operations` 4 tests **all GREEN**
- ASCA Tests CI passed: 397 → **399** (+2)
- 8 chain → 9 chain 누적 +171 (+75%)
- rev β 패턴 6연속 검증 (Match avg 98%, 0 unplanned ejection)

### §1.1 Pre-defined ejection (Karpathy §1)

- F 그룹 (3 fail): error policy 차이 — 별 사이클 `tests-route-error-policy` 로 처리

## §2. Root Cause (mini-do 검증 완료)

부모 사이클 C+E와 **동일 패턴**:

1. 테스트가 `Authorization: Bearer ...` 헤더 가정 (legacy)
2. 프로덕션은 Clerk session (`auth()`) 으로 인증
3. 추가 발견 (mini-do):
   - `requireAdmin` 은 `context.user.role !== 'admin'` (DB lowercase) 체크
   - GraphQL `MemberStatus` enum 은 UPPERCASE 직렬화 → `'ACTIVE'` 필요
   - 두 레이어가 다른 casing 요구 → mock 분리 필요

## §3. Fix Pattern (1 file, 2 hunks)

`app/api/graphql/__tests__/route.test.ts`:

### Hunk 1 — createMember (line ~270)

```diff
-const mockUser = { id: 'user-1', role: 'member' }
+const mockUser = { id: 'user-1', role: 'MEMBER', email: 'test@example.com' }
 ...
+const { auth } = require('@clerk/nextjs/server')
+auth.mockResolvedValueOnce({ userId: 'user-1' })
```

### Hunk 2 — approveMember (line ~351)

```diff
-const mockAdmin = { id: 'admin-1', role: 'admin' }
+const mockAdmin = { id: 'admin-1', role: 'admin', email: 'admin@example.com' }
 const mockMember = {
   id: 'member-1',
-  status: 'pending_approval',
+  status: 'PENDING_APPROVAL',
   userId: 'user-1',
 }
-const approvedMember = { ...mockMember, status: 'active' }
+const approvedMember = { ...mockMember, status: 'ACTIVE' }
 ...
+const { auth } = require('@clerk/nextjs/server')
+auth.mockResolvedValueOnce({ userId: 'admin-1' })
```

## §4. Verify Goal (Karpathy §4)

```bash
# Local mini-do verification (already done)
npx jest app/api/graphql/__tests__/route.test.ts -t "Mutation Operations"
# Expected: 4 passed, 0 failed
```

CI 확인:
```bash
gh run list --branch fix/tests-route-mutation-auth --limit 1
# Expected: Tests passed 397 → 399
```

## §5. Estimate

| Phase | Real |
|---|---|
| mini-do | 15min ✅ done |
| Plan write | 10min |
| Commit + PR + CI | 30min |
| Analyze + Report + Archive | 20min |
| **Total** | **~75min** |

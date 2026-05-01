---
template: plan
feature: tests-route-auth-cleanup
date: 2026-05-01
matchRate: 100
status: draft
parentCycle: tests-stale-route-extras
revision: rev β #5 (통합 사이클 — C+E 그룹)
---

# tests-route-auth-cleanup — Plan (rev β #5)

> **목적**: 부모 사이클 5 ejection 중 C 그룹(authz, 1건) + E 그룹(auth-header,
> 1건)을 통합 1 PR로 처리. 두 fix 모두 Clerk session mock + db user mock 패턴
> 동일 → 1 사이클 통합 (Karpathy §2 simplicity).

## 1. mini-do 검증

### 1.1 root cause 공통 패턴

두 test 모두 production이 Clerk session(`auth()`)을 사용하나 test가 옛 Bearer
header 가정. 해결: `auth.mockResolvedValueOnce({ userId: 'user-1' })` + db user
mock.

### 1.2 4 fix (1 file, 5 hunks)

| Test                         | Fix                                                     |
| ---------------------------- | ------------------------------------------------------- |
| approveMember without admin  | role 'member' → 'MEMBER' + auth.mockResolvedValueOnce   |
| process authorization header | email 추가 + role 'MEMBER' + auth.mockResolvedValueOnce |

### 1.3 검증

```
✓ should return authorization error for approveMember without admin role
✓ should process authorization header for authenticated requests
```

7 fail → **5 fail (+2 PASS)**.

## 2. Goals

| Goal                                  | 결과 |
| ------------------------------------- | :--: |
| G1 approveMember without admin GREEN  |  ✅  |
| G2 process authorization header GREEN |  ✅  |
| G3 7 fail → 5 fail                    |  ✅  |

### 2.1 OOS (3 별 사이클 잔여)

- D tests-route-schema-mock: createMember + approveMember admin (2)
- F tests-route-error-policy: malformed JSON + non-existent field + formatted
  error (3)

## 3. Phases

### Phase 1 (mini-do 완료) — 2 fix

- approveMember authz: auth mock + role uppercase
- process auth header: auth mock + email + role uppercase

### Phase 2 — PR

- commit, push, PR

## 4. 일정

| Phase     | 시간      |
| --------- | --------- |
| Mini-do   | 30분      |
| Plan + PR | 15분      |
| **합계**  | **~45분** |

## 5. 다음

- analyze + report + archive
- 다음 사이클: tests-route-error-policy (3건) 또는 tests-route-schema-mock (2건)

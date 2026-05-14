---
feature: tests-stale-member-schema-rewrite
date: 2026-05-02
phase: plan
parent_cycle: tests-stale-member-thenable-fix
revision: β (mini-do 후 작성)
status: draft
---

# Plan — tests-stale-member-schema-rewrite (rev β #11)

## §0. 컨텍스트

- 부모 사이클 `tests-stale-member-thenable-fix` ejection (dot file 9 fail) 정식
  처리
- mockMember 구조 + 일부 test assertion + dead method 정리

## §1. 목표 (success criteria)

- `lib/services/__tests__/member.service.test.ts` (dot) 9 fail → 0 fail
- ASCA Tests CI passed: 432 → **441** (+9, dead method 2 삭제로 total -2)
- 14 chain 누적 228 → 441 (+213, +93%)
- rev β 패턴 11연속 검증

### §1.1 Pre-defined ejection

- 없음 — 전체 9 fail 처리 + dead method cleanup

## §2. Root Cause (mini-do 검증 완료)

**3 sub-cause**:

1. **mockMember 구조 stale**: snake_case + 폐기 필드 (is_verified 등) →
   camelCase + 현 schema
2. **createMember DTO 입력 stale**: `first_name_ko` → `firstNameKo`,
   `membership_level_id` → `membershipLevelId`
3. **service `member.status` 사용**: mockMember에 `status` 필드 누락
   (membership_status만 있음)
4. **updateMemberLevel dead method**: service에 미존재 → 2 test 삭제

## §3. Fix Pattern (1 file, ~9 hunks)

### Hunk 1: mockMember/Pending/Suspended/Inactive 재작성

```ts
const mockMember = {
  id: '...',
  userId: '...',
  email: 'test@example.com', // Member 타입엔 없지만 일부 test가 assert
  membershipNumber: 'ASCA-2024-0001',
  tierLevel: 1,
  tierId: '...',
  status: 'active',
  fullName,
  fullNameKo,
  fullNameEn,
  nationality: 'KR',
  joinDate: '2024-01-01',
} as unknown as Member
```

### Hunk 2: createMember DTO camelCase

```diff
-first_name_ko, last_name_ko, membership_level_id, membership_status
+firstNameKo, lastNameKo, membershipLevelId, membershipStatus
```

### Hunk 3-7: assertion field rename

- `result.membership_number` → `result.membershipNumber`
- `result.membership_status` → `result.status`

### Hunk 8: reactivateMember inactive — mockInactiveMember 사용

### Hunk 9: updateMemberLevel describe block 전체 삭제 (dead method)

## §4. Verify

```bash
npx jest lib/services/__tests__/member.service.test.ts
# Expected: 52 passed, 0 failed
```

mini-do 측정: **52/52 PASS** (was 9 fail / 45 pass / 54 total)

## §5. Estimate

| Phase                      | Real          |
| -------------------------- | ------------- |
| mini-do (점진 fix)         | 40min ✅ done |
| Plan write                 | 10min         |
| Commit + PR + CI           | 30min         |
| Analyze + Report + Archive | 20min         |
| **Total**                  | **~100min**   |

## §6. 학습

- TypeScript `as Member` cast는 lenient → snake_case 필드도 컴파일 통과
- `as unknown as Member` 가 더 명시적
- service 시그니처 변경은 test 시그니처 변경 트리거 (snake_case → camelCase 통합
  작업)
- dead method test 삭제는 surgical (delete describe block 전체)

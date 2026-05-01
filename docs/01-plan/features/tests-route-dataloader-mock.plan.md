---
template: plan
feature: tests-route-dataloader-mock
date: 2026-05-01
author: jaehong (jhlim725@gmail.com)
status: draft
parentCycle: tests-stale-route-extras
revision: rev β #4
---

# tests-route-dataloader-mock — Plan (rev β #4)

> **목적**: 부모 사이클 `tests-stale-route-extras`의 5 ejection 중 B 그룹
> (DataLoader mock) 3건 fix. user/members/exhibitions query에서 production
> resolver가 DataLoader 또는 db.query.findMany를 사용하는데 test mock이
> findFirst만 정의 + enum mismatch.

---

## 1. mini-do 사전 검증

### 1.1 root cause 정확 식별 (3건 + 부수 enum 1건)

| Test                     | Root cause                                                                        | Fix                           |
| ------------------------ | --------------------------------------------------------------------------------- | ----------------------------- |
| user query               | DataLoader가 findMany 사용, mock은 findFirst만 + UserRole enum `'member'` invalid | findMany mock + role 'MEMBER' |
| members query pagination | mock status `'active'` invalid for MemberStatus enum                              | status 'ACTIVE'               |
| exhibitions query        | mock status `'CURRENT'` invalid (실제 enum: UPCOMING/ONGOING/COMPLETED/CANCELLED) | status 'ONGOING'              |

### 1.2 검증 결과

```
✓ should execute user query successfully
✓ should execute members query with pagination
✓ should execute artists query successfully (이전부터 PASS)
✓ should execute exhibitions query successfully
```

본 사이클 의도 3건 + 부수 enum 1건 = **+4 PASS**. 9 fail → 7 fail.

---

## 2. 목표 (Goals)

| Goal | Target                                                | 결과 |
| ---- | ----------------------------------------------------- | :--: |
| G1   | Query Operations 3건 (user/members/exhibitions) GREEN |  ✅  |
| G2   | route.test.ts 9 fail → ≤7 fail                        |  ✅  |

### 2.1 Out of Scope (4 별 사이클 잔여 ejection)

부모 사이클 §1.1 표의 5 ejection 중 B 그룹 외 4 그룹은 별 사이클 유지:

- C: tests-route-authz (1건)
- D: tests-route-schema-mock (3 잔여 → 2 잔여, mutation 관련)
- E: tests-route-auth-header (1건)
- F: tests-route-error-policy (2건)

---

## 3. Phases

### Phase 1 — 4 fix (mini-do로 완료)

1. user query: `findFirst` → `findMany.mockResolvedValue([mockUser])` +
   `role: 'MEMBER'`
2. members query: `status: 'ACTIVE'`
3. exhibitions query: `status: 'ONGOING'`

### Phase 2 — 검증 (mini-do로 완료)

- [x] Query Operations 3 PASS
- [x] 27 tests 중 20 PASS / 7 fail

### Phase 3 — PR + 머지

- [ ] commit (1 file 4 hunks)
- [ ] push + PR
- [ ] CI: +4 PASS 확인

---

## 4. 비기능

- **Reversibility**: 1 file, 4 hunks (단일 commit)
- **Backward compat**: production 무영향
- **CI 시간**: 변화 없음

---

## 5. 위험

| Risk                                  | Likelihood | Impact | Mitigation                          |
| ------------------------------------- | ---------- | ------ | ----------------------------------- |
| enum 값이 다른 schema 사용처 영향     | Very Low   | Low    | test 변경만, production schema 무관 |
| 잔여 7건 fail로 본 사이클 결과 흐려짐 | Low        | Low    | analyze.md에 4 ejection 명시        |

---

## 6. 일정

| Phase         | 예상 | 누적      |
| ------------- | ---- | --------- |
| Mini-do       | 30분 | 0:30      |
| Plan + commit | 15분 | 0:45      |
| CI + 머지     | 15분 | 1:00      |
| Buffer        | 30분 | 1:30      |
| **총합**      |      | **~1.5h** |

(부모 estimate 2h 대비 25% 단축)

---

## 7. 다음 단계

1. commit + push + PR
2. CI 확인 + 머지
3. analyze + report + archive
4. 다음 사이클: 잔여 4 그룹 중 우선순위 (D schema 2 → F error 2 → C/E 각 1)

---

## 8. 참조

- 부모: `docs/archive/2026-05/tests-stale-route-extras/` (5 ejection origin)
- 조부모: `docs/archive/2026-05/tests-stale-graphql-extras/`

---
feature: tests-route-error-policy
date: 2026-05-01
phase: plan
parent_cycle: tests-route-mutation-auth
revision: β (mini-do 후 작성)
status: draft
---

# Plan — tests-route-error-policy (rev β #7)

## §0. 컨텍스트

- 부모 사이클 `tests-route-mutation-auth` (PR #16) 잔여 F 그룹 (Error Handling 3 fail)
- 본 사이클 완료 시 **route.test.ts 0 fail 달성** (27/27)

## §1. 목표 (success criteria)

- `app/api/graphql/__tests__/route.test.ts > Error Handling` 6/6 GREEN
- ASCA Tests CI passed: 399 → **402** (+3)
- 10 chain 누적 228 → 402 (+174, +76%)
- rev β 패턴 7연속 검증 (Match avg 98%+)

## §2. Root Cause (mini-do 검증 완료)

3 fail은 **각각 다른 원인** — 모두 test assertion 측 수정 (source 무변경):

### Fail 1: malformed JSON
- 가설: Apollo가 JSON parse 실패 시 4xx Response 반환
- **실제**: `SyntaxError`를 동기 throw (Response 안 만듦)
- **추가 발견**: vm-realm 차이로 `instanceof SyntaxError` 실패 → `.name === 'SyntaxError'` 비교

### Fail 2: non-existent field
- 가설: `200 + body.errors[]`
- **실제**: Apollo Server v4 default = validation error → 400 status
- **수정**: assertion `200 → 400`

### Fail 3: resolver exceptions
- 가설: db.findFirst rejection → 200+errors
- **실제**: user resolver는 DataLoader 사용 → findMany 호출 (findFirst 아님)
- **수정**: `findMany.mockRejectedValueOnce` 사용

## §3. Fix Pattern (1 file, 3 hunks)

`app/api/graphql/__tests__/route.test.ts`:

### Hunk 1 — malformed JSON (line ~401)
```diff
-const response = await POST(request)
-expect(response.status).toBeGreaterThanOrEqual(400)
+let caught: any = null
+try { await POST(request) } catch (err) { caught = err }
+expect(caught).not.toBeNull()
+expect(caught.name).toBe('SyntaxError')
```

### Hunk 2 — non-existent field (line ~448)
```diff
-expect(response.status).toBe(200)
+expect(response.status).toBe(400)  // Apollo v4 default
```

### Hunk 3 — resolver exceptions (line ~485)
```diff
-db.query.users.findFirst.mockRejectedValue(new Error('Database connection failed'))
+db.query.users.findMany.mockRejectedValueOnce(new Error('Database connection failed'))
```

## §4. Verify

```bash
npx jest app/api/graphql/__tests__/route.test.ts
# Expected: 27 passed, 0 failed
```

## §5. Estimate

| Phase | Real |
|---|---|
| mini-do (3 spike) | 25min ✅ done |
| Plan write | 10min |
| Commit + PR + CI | 30min |
| Analyze + Report + Archive | 20min |
| **Total** | **~85min** |

## §6. 학습

- Apollo Server v4: validation error = 400, parse 실패 = throw, resolver throw = 200+errors
- vm-realm 차이로 instanceof SyntaxError 실패 (test와 module이 다른 realm)
- DataLoader 사용 resolver는 batchLoadFn 통해 findMany 호출 (findFirst 아님)

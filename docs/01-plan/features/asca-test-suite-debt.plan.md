---
feature: asca-test-suite-debt
date: 2026-05-10
phase: plan
parent_cycle: component-split-round-1 (PR #23)
revision: α (스플릿 시점)
status: draft
---

# Plan — asca-test-suite-debt (rev α)

## §0. 컨텍스트

- PR #23 (`chore/component-split-round-1`)에서 Code Quality 차단 해소 후
  Tests/E2E 가 여전히 fail.
- main 브랜치 b08a354 head CI(2026-05-09)에서 동일한 8개 Jest test file + E2E
  chromium 모두 fail 확인.
- ⇒ 본 PR과 무관한 **pre-existing test-suite debt**. 분리 사이클로 이관.

## §1. 목표 (success criteria)

- 아래 8개 Jest test file 전부 GREEN 또는 명시적 skip 사유 문서화
- E2E chromium suite GREEN (또는 차단 root cause 식별)
- main CI (CI/CD Pipeline + E2E Tests) → success
- PR #23 unblock (Build/Deploy 진입 가능)

## §2. 차단 목록 (main b08a354 + PR #23 caf6fa9 동일)

### Tests (Jest, Run unit tests)

| #   | File                                                         | 추정 원인                                                 |
| --- | ------------------------------------------------------------ | --------------------------------------------------------- |
| 1   | `app/api/members/[id]/__tests__/route.test.ts`               | route handler 500 분기 mock 누락                          |
| 2   | `lib/realtime/__tests__/websocket-manager.test.ts`           | OOM 가능성, 사전 분석 필요                                |
| 3   | `lib/realtime/__tests__/e2e-flow.test.ts`                    | `Cannot read properties of undefined (reading 'payload')` |
| 4   | `app/api/realtime/__tests__/sse-route.test.ts`               | Error Handling assertion 미스                             |
| 5   | `lib/realtime/__tests__/sse-manager.test.ts`                 | Error Handling 분기                                       |
| 6   | `lib/realtime/__tests__/event-emitter.test.ts`               | Jest worker OOM (`v8 OOMErrorHandler`)                    |
| 7   | `lib/repositories/__tests__/base.repository.test.ts` (61s)   | repository mock 또는 OOM                                  |
| 8   | `lib/repositories/__tests__/member.repository.test.ts` (76s) | repository mock 또는 OOM                                  |

### E2E (Playwright chromium)

- `Run E2E Tests (chromium)` job 전체 fail. 상세 분석 별도 do 단계.

## §3. Root Cause 가설

1. **Jest worker heap OOM** (`v8 OOMErrorHandler` 로그 확인) — node 20.20.2
   default heap 부족. realtime/\* 6 file 중 다수가 동일 worker 점유 가능.
2. **realtime payload undefined** — fixture 또는 mock event-emitter 변경 회귀.
3. **route 500 mock 미흡** — Supabase mock chain 의 `.eq().single()` 에서 error
   분기가 reject 되지 않음.
4. **member.repository 76초 timeout** — DB fixture 누수 또는 무한 retry.

## §4. 작업 분해 (do 후보)

- T1: Jest 메모리 옵션 보강 (`--max-old-space-size=4096`, `maxWorkers=2`) →
  realtime 6 file 단독 실행으로 OOM 재현/분리
- T2: realtime event-emitter fixture 회귀 bisect
- T3: route.test.ts Error Handling 3건 mock 보완
- T4: repository 2 file 타임아웃 root cause (drizzle mock vs real client)
- T5: E2E chromium 차단 1건 트리아지 (Playwright trace 첨부)

## §5. 비범위 (out of scope)

- component-split (Phase 2~4) — `component-split-round-2` 등 별도 사이클
- CodeRabbit 스타일 코멘트 (PR #23 내부 이슈)

## §6. 의존성 / 차단

- 본 사이클 시작 전 PR #23 머지 여부 무관 (test-suite debt 는 main 자체 이슈)
- Vercel preview / Security Audit / Code Quality 와 독립

## §7. 다음 단계

- design 문서: 8 file 별 root cause 표 + fix pattern 후보
- mini-do: T1 (Jest worker 옵션) 단독 시도로 OOM 만 분리되는지 검증

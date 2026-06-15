---
template: report
feature: asca-jest-teardown-leak
date: 2026-06-15
author: jaehong
project: ASCA (my-v0-project)
status: completed
matchRate: 100
pr: 38
mergeCommit: 3579151b
---

# asca-jest-teardown-leak 완료 보고서

> **Match Rate**: 100% · **PR**: #38 (squash `3579151b`) · **CI**: 전 job green
> (Code Quality·Tests·Security·E2E·Build) **Source**: `/check`(2026-06-13)
> test:ci 경고 · `jest --detectOpenHandles`(2026-06-14)

---

## 1. 요약

`npm run test:ci` 매 실행마다 나오던 **"A worker process has failed to exit
gracefully ... improper teardown"** 경고(잠재 CI flaky)를 제거했다. 근본 원인은
`StructuredLogger`의 처리 `setInterval`이 모듈 import 시 켜지고 테스트 teardown
후에도 살아 있어 jest가 종료를 못 하던 것. interval에 `.unref()`를 호출해
타이머가 프로세스 종료를 막지 않게 했다. 프로덕션 동작은 무변경.

## 2. 근본 원인 (검증)

`jest --detectOpenHandles` 결과 **6개 open handle 전부 동일** —
`lib/logging/structured-logger.ts:397` `startProcessing()`의
`setInterval(processQueue, 100ms)`.
`export const logger = StructuredLogger.getInstance()`(435)가 모듈 import 시점에
인스턴스화되어, `logger`를 (transitive) import하는 테스트(`graphql/route.test`,
`member.service.test`, `response.test` 등)에서 타이머가 안 꺼졌다. child
logger도 동일 경로.

## 3. 변경

| 파일                               | 변경                                                                                                                                                          |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `lib/logging/structured-logger.ts` | `startProcessing()`의 interval 생성 직후 `if (typeof this.processingInterval.unref === 'function') this.processingInterval.unref()` 추가 (브라우저 안전 가드) |

**기능 코드 1파일** (+ PDCA 문서). `startProcessing` 단일 경로라 singleton +
child logger 일괄 해결.

## 4. 성공기준 달성

| #    | 목표                 |                              결과                               |
| ---- | -------------------- | :-------------------------------------------------------------: |
| SC-1 | 핸들 누수 제거       |   ✅ `--detectOpenHandles` "open handles" 메시지 소멸 (6 → 0)   |
| SC-2 | force-exit 경고 소멸 |                  ✅ `test:ci` 경고 0 · exit 0                   |
| SC-3 | 회귀 0               | ✅ 389 pass · tsc 0 · lint 0 errors (10 max-lines warning 불변) |
| SC-4 | 프로덕션 무변경      |            ✅ unref 가드 1블록만, 큐/주기 동작 동일             |
| CI   | 전 job green         |          ✅ Code Quality·Tests·Security·E2E·Build pass          |

## 5. 학습

- **`.unref()`는 Node 타이머 누수 표준 처방**: 모듈-로드 시 켜지는
  인터벌/타이머가 jest "worker failed to exit gracefully"를 유발할 때,
  테스트마다 teardown 훅을 다는 것보다 소스에서 `.unref()` 한 번이
  근본적·일괄적. 프로덕션 무영향(실행 중 동작 유지, 종료만 비차단).
- **CI Code Quality = `prettier --check .`** 이 docs 포함 전 파일을 검사 → PDCA
  plan/report 등 신규 마크다운도 `prettier --write` 필요(아니면 Code Quality
  red). 로컬 `npm run format:check`로 사전 확인.
- 부수 확인: **E2E(chromium) CI green** — #37 "stabilize ... E2E workflow"로
  기존 Clerk-키 블로커가 해소된 것으로 보임(asca-e2e-clerk-unblock 후보 재평가
  가능).

## 6. Out of Scope / 후속

- child logger 라이프사이클 리팩터·테스트 teardown 훅 (unref로 불요)
- `asca-e2e-clerk-unblock` — E2E가 이미 green이라 **후보 재평가/폐기 가능**
- component-split Phase 3-4 (max-lines 10건, 별 사이클)

---

## Version History

| Ver | Date       | Changes                                                            | Author  |
| --- | ---------- | ------------------------------------------------------------------ | ------- |
| 1.0 | 2026-06-15 | 완료 보고서. PR #38 squash `3579151b`, CI 전 job green, Match 100% | jaehong |

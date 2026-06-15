---
template: plan (lean)
feature: asca-jest-teardown-leak
date: 2026-06-14
author: jaehong
project: ASCA (my-v0-project)
status: draft
---

# asca-jest-teardown-leak Plan

> **Summary**: jest가 매 `test:ci` 실행마다 "A worker process has failed to exit
> gracefully ... improper teardown" 경고를 내는 **open-handle 누수**를
> 결정적으로 제거한다. 근본 원인은 `StructuredLogger`의 `setInterval`이 모듈
> import 시 켜지고 테스트에서 안 꺼지는 것. **CI flaky 잠재 요인**(force-exit가
> 간헐 타이밍 이슈로 번질 수 있음, smart-quote dashboard-test-flakiness와 동일
> 클래스 — [[feedback_partial_hook_mock_teardown_flaky]]). **PDCA Phase**: Plan
> · **Source**: `/check`(2026-06-13) test:ci 경고 +
> `jest --detectOpenHandles`(2026-06-14)

---

## 1. 근본 원인 (검증됨 — `--detectOpenHandles` 6 handles 전부 동일)

```
StructuredLogger.startProcessing  lib/logging/structured-logger.ts:397
  this.processingInterval = setInterval(() => this.processQueue(), 100)
```

연쇄:

- `lib/logging/structured-logger.ts:435`
  `export const logger = StructuredLogger.getInstance()` → **모듈 import
  시점**에 인스턴스화
- → `private constructor`(156)가 `this.startProcessing()`(172) 호출 →
  `setInterval(…, 100ms)`(397)
- → `logger`를 (직접/transitive) import하는 모든 테스트에서 인터벌이 살아 있어
  jest가 종료 못 함 → force-exit 경고
- child logger(`new StructuredLogger`, 291)도 동일 인터벌 생성
- 이미 `clearInterval` 정리 코드(321-323, `destroy`/flush 류)는 있으나
  **테스트에서 호출되지 않음**

누수 확인 테스트(예): `app/api/graphql/__tests__/route.test.ts:70`,
`lib/services/__tests__/member.service.test.ts:15`,
`lib/api/__tests__/response.test.ts:13` 등.

---

## 2. Scope

### In Scope

- [ ] `lib/logging/structured-logger.ts` `startProcessing()`의 interval을
      **`.unref()`** 처리 → 이벤트 루프가 이 타이머로 프로세스를 붙잡지 않게 함
      (프로덕션: 앱이 살아있는 동안 인터벌은 그대로 동작, 종료만 안 막음)
- [ ] 브라우저-안전 가드 (브라우저 `setInterval` 반환값엔 `.unref` 없음) —
      optional 호출
- [ ] 검증: `jest --detectOpenHandles`에서 StructuredLogger 핸들 0, `test:ci`
      경고 소멸 + exit 0, 전체 389 green

### Out of Scope (별도/불요)

- child logger 라이프사이클 리팩터·테스트-side `afterAll(stop)` 훅 (unref면
  불요)
- 프로덕션 로깅 동작 변경 (인터벌 주기·큐 처리 로직 그대로)
- max-lines component-split (별 사이클)

---

## 3. 수정 방향 (R-1)

```ts
// startProcessing() 내부
this.processingInterval = setInterval(() => {
  this.processQueue()
}, 100)
// 추가: 테스트/CLI가 이 타이머 때문에 종료 못 하는 것 방지 (프로덕션 무영향)
this.processingInterval?.unref?.()
```

| 옵션                                     | 채택 | 사유                                                                                |
| ---------------------------------------- | :--: | ----------------------------------------------------------------------------------- |
| **(a) `.unref()`**                       |  ✅  | 1줄·프로덕션 동작 무변경·모든 누수 테스트 일괄 해결. Node 타이머 표준 패턴          |
| (b) `NODE_ENV==='test'`면 interval skip  |  ✗   | 테스트서 큐 자동처리 안 됨 → 로깅 의존 테스트 영향 가능 + 프로덕션 코드에 test 분기 |
| (c) 테스트마다 `afterAll(logger.stop())` |  ✗   | 다수 테스트 파일 수정·누락 위험. unref가 근본적                                     |

> `.unref()`는 프로덕션에서 "앱이 종료될 때 이 인터벌이 종료를 지연시키지
> 않는다"만 의미 — 정상 실행 중엔 100ms 큐 처리 그대로 동작. child logger도 같은
> `startProcessing` 경유라 한 번 수정으로 커버.

---

## 4. Success Criteria

| #    | 목표                 | 측정                                                                     |
| ---- | -------------------- | ------------------------------------------------------------------------ |
| SC-1 | 핸들 누수 제거       | `jest --detectOpenHandles`에서 StructuredLogger setInterval 핸들 **0**   |
| SC-2 | force-exit 경고 소멸 | `test:ci` 로그에 "worker ... failed to exit gracefully" **없음**, exit 0 |
| SC-3 | 회귀 0               | 전체 test:ci 389 pass·커버리지 임계 통과, tsc 0·lint 0 errors            |
| SC-4 | 프로덕션 무변경      | 로깅 큐/주기 동작 동일 (코드 diff = unref 1줄 + 가드)                    |

---

## 5. Risks

| 리스크                               | 완화                                                                                                                                |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| 브라우저 환경에서 `.unref` undefined | optional 호출 `?.unref?.()`                                                                                                         |
| unref로 프로덕션 로그 유실?          | ❌ 아님 — unref는 종료 지연만 해제, 실행 중 동작 무변경. (앱 종료 시 마지막 큐 flush는 기존 destroy/clearInterval(321) 경로가 담당) |
| 다른 누수원 잔존                     | detectOpenHandles 재실행으로 StructuredLogger 외 핸들 0 확인                                                                        |

---

## 6. Next

1. `/pdca do asca-jest-teardown-leak` — `startProcessing()` unref 1줄 →
   `jest --detectOpenHandles` 0 핸들 + `test:ci` 경고 소멸 확인 → PR
2. Design 생략 권고 (1줄 fix, 근본원인 명확)

## Version History

| Ver | Date       | Changes                                                                                      | Author  |
| --- | ---------- | -------------------------------------------------------------------------------------------- | ------- |
| 0.1 | 2026-06-14 | 최초. detectOpenHandles로 근본원인(StructuredLogger setInterval 미해제) 확정, R-1=`.unref()` | jaehong |

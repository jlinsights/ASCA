# asca-schema-unification Planning Document

> **Summary**: `lib/db/schema.ts`(정본)와 `lib/db/schema-pg.ts`(드리프트 사본,
> 825줄)의 이원화를 해소한다. 두 파일의 유일한 차이는 timestamp 컬럼의
> `{ mode: 'string' }` 여부(diff 186줄 전수 확인)이며, 동일 물리 DB에 대해
> Date/string 두 타입 체계가 병존해 타입 불일치 버그 위험이 상존한다.
>
> **Project**: ASCA (Next.js 14 + Supabase + Drizzle) **Author**: Claude (PDCA
> plan) **Date**: 2026-07-25 **Status**: Draft

---

## 1. Overview

### 1.1 Purpose

DB 스키마 정의를 `lib/db/schema.ts` 단일 소스로 통합하고 `schema-pg.ts`를
제거한다. 물리 스키마 변경은 없다(마이그레이션 0건) — 순수 타입/import 정리
사이클이다.

### 1.2 Background

- 출처: 2026-07-25 `/code_analysis` 품질 차원 High 발견 → 실측 검증 완료.
- **차이의 본질**: diff 186줄 전부가 `timestamp('…')` vs
  `timestamp('…', { mode: 'string' })` 패턴. 24개 pgTable 정의는 동일.
  - `schema.ts` → timestamp가 JS `Date` 반환 (Drizzle 기본)
  - `schema-pg.ts` → timestamp가 ISO `string` 반환
- **정본 근거 3중 확인**:
  1. `drizzle.config.ts:7` → `schema: './lib/db/schema.ts'` (마이그레이션 기준)
  2. `lib/db/index.ts:4` → `db` 인스턴스가 `schema.ts`로 초기화 (런타임 기준)
  3. `docs/CLAUDE.md` "Database Changes: Modify schema in `lib/db/schema.ts`
     (not schema-pg.ts)" (프로젝트 규칙)
- **현존 위험**: `artist.repository.ts` 등은 `schema-pg` 타입(string)을
  선언하지만 실제 `db` 인스턴스는 `schema.ts` 기준으로 `Date`를 반환 — 타입이
  런타임을 거짓 기술하는 상태.

### 1.3 Related Documents

- 분석 발원: 세션 Task #3 (2026-07-25 /code_analysis, 품질 6.5/10 High #1)
- `docs/CLAUDE.md` §Critical Development Guidelines → Database Changes

---

## 2. Scope

### 2.1 In Scope

`schema-pg` import 6개 파일 전환 + `schema-pg.ts` 삭제:

- [ ] S-1 `app/api/members/route.ts` — E2E 브랜치 + GET 쿼리에서 members 테이블
      참조. Date→string 직렬화 경계 확인(JSON 응답은 자동 ISO 직렬화라 대부분
      무해 예상)
- [ ] S-2 `lib/supabase.ts` — 사용 형태 실사 후 전환
- [ ] S-3 `lib/repositories/artist.repository.ts` — string 가정 코드 유무 실사
      (`.split('T')`, 문자열 비교 등 패턴 grep)
- [ ] S-4 `lib/graphql/resolvers/types.resolver.ts` — GraphQL 직렬화 경계에서
      Date→ISO 변환 명시 여부 확인
- [ ] S-5 `lib/repositories/__tests__/base.repository.test.ts` — import만 전환
      (jest 격리 유지, 격리 해제는 별도 부채 사이클)
- [ ] S-6 `lib/services/__tests__/member.service.test.ts` — fixture 타입 전환
- [ ] S-7 `lib/db/schema-pg.ts` 삭제 + 전 소스 `schema-pg` 참조 0건 확인
- [ ] S-8 (파생) `E2EMember` 등 string 타입 기대 지점의 명시적 `.toISOString()`
      경계 보정

### 2.2 Out of Scope

- 물리 DB 스키마 변경·마이그레이션 (0건이어야 함 — 성공 기준으로 검증)
- timestamp `mode: 'string'` 전역 채택안 (기각 — §3)
- jest 격리 부채 해제 (base.repository·member.repository 테스트는 기존 격리
  사이클 소관)
- `lib/db/index.ts`의 배럴 세분화 (분석 Medium, 별도 후보)

---

## 3. Options Analysis

| 옵션                                        | 영향 범위                 | 판정        |
| ------------------------------------------- | ------------------------- | ----------- |
| **A. schema.ts(Date) 정본, schema-pg 삭제** | import 6파일              | ✅ **채택** |
| B. mode:'string' 전역 채택                  | import 27파일 + 런타임    | ❌ 기각     |
| C. 현상 유지 + 주석 경고                    | 0파일, 드리프트 위험 지속 | ❌ 기각     |

- A 채택 근거: 정본 3중 확인(§1.2)과 영향 최소(6 vs 27파일). 마이그레이션·런타임
  이 이미 schema.ts 기준이므로 순수 타입 정리로 완결.
- B 기각: `.getTime()` 등 Date 연산 사용처 27파일 전수 실사 필요 + 런타임 동작
  변경 위험. 이득 없음.
- C 기각: 다음 스키마 변경 시 이중 수정 강제 — 드리프트 재발 구조 존치.

## 4. Success Criteria

- [ ] `lib/db/schema-pg.ts` 삭제, `schema-pg` 참조 전 소스 grep 0건
- [ ] `npm run type-check` 0 에러 / `npm run lint` 통과 / `format:check` 통과
- [ ] `npm run test:ci` 전체 GREEN (421+)
- [ ] `npm run build` 통과
- [ ] `npx drizzle-kit generate` 신규 마이그레이션 0건 (물리 스키마 무변화 증명)

## 5. Risks & Mitigation

| 위험                                              | 완화                                                                         |
| ------------------------------------------------- | ---------------------------------------------------------------------------- |
| schema-pg 사용처의 string 가정 코드가 Date 수신   | Design 단계에서 6파일 전수 실사(문자열 메서드 호출 grep) 후 경계 보정        |
| JSON 직렬화 경계 밖(내부 로직)에서 타입 차이 노출 | tsc가 Date/string 불일치를 컴파일 타임에 전부 검출 — type-check 0을 게이트로 |
| 격리 테스트 수정이 격리 해제로 오인될 여지        | S-5·S-6은 import/타입만 수정, jest.config 격리 목록 불변 명시                |

## 6. Phases

| Phase | 내용                                               | 산출물      |
| ----- | -------------------------------------------------- | ----------- |
| 1     | Design: 6파일 사용 형태 실사 + 경계 보정 지점 확정 | design.md   |
| 2     | Do: import 전환 → 경계 보정 → schema-pg.ts 삭제    | 코드 변경   |
| 3     | Check: 게이트 5종(§4) + gap 분석                   | analysis.md |

**Estimated Effort**: 2~3h (단일 PR)

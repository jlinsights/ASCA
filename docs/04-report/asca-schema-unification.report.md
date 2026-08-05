# asca-schema-unification Completion Report

> **결과**: ✅ Match Rate 100% (9/9, Gap 0) — 게이트 6종 전부 GREEN
>
> **기간**: 2026-07-25 (단일 세션, 예상 2~3h 내 완료) **PDCA**: Plan → Design →
> Do → Check 완주

---

## 1. 무엇을 했나

`lib/db/schema.ts`(정본)와 `lib/db/schema-pg.ts`(825줄 드리프트 사본)의 이원화를
해소했다. 두 파일의 유일한 차이는 timestamp 컬럼의 `{ mode: 'string' }`
여부(diff 186줄 전수 확인)였으며, schema-pg import 6개 파일을 정본으로 전환하고
schema-pg.ts를 삭제했다. 물리 DB 변경 0건.

## 2. 핵심 설계 결정과 근거

- **옵션 A(schema.ts 정본) 채택**: 정본 3중 확인 — drizzle.config.ts:7(마이그레
  이션), lib/db/index.ts:4(db 런타임), docs/CLAUDE.md(프로젝트 규칙). 영향 6파일
  vs 옵션 B(mode:'string' 전역) 27파일.
- **D-1 `Serialized<T>` 경계 타입**: 실사에서 supabase-js(PostgREST)는
  timestamptz를 **ISO string으로 반환**함을 확인 — schema-pg가 존재했던 실제
  이유로 추정. 단순 전환 시 supabase-js 경로에 역방향 타입 거짓말이 생기므로,
  lib/supabase.ts 재export 9종을 분배 조건부 타입
  (`SerializedValue<V> = V extends Date ? string : V`)으로 감싸 소비처
  4파일(admin-api·artists 페이지 3)의 문자열 계약을 무수정 유지했다.
- **기존 타입 거짓말 해소**: artist.repository.ts는 Drizzle db(Date 반환)를
  schema-pg 타입(string)으로 기술하던 상태 → 전환 자체가 수정.

## 3. 검증

| 게이트              | 결과                                      |
| ------------------- | ----------------------------------------- |
| schema-pg 참조 grep | 소스 0건                                  |
| type-check          | 0 에러 (경계 타입 무수정 호환 입증)       |
| lint / format:check | 통과                                      |
| test:ci             | 421/421 (24 스위트), jest 격리 목록 불변  |
| build               | Compiled successfully (86s)               |
| 물리 스키마 무변화  | schema.ts git 무수정 증명 (analysis §2-6) |

독립 gap-detector 검증: 9/9 ✅, Out-of-scope 침범 0.

## 4. 학습·부수 발견

- **supabase-js vs Drizzle 런타임 타입 차이**: 같은 테이블이라도 접근 경로에
  따라 timestamp가 string(PostgREST)/Date(Drizzle)로 갈린다. 이중 스키마 파일이
  아니라 **경계 매핑 타입**이 올바른 해법.
- **분리 부채 후보 `asca-drizzle-snapshot-drift`**: db:push 운영으로
  drizzle/meta 스냅샷이 stale — `drizzle-kit generate`가 기존 테이블 CREATE를
  재생성. 마이그레이션 이력 관리 도입 시 재베이스라인 필요 (analysis §3).

## 5. 잔여 절차

- 커밋/PR: 미커밋 상태 — `.commit_message.txt` 갱신 완료, 사용자 지시 대기
- `/pdca archive asca-schema-unification`: 커밋 포함 후 문서 4종 이관

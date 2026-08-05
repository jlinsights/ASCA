# asca-schema-unification Gap Analysis

> **Match Rate: 100% (9/9)** — Gap 0건. gap-detector 독립 검증(2026-07-25).
>
> **Design**: `docs/02-design/features/asca-schema-unification.design.md`
> **Date**: 2026-07-25 **Verdict**: report-ready (≥90%)

---

## 1. 항목별 검증 (gap-detector)

| 항목         | 검증 내용                                     | 결과 | 증거                                              |
| ------------ | --------------------------------------------- | ---- | ------------------------------------------------- |
| S-1          | members/route.ts schema import 전환           | ✅   | route.ts:16                                       |
| S-2          | supabase.ts Serialized 매핑 + 9종 재export    | ✅   | supabase.ts:123-136                               |
| S-3          | artist.repository.ts 2개 import 전환          | ✅   | artist.repository.ts:3-4                          |
| S-4          | types.resolver.ts 전환                        | ✅   | types.resolver.ts:3                               |
| S-5          | base.repository.test.ts 전환 + jest 격리 불변 | ✅   | test.ts:10 + jest.config.js:51-76 불변            |
| S-6          | member.service.test.ts 전환                   | ✅   | test.ts:14                                        |
| S-7          | schema-pg.ts 삭제 + 소스 참조 0건             | ✅   | 파일 부재 + grep 0건                              |
| Out-of-Scope | lib/db/index.ts·schema.ts·drizzle/ 미수정     | ✅   | git status 무변경                                 |
| 소비처       | admin-api.ts + app/artists/ 3파일 무손상      | ✅   | admin-api.ts:4-10, page.tsx:7, artist-card.tsx:10 |

## 2. 게이트 결과 (설계 §4)

1. ✅ `schema-pg` 소스 참조 grep 0건
2. ✅ `type-check` 0 에러 — Serialized 경계가 소비처 4파일과 무수정 호환
3. ✅ `lint` + `format:check` 통과
4. ✅ `test:ci` 421/421 GREEN (24 스위트)
5. ✅ `build` 통과 (86s, Compiled successfully)
6. ✅ 물리 스키마 무변화 — **증명 방식 보정**: `drizzle-kit generate`는
   마이그레이션 1건을 생성했으나, 이는 이 사이클과 무관한 **pre-existing 스냅샷
   드리프트**다(아래 §3). 이 사이클의 무변화 증명은 `lib/db/schema.ts` git
   무수정(drizzle.config의 유일한 입력)으로 성립. 생성물은 설계 D-3대로 폐기.

## 3. 부수 발견 — 분리 부채 후보

**asca-drizzle-snapshot-drift**: 저장소가 `db:push` 워크플로우로 운영되어
`drizzle/meta/` 스냅샷이 `schema.ts` 현재 상태보다 뒤처져 있음.
`drizzle-kit generate` 실행 시 `contest_results` 등 이미 push된 테이블의 CREATE
가 신규 마이그레이션으로 생성됨. 마이그레이션 파일 기반 이력 관리가 필요해지는
시점(스테이징 분리·CI 마이그레이션 게이트 등)에 스냅샷 재베이스라인 사이클 필요.
현 운영(push 단일 경로)에서는 무해.

## 4. 결론

설계 항목 S-1~S-7·D-1~D-4 전부 구현 일치, Out-of-scope 침범 0. **Match Rate 100%
≥ 90% → /pdca report 진행.**

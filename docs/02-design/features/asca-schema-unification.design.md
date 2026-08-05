# asca-schema-unification Design Document

> **Summary**: schema-pg import 6개 파일의 실사 결과에 근거한 전환 설계. 핵심
> 발견 — supabase-js 데이터 경로는 런타임이 ISO string이므로 단순 import 전환 시
> 새로운 타입 거짓말이 발생한다. `Serialized<T>` 매핑 타입으로 경계에서
> 변환하고, 나머지 5개 파일(Drizzle 런타임)은 단순 전환한다.
>
> **Plan**: `docs/01-plan/features/asca-schema-unification.plan.md` **Date**:
> 2026-07-25 **Status**: Confirmed

---

## 1. 실사 결과 (파일별 전환 전략)

| ID  | 파일                                                    | schema-pg 사용                                      | 런타임 소스           | 전환 전략                          |
| --- | ------------------------------------------------------- | --------------------------------------------------- | --------------------- | ---------------------------------- |
| S-1 | `app/api/members/route.ts:16`                           | `members` 테이블 (GET 쿼리·정렬·count)              | Drizzle `db` (Date)   | 단순 import 전환                   |
| S-2 | `lib/supabase.ts:4-11`                                  | 엔티티 타입 6종 → `ArtistRow` 등 재export(:121-131) | supabase-js (string!) | **`Serialized<T>` 매핑 타입 신설** |
| S-3 | `lib/repositories/artist.repository.ts:3-4`             | `artists` 테이블 + `Artist`/`NewArtist` 타입        | Drizzle `db` (Date)   | 단순 import 전환                   |
| S-4 | `lib/graphql/resolvers/types.resolver.ts:3`             | `import * as schema` (타입 참조)                    | GraphQL 스칼라        | 단순 import 전환                   |
| S-5 | `lib/repositories/__tests__/base.repository.test.ts:10` | `members` 테이블                                    | 실 DB (jest 격리 중)  | 단순 import 전환 (격리 불변)       |
| S-6 | `lib/services/__tests__/member.service.test.ts:14`      | `Member`/`NewMember` 타입                           | fixture               | 단순 import 전환                   |

### 실사 근거

- **S-1**: 실경로 타임스탬프 사용은 `members.joinDate` 컬럼 참조(정렬)뿐. E2E
  브랜치는 자체적으로 `new Date().toISOString()` 문자열 생성 — 스키마 타입 무관.
  JSON 응답은 `NextResponse.json`이 Date를 ISO 문자열로 자동 직렬화.
- **S-2**: 재export 소비처 4파일 확인 — `lib/admin-api.ts`(supabase-js로
  fetch/insert, `created_at: new Date().toISOString()` **문자열 기록**),
  `app/artists/{page,[id]/page,_components/artist-card}.tsx`. supabase-js는
  timestamptz를 **string으로 반환**하므로 string 타입이 런타임 정확 —
  schema-pg가 존재했던 실제 이유로 추정. Date 타입 강제 시 역방향 타입 거짓말.
- **S-3**: `createdAt` 사용은 `desc(artists.createdAt)` orderBy 컬럼 참조
  2건(:30·:44)뿐 — 값 수준 문자열 연산 없음. 현재가 타입 거짓말 상태(런타임
  Date, 타입 string)이므로 전환이 곧 수정.
- **S-4**: DateTime 스칼라 serialize가
  `value instanceof Date ? value.toISOString()` 분기 기보유(:423-429) —
  Date/string 모두 수용.
- **S-6**: fixture에 타임스탬프 필드 없음 (`created_at|updatedAt` grep 0건).

## 2. 설계 결정

- **D-1 `Serialized<T>` 매핑 타입**: supabase-js 경계 전용.

  ```typescript
  // 분배 조건부 타입 — Date | null → string | null, Date | undefined → string | undefined 자동 처리
  type SerializedValue<V> = V extends Date ? string : V
  type Serialized<T> = { [K in keyof T]: SerializedValue<T[K]> }
  ```

  `lib/supabase.ts`에서 `schema.ts` 타입을 감싸 기존 재export 계약(문자열
  타임스탬프)을 유지: `export type ArtistRow = Serialized<Artist>` 등 9종.

- **D-2 Serialized 정의 위치**: `lib/supabase.ts` 로컬 정의. 소비처가 이 파일의
  재export뿐이므로 별도 유틸 파일은 YAGNI. 제2 소비처 등장 시 `lib/db/`로 승격.

- **D-3 물리 스키마 무변화 증명**: `npx drizzle-kit generate`가 신규
  마이그레이션 0건이어야 함. `{ mode: 'string' }`은 TS 타입 매핑일 뿐 DDL
  무관이므로 0건이 기대값 — 아니면 즉시 중단·원인 규명.

- **D-4 구현 순서**: 단순 전환(S-3→S-4→S-1→S-5→S-6) → S-2(Serialized) →
  S-7(schema-pg.ts 삭제 + grep 0 확인) → 게이트 5종. 각 단계 후 tsc 확인.

## 3. Out of Scope 재확인

- jest 격리 목록(`jest.config.js:67-68`) 불변 — S-5는 import 라인만 변경
- `lib/db/index.ts` 배럴 구조 불변
- DDL·마이그레이션·시드 불변

## 4. 검증 계획 (Check 게이트)

1. `grep -rn "schema-pg"` 전 소스 0건 (문서 제외)
2. `npm run type-check` 0 에러
3. `npm run lint` + `format:check` 통과
4. `npm run test:ci` 421+ GREEN
5. `npm run build` 통과
6. `npx drizzle-kit generate` 마이그레이션 0건 (생성물 즉시 폐기)

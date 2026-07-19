import { NextResponse } from 'next/server'

/**
 * HTTP 마이그레이션 엔드포인트 공통 가드.
 *
 * 배경:
 * - `/api/migration/*` POST는 인증 없이 Airtable→DB 쓰기가 가능해 보안 위험이 큼
 * - `migrate-all`은 이미 503으로 비활성화됨
 * - `test-single`의 `artists[0]`는 `noUncheckedIndexedAccess` 하에서 `T | undefined`
 *   → 길이 체크만으로는 TypeScript가 좁히지 못해 Vercel 빌드가 실패했음
 *
 * 정책: HTTP 마이그레이션은 CLI 또는 `/api/secure/migration/*`(관리자 인증)만 허용
 */
export const HTTP_MIGRATION_DISABLED_AT = '2026-07-19'

export function disabledMigrationResponse(endpoint: string, secureAlternative?: string) {
  return NextResponse.json(
    {
      success: false,
      message: 'SECURITY: Migration endpoint permanently disabled',
      reason:
        'Public /api/migration/* endpoints are disabled. Use CLI scripts under tools/scripts, or authenticated /api/secure/migration/*.',
      endpoint,
      secureAlternative: secureAlternative ?? null,
      disabledAt: HTTP_MIGRATION_DISABLED_AT,
      contact: 'Contact system administrator',
    },
    { status: 503 }
  )
}

/**
 * `noUncheckedIndexedAccess` 환경에서 배열 첫 요소를 안전하게 꺼냅니다.
 * `items.length > 0` 체크만으로는 `items[0]`이 여전히 `T | undefined`입니다.
 */
export function getFirstOrNull<T>(items: readonly T[]): T | null {
  const first = items[0]
  return first === undefined ? null : first
}

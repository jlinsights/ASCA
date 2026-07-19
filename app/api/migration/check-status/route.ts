import { NextRequest } from 'next/server'
import { disabledMigrationResponse } from '@/lib/migration/http-migration-guard'

/**
 * 공개 마이그레이션 상태 API — 비활성화.
 * Airtable 레코드 수는 인증된 `/api/secure/migration/check-status`를 사용하세요.
 */
export async function GET(_request: NextRequest) {
  return disabledMigrationResponse(
    '/api/migration/check-status',
    '/api/secure/migration/check-status'
  )
}

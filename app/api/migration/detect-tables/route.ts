import { NextRequest } from 'next/server'
import { disabledMigrationResponse } from '@/lib/migration/http-migration-guard'

/**
 * 공개 테이블 탐지 API — 비활성화.
 * 스키마 프로빙은 인증된 `/api/secure/migration/detect-tables`를 사용하세요.
 */
export async function GET(_request: NextRequest) {
  return disabledMigrationResponse(
    '/api/migration/detect-tables',
    '/api/secure/migration/detect-tables'
  )
}

import { NextRequest } from 'next/server'
import { disabledMigrationResponse } from '@/lib/migration/http-migration-guard'

/**
 * Events Airtable→DB 마이그레이션 HTTP 엔드포인트.
 * 인증 없는 쓰기 API라 보안상 영구 비활성화합니다.
 */
export async function POST(_request: NextRequest) {
  return disabledMigrationResponse('/api/migration/events')
}

import { NextRequest } from 'next/server'
import { disabledMigrationResponse } from '@/lib/migration/http-migration-guard'

/**
 * 단일 아티스트 마이그레이션 테스트 엔드포인트.
 *
 * 과거 빌드 실패 원인:
 * `const firstArtist = artists[0]` → `noUncheckedIndexedAccess`에서 possibly undefined
 * (배열 length 체크만으로는 타입 좁히기가 되지 않음)
 *
 * 현재: HTTP 마이그레이션 정책에 따라 영구 비활성화.
 * 필요 시 CLI 스크립트 또는 `/api/secure/migration/*`를 사용하세요.
 */
export async function POST(_request: NextRequest) {
  return disabledMigrationResponse('/api/migration/test-single')
}

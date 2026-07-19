#!/usr/bin/env node

/**
 * Events & Notices 마이그레이션 안내
 *
 * 공개 `/api/migration/events|notices`는 비활성화되었습니다.
 */

console.log('🧪 Events & Notices 마이그레이션 안내\n')
console.log('⛔ 공개 HTTP 엔드포인트 비활성화:')
console.log('   POST /api/migration/events  → 503')
console.log('   POST /api/migration/notices → 503\n')

console.log('✅ 권장 경로:')
console.log('   - CLI: node tools/scripts/direct-migration.js')
console.log('   - Secure API: POST /api/secure/migration/migrate-all (system/admin)')
console.log('   - 상태 확인: GET /api/secure/migration/check-status (admin)\n')

console.log('참고: events/notices 단독 HTTP 마이그레이션은 더 이상 제공하지 않습니다.')

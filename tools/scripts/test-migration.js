#!/usr/bin/env node

/**
 * 마이그레이션 테스트 안내 스크립트
 *
 * 공개 `/api/migration/*` POST/GET는 보안상 비활성화되었습니다.
 * 실제 실행은 CLI 또는 인증된 `/api/secure/migration/*`를 사용하세요.
 */

console.log('🧪 ASCA 마이그레이션 안내\n')
console.log('⛔ 공개 HTTP 마이그레이션 엔드포인트는 비활성화되었습니다.')
console.log('   - /api/migration/migrate-all → 503')
console.log('   - /api/migration/events|notices|test-single → 503')
console.log('   - /api/migration/check-status|detect-tables → 503\n')

console.log('✅ 권장 경로:')
console.log('   1) CLI 스크립트:')
console.log('      node tools/scripts/direct-migration.js')
console.log('      node tools/scripts/check-migration-status.js')
console.log('   2) 인증된 Secure API (관리자 세션 필요):')
console.log('      GET  /api/secure/migration/check-status')
console.log('      GET  /api/secure/migration/detect-tables')
console.log('      POST /api/secure/migration/migrate-all\n')

console.log('🔐 Secure API는 createAdminAPI / createSystemAPI로 보호됩니다.')
console.log('   브라우저 관리자 세션 또는 유효한 admin 인증 헤더가 필요합니다.')

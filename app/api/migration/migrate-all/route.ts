import { NextRequest } from 'next/server'
import { disabledMigrationResponse } from '@/lib/migration/http-migration-guard'

// SECURITY: Endpoint permanently disabled — migration should use CLI scripts, not HTTP endpoints.
// Use CLI under tools/scripts, or /api/secure/migration with admin auth.
// Disabled: 2025-07-12 | Reviewed: 2026-07-19

export async function POST(_request: NextRequest) {
  return disabledMigrationResponse('/api/migration/migrate-all')
}

import { NextRequest, NextResponse } from 'next/server'

// SECURITY: Endpoint permanently disabled — migration should use CLI scripts, not HTTP endpoints.
// Use `npm run db:migrate:run` for migrations instead.
// Disabled: 2025-07-12 | Reviewed: 2026-03-28

export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      success: false,
      message: 'SECURITY: Migration endpoint temporarily disabled',
      reason: 'This endpoint is disabled. Requires implementation of Admin Role check.',
      disabledAt: '2025-07-12',
      contact: 'Contact system administrator'
    },
    { status: 503 } // Service Unavailable
  )
} 
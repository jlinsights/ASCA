import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      success: false,
      message: 'SECURITY: Events migration endpoint permanently disabled',
      reason: 'Run Airtable migrations through CLI or administrator-internal jobs, not public HTTP.',
      disabledAt: '2026-05-03',
      contact: 'Contact system administrator',
    },
    { status: 503 }
  )
}

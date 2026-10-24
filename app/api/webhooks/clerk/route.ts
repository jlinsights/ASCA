import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json({ error: 'CLERK_WEBHOOK_RETIRED' }, { status: 410 })
}

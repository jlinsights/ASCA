import { NextRequest, NextResponse } from 'next/server'
import { archiveIdentity } from '@/lib/archive/writer'
import { catalogQuoteEnabled } from '@/lib/catalog-quote/feature-flag'
import { computeInternalCost } from '@/lib/catalog-quote/internal-cost'

export const dynamic = 'force-dynamic'
const headers = { 'Cache-Control': 'private, no-store', Vary: 'Cookie' }
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers })

// 도록 원가·손익 — 관리자(MFA 완료)만. 금액을 로그에 남기지 않는다.
export async function POST(request: NextRequest) {
  if (!catalogQuoteEnabled()) return new NextResponse(null, { status: 404, headers })
  const identity = await archiveIdentity()
  if (!identity) return json({ error: 'Authentication required', code: 'UNAUTHORIZED' }, 401)
  if (!identity.admin) return json({ error: 'Admin only', code: 'FORBIDDEN' }, 403)
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return json({ ok: false, error: 'INVALID_INPUT' }, 400)
  }
  const result = computeInternalCost(body)
  return json(result, result.ok ? 200 : 422)
}

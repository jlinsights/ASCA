import { NextRequest, NextResponse } from 'next/server'
import { computeQuote } from '@/lib/catalog-quote/calculate'
import { canViewCatalogQuotePreview } from '@/lib/catalog-quote/preview-access'

export const dynamic = 'force-dynamic'
const headers = { 'Cache-Control': 'private, no-store', Vary: 'Cookie' }

// 종이 도록 가견적 — 입력만 받아 서버에서 정책으로 다시 계산한다(클라이언트 단가는 받지 않는다).
// 원가·손익은 이 응답에 없다. 기본 비활성이며, 켜도 MFA 관리자 외에는 404.
export async function POST(request: NextRequest) {
  if (!(await canViewCatalogQuotePreview()))
    return new NextResponse(null, { status: 404, headers: { ...headers, Vary: 'Cookie' } })
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { ok: false, status: 'invalid', errors: ['INVALID_INPUT'] },
      { status: 400, headers }
    )
  }
  const result = computeQuote(body)
  return NextResponse.json(result, {
    status: result.ok || result.status === 'separateQuote' ? 200 : 422,
    headers,
  })
}

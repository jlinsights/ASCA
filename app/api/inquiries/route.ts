import { NextRequest, NextResponse } from 'next/server'
import { archiveWriter } from '@/lib/archive/writer'
import { MAX_INQUIRY_BYTES, inquirySubmissionSchema, toInquiryRow } from '@/lib/inquiries/schema'
import { checkOrigin } from '@/lib/security/origin-check'
import { rateLimit } from '@/lib/security/rate-limit'
import { log } from '@/lib/utils/logger'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const headers = { 'Cache-Control': 'no-store' }
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers })

/**
 * 문의서 접수 — 로그인 없이 누구나. 막는 순서: 출처 → 속도 → 크기 → 검증 → 덫 칸.
 * 저장은 service_role 로만(표는 anon·authenticated 에게 닫혀 있다).
 * 실패하면 화면이 메일·카카오톡 보내기로 안내한다 — 여기서는 코드만 돌려준다.
 */
export async function POST(request: NextRequest) {
  try {
    if (!checkOrigin(request).ok) return json({ code: 'ORIGIN' }, 403)
  } catch (error) {
    // 운영에서 허용 출처 환경변수가 비면 checkOrigin 이 던진다 — 받지 않고 닫는다
    log.error('inquiry origin check misconfigured', error)
    return json({ code: 'UNAVAILABLE' }, 503)
  }

  const limited = await rateLimit({ maxRequests: 5, windowMs: 10 * 60_000 }).check(request)
  if (limited) return limited

  const length = Number(request.headers.get('content-length'))
  if (!Number.isFinite(length) || length <= 0 || length > MAX_INQUIRY_BYTES)
    return json({ code: 'SIZE' }, 413)

  const raw = await request.json().catch(() => null)
  const parsed = inquirySubmissionSchema.safeParse(raw)
  if (!parsed.success) return json({ code: 'INVALID' }, 400)

  // 덫 칸이 채워졌으면 저장하지 않되, 봇이 알아채지 못하게 성공처럼 답한다
  if (parsed.data.website) return json({ ok: true, id: null }, 201)

  try {
    const { data, error } = await archiveWriter()
      .from('inquiries')
      .insert(toInquiryRow(parsed.data))
      .select('id')
      .single()
    if (error) throw error
    return json({ ok: true, id: data.id }, 201)
  } catch (error) {
    log.error('inquiry insert failed', error)
    return json({ code: 'UNAVAILABLE' }, 503)
  }
}

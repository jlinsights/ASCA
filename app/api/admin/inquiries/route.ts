import { NextRequest, NextResponse } from 'next/server'
import { archiveIdentity, archiveWriter } from '@/lib/archive/writer'
import {
  ADMIN_INQUIRY_COLUMNS,
  ADMIN_INQUIRY_PAGE_SIZE,
  adminInquiryQuerySchema,
  type AdminInquiry,
} from '@/lib/inquiries/schema'
import { log } from '@/lib/utils/logger'

export const dynamic = 'force-dynamic'
const headers = { 'Cache-Control': 'private, no-store', Vary: 'Cookie' }
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers })

// 문의 접수함 목록 — 관리자(MFA 완료)만. 기본은 아직 답하지 않은 문의, 최신 순, 쪽 단위.
export async function GET(request: NextRequest) {
  const identity = await archiveIdentity()
  if (!identity) return json({ error: 'Authentication required', code: 'UNAUTHORIZED' }, 401)
  if (!identity.admin) return json({ error: 'Admin only', code: 'FORBIDDEN' }, 403)
  const query = adminInquiryQuerySchema.safeParse(
    Object.fromEntries(new URL(request.url).searchParams)
  )
  if (!query.success) return json({ error: 'Invalid query', code: 'INVALID_QUERY' }, 400)

  try {
    const { status, page } = query.data
    const from = (page - 1) * ADMIN_INQUIRY_PAGE_SIZE
    let rows = archiveWriter().from('inquiries').select(ADMIN_INQUIRY_COLUMNS, { count: 'exact' })
    if (status !== 'all') rows = rows.eq('status', status)
    const { data, error, count } = await rows
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .range(from, from + ADMIN_INQUIRY_PAGE_SIZE - 1)
    if (error) throw error
    return json({
      data: (data ?? []) as unknown as AdminInquiry[],
      page,
      pageSize: ADMIN_INQUIRY_PAGE_SIZE,
      total: count ?? 0,
    })
  } catch (error) {
    log.error('admin inquiries list failed', error)
    return json({ error: 'Inquiry list unavailable', code: 'INQUIRY_UNAVAILABLE' }, 500)
  }
}

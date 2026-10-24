import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { archiveIdentity, archiveWriter } from '@/lib/archive/writer'
import {
  duesUpdateSchema,
  type AdminArtistRow,
  ADMIN_ARTIST_COLUMNS,
} from '@/lib/admin/artist-dues'
import { checkOrigin } from '@/lib/security/origin-check'
import { rateLimit } from '@/lib/security/rate-limit'
import { auditTrail } from '@/lib/audit/audit-trail'
import { log } from '@/lib/utils/logger'

const idSchema = z.string().uuid()

// 회비 상태 변경. 공개 여부(visibility)는 DB 트리거가 정하므로 여기서 직접 바꾸지 않고,
// 갱신 후 실제 값을 돌려준다 (자격 정지 → hidden, 정상 복귀 → public).
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!checkOrigin(request).ok) {
    return NextResponse.json({ error: '허용되지 않은 요청입니다.' }, { status: 403 })
  }
  const identity = await archiveIdentity()
  if (!identity) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  if (!identity.admin)
    return NextResponse.json({ error: '관리자만 바꿀 수 있습니다.' }, { status: 403 })

  const limited = await rateLimit({
    maxRequests: 60,
    windowMs: 60_000,
    keyGenerator: () => `admin-artist-dues:${identity.userId}`,
  }).check(request)
  if (limited) return limited

  const { id } = await params
  if (!idSchema.safeParse(id).success) {
    return NextResponse.json({ error: '작가 ID가 올바르지 않습니다.' }, { status: 400 })
  }
  const body = duesUpdateSchema.safeParse(await request.json().catch(() => null))
  if (!body.success) {
    return NextResponse.json({ error: '회비 상태 값이 올바르지 않습니다.' }, { status: 400 })
  }

  try {
    const db = archiveWriter()
    const { data: before, error: readError } = await db
      .from('artists')
      .select('dues_status,visibility')
      .eq('id', id)
      .maybeSingle()
    if (readError) throw readError
    if (!before) return NextResponse.json({ error: '작가를 찾을 수 없습니다.' }, { status: 404 })

    const { data, error } = await db
      .from('artists')
      .update({ dues_status: body.data.dues_status })
      .eq('id', id)
      .select(ADMIN_ARTIST_COLUMNS)
      .single()
    if (error) throw error
    const after = data as unknown as AdminArtistRow

    await auditTrail.trackDataChange(identity.userId, 'update', 'artist_dues_status', id, before, {
      dues_status: after.dues_status,
      visibility: after.visibility,
    })
    return NextResponse.json({ artist: after })
  } catch (error) {
    log.error('admin artist dues update failed', error)
    return NextResponse.json({ error: '회비 상태를 바꾸지 못했습니다.' }, { status: 500 })
  }
}

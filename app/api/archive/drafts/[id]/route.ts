import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { archiveIdentity, archiveWriter } from '@/lib/archive/writer'
import { ownedWorks } from '@/lib/archive/owned'
import { draftSchema, draftValues } from '@/lib/archive/drafts'
import { checkOrigin } from '@/lib/security/origin-check'
import { rateLimit } from '@/lib/security/rate-limit'
import { sanitizeInput } from '@/lib/security/security-middleware'
import { auditTrail } from '@/lib/audit/audit-trail'
import { log } from '@/lib/utils/logger'

export const runtime = 'nodejs'
const fail = (code: string, status: number) => NextResponse.json({ code }, { status })

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    if (!checkOrigin(request).ok) return fail('ORIGIN', 403)
    const identity = await archiveIdentity()
    if (!identity) return fail('AUTH_REQUIRED', 401)
    const limited = await rateLimit({
      maxRequests: 12,
      windowMs: 60000,
      keyGenerator: () => `archive-draft:${identity.userId}`,
    }).check(request)
    if (limited) return limited
    const { id } = await context.params
    if (!z.string().uuid().safeParse(id).success) return fail('NOT_FOUND', 404)
    const body = await request.text()
    if (Buffer.byteLength(body) > 65536) return fail('SIZE', 413)
    let raw: unknown
    try {
      raw = JSON.parse(body)
    } catch {
      return fail('INVALID', 400)
    }
    const parsed = draftSchema.safeParse(sanitizeInput(raw))
    if (!parsed.success) return fail('INVALID', 400)
    const { data: work, error } = await ownedWorks(identity.userId).eq('id', id).maybeSingle()
    if (error) throw error
    if (!work) {
      await auditTrail.trackAccess(identity.userId, 'archive_draft', id, false)
      return fail('NOT_FOUND', 404)
    }
    if (work.status !== 'draft') return fail('CONFLICT', 409)
    const db = archiveWriter()
    // Guard status and revision in the UPDATE itself, not only the preceding read.
    const values = draftValues(parsed.data)
    // Keep existing structured material entries intact when the text was not edited.
    if (parsed.data.materials === (work.materials || []).join(', '))
      values.materials = work.materials || []
    let update = db
      .from('artworks')
      .update(values)
      .eq('id', id)
      .eq('artist_id', work.artist_id!)
      .eq('status', 'draft')
    update =
      parsed.data.expectedUpdatedAt === null
        ? update.is('updated_at', null)
        : update.eq('updated_at', parsed.data.expectedUpdatedAt)
    const { data: saved, error: saveError } = await update.select('id,status').maybeSingle()
    if (saveError) throw saveError
    if (!saved) return fail('CONFLICT', 409)
    await auditTrail.trackDataChange(
      identity.userId,
      'update',
      'archive_artwork',
      id,
      { status: work.status },
      { status: saved.status },
      { source: 'archive_draft' }
    )
    return NextResponse.json(saved, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    log.error('Archive draft update failed')
    return fail('SAVE_FAILED', 500)
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { archiveIdentity, archiveWriter } from '@/lib/archive/writer'
import { archiveReader } from '@/lib/archive/queries'
import { checkOrigin } from '@/lib/security/origin-check'
import { rateLimit } from '@/lib/security/rate-limit'
import { sanitizeInput, SecurityMiddleware } from '@/lib/security/security-middleware'
import { auditTrail } from '@/lib/audit/audit-trail'
import { log } from '@/lib/utils/logger'

const inputSchema = z.object({ artworkId: z.string().uuid(), link: z.boolean() }).strict()
const fail = (code: string, status: number) => NextResponse.json({ code }, { status })
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    if (!checkOrigin(request).ok) return fail('ORIGIN', 403)
    const identity = await archiveIdentity()
    if (!identity) return fail('AUTH_REQUIRED', 401)
    const { id } = await context.params
    if (!identity.admin) {
      await auditTrail.trackAccess(identity.userId, 'archive_exhibition', id, false)
      return fail('ADMIN_REQUIRED', 403)
    }
    if (!z.string().uuid().safeParse(id).success) return fail('NOT_FOUND', 404)
    const limited = await rateLimit({
      maxRequests: 30,
      windowMs: 60000,
      keyGenerator: () => `archive-exhibition:${identity.userId}`,
    }).check(request)
    if (limited) return limited
    const body = await request.text()
    if (Buffer.byteLength(body) > 4096) return fail('SIZE', 413)
    let raw: unknown
    try {
      raw = JSON.parse(body)
    } catch {
      return fail('INVALID', 400)
    }
    const parsed = inputSchema.safeParse(sanitizeInput(raw))
    if (!parsed.success) return fail('INVALID', 400)
    const { artworkId, link } = parsed.data
    const validation = await SecurityMiddleware.validateOperation('artwork.update', parsed.data, {
      userId: identity.userId,
      role: 'admin',
      permissions: ['artwork.update'],
      timestamp: Date.now(),
    })
    if (!validation.isValid) return fail('INVALID', 400)
    const db = archiveWriter()
    const parent = await db.from('exhibitions').select('id').eq('id', id).maybeSingle()
    if (parent.error) throw parent.error
    if (!parent.data) return fail('NOT_FOUND', 404)
    if (link) {
      // Anon credentials intentionally enforce the same RLS as the public gallery.
      const work = await archiveReader()
        .from('artworks')
        .select('id')
        .eq('id', artworkId)
        .eq('status', 'published')
        .maybeSingle()
      if (work.error) throw work.error
      if (!work.data) return fail('WORK_NOT_PUBLIC', 409)
    }
    const result = link
      ? await db
          .from('exhibition_artworks')
          .upsert(
            { exhibition_id: id, artwork_id: artworkId },
            { onConflict: 'exhibition_id,artwork_id', ignoreDuplicates: true }
          )
      : await db
          .from('exhibition_artworks')
          .delete()
          .eq('exhibition_id', id)
          .eq('artwork_id', artworkId)
    if (result.error) throw result.error
    await auditTrail.trackDataChange(
      identity.userId,
      link ? 'create' : 'delete',
      'archive_exhibition_artwork',
      `${id}:${artworkId}`,
      null,
      { linked: link },
      { source: 'archive_reuse' }
    )
    return NextResponse.json({ linked: link }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    log.error('Archive exhibition link failed')
    return fail('SAVE_FAILED', 500)
  }
}

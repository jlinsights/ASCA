import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { archiveIdentity, archiveWriter } from '@/lib/archive/writer'
import { reviewRequest, reviewOperation } from '@/lib/archive/review'
import { executeReview } from '@/lib/archive/review-service'
import { checkOrigin } from '@/lib/security/origin-check'
import { rateLimit } from '@/lib/security/rate-limit'
import { sanitizeInput, SecurityMiddleware } from '@/lib/security/security-middleware'
import { auditTrail } from '@/lib/audit/audit-trail'
import { log } from '@/lib/utils/logger'

export const runtime = 'nodejs'
export const maxDuration = 60
const fail = (code: string, status: number) => NextResponse.json({ code }, { status })

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    if (!checkOrigin(request).ok) return fail('ORIGIN', 403)
    const identity = await archiveIdentity()
    if (!identity) return fail('AUTH_REQUIRED', 401)
    const { id } = await context.params
    if (!identity.admin) {
      await auditTrail.trackAccess(identity.userId, 'archive_review', id, false)
      return fail('ADMIN_REQUIRED', 403)
    }
    if (!z.string().uuid().safeParse(id).success) return fail('NOT_FOUND', 404)
    const limited = await rateLimit({
      maxRequests: 12,
      windowMs: 60000,
      keyGenerator: () => `archive-review:${identity.userId}`,
    }).check(request)
    if (limited) return limited
    const body = await request.text()
    if (Buffer.byteLength(body) > 16384) return fail('SIZE', 413)
    let raw: unknown
    try {
      raw = JSON.parse(body)
    } catch {
      return fail('INVALID', 400)
    }
    const parsed = reviewRequest.safeParse(sanitizeInput(raw))
    if (!parsed.success) return fail('INVALID', 400)
    const validation = await SecurityMiddleware.validateOperation('artwork.update', parsed.data, {
      userId: identity.userId,
      role: 'admin',
      permissions: ['artwork.update'],
      timestamp: Date.now(),
    })
    if (!validation.isValid) return fail('INVALID', 400)
    const db = archiveWriter()
    const { data, error } = await db.rpc('prepare_archive_review', {
      p_id: parsed.data.operationId,
      p_artwork_id: id,
      p_action: parsed.data.action,
      p_expected_updated_at: parsed.data.expectedUpdatedAt!,
      p_reason: parsed.data.reason,
      p_reviewer_id: identity.userId,
      p_lease_token: randomUUID(),
    })
    if (error) {
      const code = [
        'BUSY',
        'CONFLICT',
        'NOT_FOUND',
        'ARTIST_PRIVATE',
        'INCOMPLETE',
        'IMAGE_PATH',
      ].find(value => error.message.includes(value))
      return fail(code || 'REVIEW_FAILED', code === 'NOT_FOUND' ? 404 : code ? 409 : 500)
    }
    const operation = await executeReview(db, reviewOperation.parse(data))
    // The transactional review ledger is authoritative; telemetry must not turn success into failure.
    try {
      await auditTrail.trackDataChange(
        identity.userId,
        'update',
        'archive_artwork',
        id,
        null,
        { action: operation.action, operation_id: operation.id },
        { source: 'archive_review' }
      )
    } catch {
      log.error('Archive review telemetry failed')
    }
    return NextResponse.json(
      { id: operation.id, state: operation.state },
      {
        headers: { 'Cache-Control': 'no-store' },
      }
    )
  } catch {
    log.error('Archive review operation failed')
    return fail('REVIEW_FAILED', 500)
  }
}

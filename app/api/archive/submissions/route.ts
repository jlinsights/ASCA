import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { log } from '@/lib/utils/logger'
import { randomUUID } from 'node:crypto'
import { archiveIdentity, archiveWriter } from '@/lib/archive/writer'
import {
  submissionSchema,
  MAX_IMAGE_BYTES,
  MAX_IMAGES,
  canSubmitForArtist,
} from '@/lib/archive/submission'
import { sanitizeInput, SecurityMiddleware } from '@/lib/security/security-middleware'
import { auditTrail } from '@/lib/audit/audit-trail'
import { checkOrigin } from '@/lib/security/origin-check'
import { rateLimit } from '@/lib/security/rate-limit'
export const runtime = 'nodejs'
export const maxDuration = 60
const fail = (code: string, status: number) => NextResponse.json({ code }, { status })
export async function POST(request: NextRequest) {
  let db: ReturnType<typeof archiveWriter> | undefined
  const paths: string[] = []
  const id = randomUUID()
  let inserted = false
  const bucket = process.env.ARCHIVE_PRIVATE_BUCKET || 'archive-private'
  try {
    if (!checkOrigin(request).ok) return fail('ORIGIN', 403)
    const identity = await archiveIdentity()
    if (!identity) return fail('AUTH_REQUIRED', 401)
    const limit = await rateLimit({
      maxRequests: 6,
      windowMs: 60000,
      keyGenerator: () => `archive-submit:${identity.userId}`,
    }).check(request)
    if (limit) return limit
    // Keep the complete multipart body below Vercel's 4.5 MB request limit.
    const length = Number(request.headers.get('content-length'))
    if (!Number.isFinite(length) || length <= 0 || length > MAX_IMAGE_BYTES + 65536)
      return fail('SIZE', 413)
    const form = await request.formData()
    let raw: unknown
    try {
      raw = JSON.parse(String(form.get('data')))
    } catch {
      return fail('INVALID', 400)
    }
    const parsed = submissionSchema.safeParse(sanitizeInput(raw))
    if (!parsed.success) return fail('INVALID', 400)
    const input = parsed.data
    const files = form.getAll('images')
    if (!files.length || files.length > MAX_IMAGES || files.some(file => !(file instanceof File)))
      return fail('IMAGES', 400)
    const images = files as File[]
    if (
      images.reduce((sum, file) => sum + file.size, 0) > MAX_IMAGE_BYTES ||
      images.some(file => file.size === 0)
    )
      return fail('SIZE', 413)
    db = archiveWriter()
    const { data: artist, error } = await db
      .from('artists')
      .select('id,claimed_by_user_id')
      .eq('id', input.artistId)
      .maybeSingle()
    if (error) throw error
    if (
      !artist ||
      !canSubmitForArtist(identity.userId, artist.claimed_by_user_id, identity.admin)
    ) {
      await auditTrail.trackAccess(identity.userId, 'archive_submission', input.artistId, false)
      return fail('OWNER_REQUIRED', 403)
    }
    if (identity.admin) {
      const validation = await SecurityMiddleware.validateOperation('archive.submit', input, {
        userId: identity.userId,
        role: 'admin',
        permissions: ['archive.submit'],
        timestamp: Date.now(),
      })
      if (!validation.isValid) return fail('INVALID', 400)
    }
    const { data: bucketInfo, error: bucketError } = await db.storage.getBucket(bucket)
    if (bucketError || !bucketInfo || bucketInfo.public)
      throw new Error('Private archive bucket required')
    // Decode every image before writing anything. Never trust extension/MIME/client dimensions.
    const prepared = await Promise.all(
      images.map(async file => {
        const original = Buffer.from(await file.arrayBuffer())
        const metadata = await sharp(original, {
          limitInputPixels: 40000000,
          animated: false,
        }).metadata()
        if (
          !metadata.format ||
          !['jpeg', 'png', 'webp'].includes(metadata.format) ||
          !metadata.width ||
          !metadata.height ||
          (metadata.pages || 1) > 1
        )
          throw new Error('INVALID_IMAGE')
        const web = await sharp(original, { limitInputPixels: 40000000 })
          .rotate()
          .resize({ width: 1800, height: 2400, fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 85 })
          .toBuffer({ resolveWithObject: true })
        const thumb = await sharp(original, { limitInputPixels: 40000000 })
          .rotate()
          .resize({ width: 480, height: 640, fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 80 })
          .toBuffer()
        return {
          original,
          web: web.data,
          thumb,
          width: web.info.width,
          height: web.info.height,
          format: metadata.format,
        }
      })
    )
    const imageRows = []
    for (const [index, image] of prepared.entries()) {
      const prefix = `${artist.id}/${id}/${index}`
      const originalPath = `${prefix}/original.${image.format}`
      const webPath = `${prefix}/web.webp`
      const thumbPath = `${prefix}/thumb.webp`
      for (const [path, buffer, type] of [
        [originalPath, image.original, `image/${image.format}`],
        [webPath, image.web, 'image/webp'],
        [thumbPath, image.thumb, 'image/webp'],
      ] as const) {
        const { error: uploadError } = await db.storage
          .from(bucket)
          .upload(path, buffer, { contentType: type, upsert: false })
        if (uploadError) throw uploadError
        paths.push(path)
      }
      imageRows.push({
        artwork_id: id,
        original_path: originalPath,
        web_path: webPath,
        thumb_path: thumbPath,
        sort_order: index,
        is_primary: index === 0,
        width: image.width,
        height: image.height,
      })
    }
    const { error: insertError } = await db.from('artworks').insert({
      id,
      artist_id: artist.id,
      title: input.title,
      title_hanja: input.titleHanja || null,
      title_en: input.titleEn || null,
      style: input.style,
      width_cm: input.width,
      height_cm: input.height,
      year_created: input.year,
      materials: [input.materials],
      transcription: input.transcription || null,
      interpretation: input.interpretation || null,
      interpretation_en: input.interpretationEn || null,
      source_text: input.source || null,
      seal_description: input.seal || null,
      status: input.status,
      created_by: identity.admin ? 'admin' : 'artist',
      category: 'calligraphy',
      medium: input.materials,
      description: input.interpretation,
      dimensions: { width: input.width, height: input.height, unit: 'cm' },
      images: [],
    })
    if (insertError) throw insertError
    inserted = true
    const { error: imageError } = await db.from('artwork_images').insert(imageRows)
    if (imageError) throw imageError
    if (input.recordTitle) {
      const { error: recordError } = await db.from('artist_records').insert({
        artist_id: artist.id,
        artwork_id: id,
        record_type: 'submission',
        title: input.recordTitle,
        organizer: input.organizer || null,
        contest_ref: input.contestRef || null,
        source: identity.admin ? 'admin' : 'self_reported',
        is_asca_verified: false,
      })
      if (recordError) throw recordError
    }
    await auditTrail.trackDataChange(
      identity.userId,
      'create',
      'archive_artwork',
      id,
      null,
      { status: input.status, image_count: images.length },
      { source: 'archive_submission' }
    )
    return NextResponse.json({ id, status: input.status }, { status: 201 })
  } catch (error) {
    if (db) {
      // Compensating cleanup: no existing artist, record or public object is modified.
      if (inserted) {
        const { error: recordCleanupError } = await db
          .from('artist_records')
          .delete()
          .eq('artwork_id', id)
        // Keep the nonpublic parent if history cleanup fails: ON DELETE SET NULL would expose orphan history.
        if (recordCleanupError) log.error('Archive record cleanup failed', undefined, { id })
        else {
          const { error: cleanupError } = await db.from('artworks').delete().eq('id', id)
          if (cleanupError) log.error('Archive row cleanup failed', undefined, { id })
        }
      }
      if (paths.length) {
        const { error: cleanupError } = await db.storage.from(bucket).remove(paths)
        if (cleanupError) log.error('Archive object cleanup failed', undefined, { id })
      }
    }
    log.error('Archive submission failed', undefined, {
      id,
      message: error instanceof Error ? error.message : 'database/storage failure',
    })
    return fail('SUBMISSION_FAILED', 500)
  }
}

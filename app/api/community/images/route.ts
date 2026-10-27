import { randomUUID } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { getAccount } from '@/lib/auth/server'
import { AccountAuthError } from '@/lib/auth/supabase/errors'
import { archiveWriter } from '@/lib/archive/writer'
import { checkOrigin } from '@/lib/security/origin-check'
import { rateLimit } from '@/lib/security/rate-limit'
import {
  COMMUNITY_IMAGE_BUCKET,
  ImageRejected,
  PENDING_IMAGES_MAX,
  PENDING_WINDOW_MS,
  processImage,
} from '@/lib/community/images'
import { sweepAfterResponse } from '@/lib/community/image-sweep'
import { IMAGE_UPLOAD_MAX_BYTES } from '@/lib/community/threads'
import { log } from '@/lib/utils/logger'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
const headers = { 'Cache-Control': 'private, no-store', Vary: 'Cookie' }
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers })
/** multipart 경계·필드 이름 몫 */
const FORM_OVERHEAD = 64 * 1024

/**
 * 사진 올리기(대기) — 글을 올리기 전에 한 장씩 올려 두고, 글 올리기가 ID 로 붙인다.
 * 받은 파일은 다시 인코딩해(위치 등 메타데이터 제거) 무작위 이름으로 비공개 버킷에 둔다.
 */
export async function POST(request: NextRequest) {
  if (!checkOrigin(request).ok)
    return json({ error: 'Origin rejected', code: 'CSRF_ORIGIN_MISMATCH' }, 403)
  try {
    const account = await getAccount()
    if (!account) return json({ error: 'Authentication required', code: 'UNAUTHORIZED' }, 401)
    if (!account.displayName.trim())
      return json({ error: 'Display name required', code: 'DISPLAY_NAME_REQUIRED' }, 409)
    const declared = Number(request.headers.get('content-length') ?? 0)
    if (declared > IMAGE_UPLOAD_MAX_BYTES + FORM_OVERHEAD)
      return json({ error: 'Image too large', code: 'IMAGE_TOO_LARGE' }, 413)
    const limited = await rateLimit({
      maxRequests: 30,
      windowMs: 60 * 60_000,
      keyGenerator: () => `community-image:${account.id}`,
    }).check(request)
    if (limited) return limited

    const file = (await request.formData().catch(() => null))?.get('file')
    if (!(file instanceof Blob) || file.size === 0)
      return json({ error: 'Image required', code: 'IMAGE_REQUIRED' }, 400)
    if (file.size > IMAGE_UPLOAD_MAX_BYTES)
      return json({ error: 'Image too large', code: 'IMAGE_TOO_LARGE' }, 413)

    const db = archiveWriter()
    const pending = await db
      .from('community_thread_images')
      .select('id', { count: 'exact', head: true })
      .eq('uploader_id', account.id)
      .is('thread_id', null)
      .gte('created_at', new Date(Date.now() - PENDING_WINDOW_MS).toISOString())
    if (pending.error) throw pending.error
    if ((pending.count ?? 0) >= PENDING_IMAGES_MAX)
      return json({ error: 'Too many unused images', code: 'TOO_MANY_PENDING_IMAGES' }, 409)

    const image = await processImage(Buffer.from(await file.arrayBuffer()))
    // 경로에 계정 ID 를 넣지 않는다
    const path = `${randomUUID()}.webp`
    const bucket = db.storage.from(COMMUNITY_IMAGE_BUCKET)
    const stored = await bucket.upload(path, image.data, {
      contentType: 'image/webp',
      upsert: false,
    })
    if (stored.error) throw stored.error
    const { data, error } = await db
      .from('community_thread_images')
      .insert({
        uploader_id: account.id,
        storage_path: path,
        width: image.width,
        height: image.height,
        byte_size: image.data.length,
      })
      .select('id')
      .single()
    if (error) {
      await bucket.remove([path])
      throw error
    }
    sweepAfterResponse(db)
    return json({ data: { id: data.id, width: image.width, height: image.height } }, 201)
  } catch (error) {
    if (error instanceof ImageRejected)
      return json({ error: 'Unsupported image', code: 'IMAGE_UNSUPPORTED' }, 415)
    if (error instanceof AccountAuthError)
      return json({ error: error.code, code: error.code }, error.status)
    log.error('community image upload failed', error)
    return json({ error: 'Community unavailable', code: 'COMMUNITY_UNAVAILABLE' }, 500)
  }
}

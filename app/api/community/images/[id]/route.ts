import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getAccount } from '@/lib/auth/server'
import { archiveIdentity, archiveWriter } from '@/lib/archive/writer'
import { COMMUNITY_IMAGE_BUCKET, PUBLIC_IMAGE_MAX_AGE } from '@/lib/community/images'
import { log } from '@/lib/utils/logger'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
type Context = { params: Promise<{ id: string }> }

// 공개 글 사진은 브라우저에만 잠깐 둔다(공유 캐시 금지). 관리자·작성자만 보는 사진은 두지 않는다.
const PUBLIC_CACHE = `private, max-age=${PUBLIC_IMAGE_MAX_AGE}`
const RESTRICTED_CACHE = 'private, no-store'

const notFound = () =>
  NextResponse.json(
    { error: 'Image not found', code: 'IMAGE_NOT_FOUND' },
    { status: 404, headers: { 'Cache-Control': RESTRICTED_CACHE, Vary: 'Cookie' } }
  )

interface ImageRow {
  storage_path: string
  uploader_id: string | null
  thread: { hidden_at: string | null; deleted_at: string | null } | null
}

/**
 * 글 사진 내보내기 — 파일은 비공개 버킷이라 공개 주소가 없고, 매번 여기서 글이 보이는지 확인한다.
 * - 보이는 글: 누구나
 * - 숨긴 글: 관리자(MFA)만
 * - 지운 글: 아무도
 * - 아직 글에 붙지 않은 사진: 올린 본인만
 * 그 밖에는 있는지조차 알리지 않는다(404).
 */
export async function GET(_request: Request, { params }: Context) {
  const { id } = await params
  if (!z.string().uuid().safeParse(id).success) return notFound()
  try {
    const db = archiveWriter()
    const { data, error } = await db
      .from('community_thread_images')
      .select('storage_path,uploader_id,thread:community_threads(hidden_at,deleted_at)')
      .eq('id', id)
      .maybeSingle()
    if (error) throw error
    const row = data as ImageRow | null
    if (!row) return notFound()

    let cache = PUBLIC_CACHE
    if (!row.thread) {
      const account = await getAccount().catch(() => null)
      if (!account || account.id !== row.uploader_id) return notFound()
      cache = RESTRICTED_CACHE
    } else if (row.thread.deleted_at) {
      return notFound()
    } else if (row.thread.hidden_at) {
      const identity = await archiveIdentity().catch(() => null)
      if (!identity?.admin) return notFound()
      cache = RESTRICTED_CACHE
    }

    const file = await db.storage.from(COMMUNITY_IMAGE_BUCKET).download(row.storage_path)
    if (file.error || !file.data) throw file.error ?? new Error('empty image')
    return new NextResponse(file.data.stream(), {
      headers: {
        'Content-Type': 'image/webp',
        'Content-Length': String(file.data.size),
        'Cache-Control': cache,
        Vary: 'Cookie',
        'X-Content-Type-Options': 'nosniff',
        'Content-Disposition': 'inline',
      },
    })
  } catch (error) {
    log.error('community image read failed', error)
    return NextResponse.json(
      { error: 'Community unavailable', code: 'COMMUNITY_UNAVAILABLE' },
      { status: 500, headers: { 'Cache-Control': RESTRICTED_CACHE } }
    )
  }
}

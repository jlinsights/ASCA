import 'server-only'
import { after } from 'next/server'
import type { archiveWriter } from '@/lib/archive/writer'
import { COMMUNITY_IMAGE_BUCKET, PENDING_WINDOW_MS } from '@/lib/community/images'
import { log } from '@/lib/utils/logger'

// 글에 붙지 않은 채 남은 사진(올리고 빼거나, 글쓰기를 그만둔 것)을 지운다.
// 버려진 사진은 올리기로만 생기므로, 올릴 때마다 오래된 것을 조금씩 쓸면 쌓이지 않는다 —
// 따로 예약 작업을 두지 않는다.

/** 한 번에 지우는 최대 장수 — 올리기 한 번(시간당 30번 한도)보다 넉넉히 많게 */
export const SWEEP_BATCH = 20

type Writer = ReturnType<typeof archiveWriter>

/**
 * 대기 시간(24시간)이 지난 미첨부 사진을 오래된 순으로 지운다. 지운 장수를 돌려준다.
 * 행을 먼저 지우고(그 순간에도 미첨부일 때만) 파일은 그 뒤에 지운다 — 바로 그때 글에 붙는
 * 사진의 파일을 지우는 일이 없다.
 */
export async function sweepExpiredPendingImages(
  db: Writer,
  now = Date.now(),
  limit = SWEEP_BATCH
): Promise<number> {
  const cutoff = new Date(now - PENDING_WINDOW_MS).toISOString()
  const picked = await db
    .from('community_thread_images')
    .select('id')
    .is('thread_id', null)
    .lt('created_at', cutoff)
    .order('created_at', { ascending: true })
    .limit(limit)
  if (picked.error) throw picked.error
  const ids = (picked.data ?? []).map(row => row.id)
  if (!ids.length) return 0

  const removed = await db
    .from('community_thread_images')
    .delete()
    .in('id', ids)
    .is('thread_id', null)
    .lt('created_at', cutoff)
    .select('storage_path')
  if (removed.error) throw removed.error
  const paths = (removed.data ?? []).map(row => row.storage_path)
  if (!paths.length) return 0

  const files = await db.storage.from(COMMUNITY_IMAGE_BUCKET).remove(paths)
  // 행은 이미 지웠다 — 파일만 남으면 아무도 닿지 못하는 고아라 기록만 남긴다
  if (files.error) log.error('community image sweep: storage remove failed', files.error)
  return paths.length
}

/** 응답을 보낸 뒤에 쓴다 — 올리는 사람을 기다리게 하지 않고, 실패해도 올리기는 성공이다 */
export function sweepAfterResponse(db: Writer): void {
  try {
    after(async () => {
      try {
        await sweepExpiredPendingImages(db)
      } catch (error) {
        log.error('community image sweep failed', error)
      }
    })
  } catch (error) {
    // 요청 밖에서 불리는 등 예약 자체가 안 되면 이번에는 건너뛴다 — 다음 올리기가 쓴다
    log.error('community image sweep not scheduled', error)
  }
}

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
 * 지운 행을 되살릴 수 있도록 돌려받는 열 — 미첨부 행이라 thread_id·position 은 비어 있다.
 * uploader_id 는 받지 않는다: 그 사이 탈퇴한 계정이면 외래 키에 걸려 같은 묶음 전체가 복원되지
 * 못한다. 어차피 다음 청소에 지워질 행이라 올린 사람은 필요 없다.
 */
const SWEPT_COLUMNS = 'id, storage_path, width, height, byte_size, created_at'

/**
 * 대기 시간(24시간)이 지난 미첨부 사진을 오래된 순으로 지운다. 지운 장수를 돌려준다.
 * 행을 먼저 지우고(그 순간에도 미첨부일 때만) 파일은 그 뒤에 지운다 — 바로 그때 글에 붙는
 * 사진의 파일을 지우는 일이 없다. 파일 삭제가 실패하면 행을 되살려 다음 청소에 맡긴다.
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
    .select(SWEPT_COLUMNS)
  if (removed.error) throw removed.error
  const rows = removed.data ?? []
  if (!rows.length) return 0

  const files = await db.storage
    .from(COMMUNITY_IMAGE_BUCKET)
    .remove(rows.map(row => row.storage_path))
  if (files.error) {
    // 행이 없으면 다음 청소가 파일을 찾지 못해 영영 남는다 — 지운 행을 그대로(미첨부, 옛 시각) 되살려
    // 다음 청소가 다시 시도하게 한다
    log.error('community image sweep: storage remove failed', files.error)
    const restored = await db.from('community_thread_images').insert(rows)
    if (restored.error) log.error('community image sweep: restoring rows failed', restored.error)
    return 0
  }
  return rows.length
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

import 'server-only'
import { archiveWriter } from './writer'
import { artworkFields } from './queries'
import { reviewOperation } from './review'

export async function reviewList(page: number, status: 'pending_review' | 'published') {
  const db = archiveWriter()
  const { data, count, error } = await db
    .from('artworks')
    .select('id,title,status,updated_at,artists!inner(name,visibility)', { count: 'exact' })
    .eq('status', status)
    .order('updated_at', { ascending: true })
    .order('id')
    .range((page - 1) * 24, page * 24 - 1)
  if (error) throw error
  return { works: data || [], total: count || 0 }
}

// Caller must check archiveIdentity().admin before invoking service-role queries or signing.
export async function reviewDetail(id: string) {
  const db = archiveWriter()
  const { data: work, error } = await db
    .from('artworks')
    .select(
      `${artworkFields},status,updated_at,artists!inner(name,visibility),artwork_images(id,original_path,sort_order)`
    )
    .eq('id', id)
    .in('status', ['pending_review', 'published'])
    .maybeSingle()
  if (error) throw error
  if (!work) return null
  const { data: history, error: historyError } = await db
    .from('archive_reviews')
    .select('id,action,state,reason,created_at')
    .eq('artwork_id', id)
    .order('created_at', { ascending: false })
    .limit(20)
  if (historyError) throw historyError
  const bucket = process.env.ARCHIVE_PRIVATE_BUCKET || 'archive-private'
  const info = await db.storage.getBucket(bucket)
  if (info.error || !info.data || info.data.public) throw new Error('Private bucket required')
  const previews = await Promise.all(
    work.artwork_images
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(async image => {
        const prefix = `${work.artist_id}/${work.id}/`
        if (
          !image.original_path.startsWith(prefix) ||
          !/\/\d\/original\.(jpeg|png|webp)$/.test(image.original_path)
        )
          throw new Error('Invalid archive image path')
        const path = image.original_path.replace(/original\.(jpeg|png|webp)$/, 'web.webp')
        const { data, error: signError } = await db.storage.from(bucket).createSignedUrl(path, 120)
        if (signError || !data) throw signError || new Error('Preview unavailable')
        return { id: image.id, url: data.signedUrl }
      })
  )
  // Neither originals nor their object keys are serialized to the client.
  const { artwork_images, ...details } = work
  const summaries = (history || []).map(row =>
    reviewOperation.pick({ id: true, action: true, state: true, reason: true }).parse(row)
  )
  return {
    work: details,
    previews,
    history: summaries,
    open: summaries.find(r => r.state !== 'completed'),
  }
}

import 'server-only'
import { archiveWriter } from './writer'
import { artworkFields } from './queries'

export const ownedFields =
  `${artworkFields},status,updated_at,artists!inner(id,name,claimed_by_user_id),archive_reviews(action,state,reason,created_at)` as const

// Use the same owner constraint for administrators here: this is the personal workspace.
export function ownedWorks(userId: string) {
  return archiveWriter()
    .from('artworks')
    .select(ownedFields, { count: 'exact' })
    .eq('artists.claimed_by_user_id', userId)
    .order('created_at', { referencedTable: 'archive_reviews', ascending: false })
    .limit(1, { referencedTable: 'archive_reviews' })
}

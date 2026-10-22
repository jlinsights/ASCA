import 'server-only'
import { archiveReader, imageFields, safeSearch } from './queries'
import { archiveWriter } from './service-client'

export async function archiveExhibitions(page: number, admin = false) {
  const db = admin ? archiveWriter() : archiveReader()
  let query = db
    .from('exhibitions')
    .select('id,title,start_date,end_date,is_published', { count: 'exact' })
    .order('start_date', { ascending: false })
    .order('id')
  if (!admin) query = query.eq('is_published', true)
  const { data, count, error } = await query.range((page - 1) * 24, page * 24 - 1)
  if (error) throw error
  return { exhibitions: data || [], total: count || 0 }
}

export async function exhibitionArchive(id: string, page: number) {
  const db = archiveReader()
  const { data: exhibition, error } = await db
    .from('exhibitions')
    .select('id,title,start_date,end_date,location')
    .eq('id', id)
    .eq('is_published', true)
    .maybeSingle()
  if (error) throw error
  if (!exhibition) return null
  const {
    data,
    count,
    error: worksError,
  } = await db
    .from('exhibition_artworks')
    .select(
      `id,artworks!inner(id,title,title_en,title_hanja,style,width_cm,height_cm,year_created,artists!inner(name),artwork_images(${imageFields}))`,
      { count: 'exact' }
    )
    .eq('exhibition_id', id)
    .eq('artworks.status', 'published')
    .order('display_order')
    .order('id')
    .range((page - 1) * 24, page * 24 - 1)
    .order('is_primary', { referencedTable: 'artworks.artwork_images', ascending: false })
    .order('sort_order', { referencedTable: 'artworks.artwork_images' })
    .limit(1, { referencedTable: 'artworks.artwork_images' })
  if (worksError) throw worksError
  return { exhibition, works: (data || []).map(row => row.artworks), total: count || 0 }
}

// Only permission-checked admin pages may invoke this service-role query.
export async function exhibitionPicker(id: string, page: number, q: string, linked: boolean) {
  const db = archiveWriter()
  const { data: exhibition, error } = await db
    .from('exhibitions')
    .select('id,title,is_published')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  if (!exhibition) return null
  const fields = 'id,title,status,artists!inner(name,visibility)' as const
  let query = linked
    ? db
        .from('artworks')
        .select(`${fields},exhibition_artworks!inner(exhibition_id)`, { count: 'exact' })
    : db.from('artworks').select(`${fields},exhibition_artworks(exhibition_id)`, { count: 'exact' })
  query = query.eq('exhibition_artworks.exhibition_id', id)
  if (!linked) query = query.eq('status', 'published').eq('artists.visibility', 'public')
  const search = safeSearch(q)
  if (search) query = query.ilike('title', `%${search}%`)
  const {
    data,
    count,
    error: worksError,
  } = await query
    .order('title')
    .order('id')
    .range((page - 1) * 24, page * 24 - 1)
  if (worksError) throw worksError
  return {
    exhibition,
    works: (data || []).map(work => ({
      id: work.id,
      title: work.title,
      status: work.status,
      isPublic: work.status === 'published' && work.artists.visibility === 'public',
      artist: work.artists.name,
      linked: work.exhibition_artworks.length > 0,
    })),
    total: count || 0,
  }
}

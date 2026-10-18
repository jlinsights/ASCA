import 'server-only'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database.generated'

// Always use anon credentials: public archive queries must remain subject to RLS.
export function archiveReader() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}
export const artistFields =
  'id,name,name_en,name_ja,name_zh,art_name_ko,art_name_hanja,calligraphy_styles,teacher_name,branch_name,certification_grade,certified_at,archive_bio,archive_bio_en,profile_image_path' as const
export const imageFields =
  'id,artwork_id,thumb_path,web_path,sort_order,is_primary,width,height' as const
export const artworkFields =
  'id,artist_id,title,title_en,title_hanja,style,transcription,interpretation,interpretation_en,source_text,seal_description,width_cm,height_cm,materials,year_created' as const
export const recordFields =
  'id,artist_id,artwork_id,record_type,title,organizer,year,award_level,is_asca_verified,source' as const
export type Artist = Pick<
  Database['public']['Tables']['artists']['Row'],
  | 'id'
  | 'name'
  | 'name_en'
  | 'name_ja'
  | 'name_zh'
  | 'art_name_ko'
  | 'art_name_hanja'
  | 'calligraphy_styles'
  | 'teacher_name'
  | 'branch_name'
  | 'certification_grade'
  | 'certified_at'
  | 'archive_bio'
  | 'archive_bio_en'
  | 'profile_image_path'
>
export type Work = Pick<
  Database['public']['Tables']['artworks']['Row'],
  | 'id'
  | 'artist_id'
  | 'title'
  | 'title_en'
  | 'title_hanja'
  | 'style'
  | 'transcription'
  | 'interpretation'
  | 'interpretation_en'
  | 'source_text'
  | 'seal_description'
  | 'width_cm'
  | 'height_cm'
  | 'materials'
  | 'year_created'
>
export type Image = Pick<
  Database['public']['Tables']['artwork_images']['Row'],
  'id' | 'artwork_id' | 'thumb_path' | 'web_path' | 'sort_order' | 'is_primary' | 'width' | 'height'
>
export type RecordEntry = Pick<
  Database['public']['Tables']['artist_records']['Row'],
  | 'id'
  | 'artist_id'
  | 'artwork_id'
  | 'record_type'
  | 'title'
  | 'organizer'
  | 'year'
  | 'award_level'
  | 'is_asca_verified'
  | 'source'
>
export type ArtistCard = Artist & { artworks: { id: string; artwork_images: Image[] }[] }
export const safeSearch = (value: string) =>
  value
    .replace(/[,().%*_\\:"']/g, ' ')
    .trim()
    .slice(0, 50)
export const pageNumber = (value?: string) =>
  Math.min(10000, Math.max(1, Number.parseInt(value || '1', 10) || 1))

export async function listArtists(params: {
  q?: string
  style?: string
  grade?: string
  page?: string
}) {
  const db = archiveReader()
  let query = db
    .from('artists')
    .select(`${artistFields},artworks(id,artwork_images(${imageFields}))`, { count: 'exact' })
    .eq('visibility', 'public')
    .order('name')
    .order('id')
    .order('year_created', { referencedTable: 'artworks', ascending: false })
    .order('id', { referencedTable: 'artworks' })
    .limit(1, { referencedTable: 'artworks' })
    .limit(1, { referencedTable: 'artworks.artwork_images' })
    .order('is_primary', { referencedTable: 'artworks.artwork_images', ascending: false })
  const q = safeSearch(params.q || '')
  if (q) query = query.or(`name.ilike.%${q}%,art_name_ko.ilike.%${q}%,art_name_hanja.ilike.%${q}%`)
  if (params.style) query = query.contains('calligraphy_styles', [params.style.slice(0, 50)])
  if (params.grade) query = query.eq('certification_grade', params.grade.slice(0, 100))
  const page = pageNumber(params.page)
  const { data, count, error } = await query.range((page - 1) * 24, page * 24 - 1)
  if (error) throw error
  return { artists: data as ArtistCard[], total: count || 0, page }
}
export async function artistDetail(id: string) {
  const db = archiveReader()
  const { data: artist, error } = await db
    .from('artists')
    .select(artistFields)
    .eq('id', id)
    .eq('visibility', 'public')
    .maybeSingle()
  if (error) throw error
  return artist
}
export async function artistWorks(id: string, page: number) {
  const { data, count, error } = await archiveReader()
    .from('artworks')
    .select(`${artworkFields},artwork_images(${imageFields})`, { count: 'exact' })
    .eq('artist_id', id)
    .eq('status', 'published')
    .order('year_created', { ascending: false })
    .order('id')
    .range((page - 1) * 24, page * 24 - 1)
    .order('is_primary', { referencedTable: 'artwork_images', ascending: false })
    .order('sort_order', { referencedTable: 'artwork_images' })
  if (error) throw error
  return { works: data, total: count || 0 }
}
export async function recordsFor(id: string, page: number, artworkId?: string) {
  let query = archiveReader()
    .from('artist_records')
    .select(recordFields, { count: 'exact' })
    .eq('artist_id', id)
    .order('year', { ascending: false, nullsFirst: false })
    .order('id')
  if (artworkId) query = query.eq('artwork_id', artworkId)
  const { data, count, error } = await query.range((page - 1) * 24, page * 24 - 1)
  if (error) throw error
  return { records: data, total: count || 0 }
}
export async function workDetail(id: string) {
  const { data, error } = await archiveReader()
    .from('artworks')
    .select(`${artworkFields},artwork_images(${imageFields})`)
    .eq('id', id)
    .eq('status', 'published')
    .order('is_primary', { referencedTable: 'artwork_images', ascending: false })
    .order('sort_order', { referencedTable: 'artwork_images' })
    .maybeSingle()
  if (error) throw error
  return data
}

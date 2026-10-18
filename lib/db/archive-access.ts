import { and, eq, sql } from 'drizzle-orm'
import { artists, artworks, exhibitionArtists, exhibitionArtworks } from './schema'

export const publicArtistCondition = () => eq(artists.visibility, 'public')
export const publicArtworkCondition = () =>
  and(
    eq(artworks.status, 'published'),
    sql`exists (select 1 from public.artists archive_artist where archive_artist.id = ${artworks.artistId} and archive_artist.visibility = 'public')`
  )

export const publicExhibitionArtistCondition = () => sql`exists (
  select 1 from public.artists archive_artist where archive_artist.id = ${exhibitionArtists.artistId}
  and archive_artist.visibility = 'public') and exists (
  select 1 from public.exhibitions archive_exhibition where archive_exhibition.id = ${exhibitionArtists.exhibitionId}
  and archive_exhibition.is_published = true)`
export const publicExhibitionArtworkCondition = () => sql`exists (
  select 1 from public.artworks archive_work join public.artists archive_artist on archive_artist.id = archive_work.artist_id
  where archive_work.id = ${exhibitionArtworks.artworkId} and archive_work.status = 'published'
  and archive_artist.visibility = 'public') and exists (
  select 1 from public.exhibitions archive_exhibition where archive_exhibition.id = ${exhibitionArtworks.exhibitionId}
  and archive_exhibition.is_published = true)`

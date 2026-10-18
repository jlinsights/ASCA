import type { Database } from './database.generated'

type Tables = Database['public']['Tables']
export type ArchiveArtistRow = Tables['artists']['Row']
export type ArchiveArtworkRow = Tables['artworks']['Row']
export type ArtistContactRow = Tables['artist_contacts']['Row']
export type ArtistRecordRow = Tables['artist_records']['Row']
export type ArtworkImageRow = Tables['artwork_images']['Row']
/** Never serialize an original object key to a public response. */
export type PublicArtworkImage = Omit<ArtworkImageRow, 'original_path'>
export type ArchiveVisibility = 'public' | 'members' | 'hidden'
export type ArchiveRecordType = 'award' | 'exhibition' | 'submission' | 'certification'

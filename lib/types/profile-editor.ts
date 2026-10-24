/** The self-service editor supports real artist columns only. */
export interface ArtistProfileUpdates {
  name?: string
  nameEn?: string | null
  bio?: string | null
  bioEn?: string | null
  birthYear?: number | null
  specialization?: string[]
}

export interface ArtistProfileEditorData {
  id: string
  name: string
  nameEn: string | null
  bio: string | null
  bioEn: string | null
  birthYear: number | null
  specialization: string[]
  profileImage: string | null
  /** Membership/dues policy controls this value; it is never an editable field. */
  readonly visibility: 'public' | 'members' | 'hidden'
}

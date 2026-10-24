/** Account access is separate from paid association membership and artist IDs. */
export interface SupabaseAccount {
  id: string
  email: string
  displayName: string
  locale: 'ko' | 'en' | 'ja' | 'zh'
  role: 'member' | 'admin'
  assuranceLevel: 'aal1' | 'aal2'
  artistIds: string[]
  createdAt: string
  updatedAt: string
}

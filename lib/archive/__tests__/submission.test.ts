import { submissionSchema, canSubmitForArtist } from '../submission'
const valid = {
  artistId: 'c497df6b-4907-4fb0-811b-eedfa050fb77',
  title: '작품',
  titleHanja: '',
  titleEn: '',
  style: '해서',
  width: 35,
  height: 135,
  year: 2024,
  materials: '먹',
  transcription: '',
  interpretation: '',
  interpretationEn: '',
  source: '',
  seal: '',
  recordTitle: '',
  organizer: '',
  contestRef: '',
  status: 'pending_review',
}
describe('archive submission trust boundary', () => {
  it('accepts a review request but rejects publishing or certification escalation', () => {
    expect(submissionSchema.safeParse(valid).success).toBe(true)
    for (const change of [
      { status: 'published' },
      { is_asca_verified: true },
      { created_by: 'admin' },
      { claimed_by_user_id: 'attacker' },
    ])
      expect(submissionSchema.safeParse({ ...valid, ...change }).success).toBe(false)
  })
  it('rejects missing artist identity and invalid dimensions/year', () => {
    for (const change of [
      { artistId: 'user_a' },
      { width: 0 },
      { height: -1 },
      { year: 9999 },
      { title: '' },
    ])
      expect(submissionSchema.safeParse({ ...valid, ...change }).success).toBe(false)
  })
  it('permits only the bound Clerk identity or an administrator', () => {
    expect(canSubmitForArtist('user_a', 'user_a', false)).toBe(true)
    expect(canSubmitForArtist('user_a', 'user_b', false)).toBe(false)
    expect(canSubmitForArtist('user_a', null, false)).toBe(false)
    expect(canSubmitForArtist('user_a', null, true)).toBe(true)
  })
})

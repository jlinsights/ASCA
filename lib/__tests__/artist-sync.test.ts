import { mapArtistSync } from '../artist-sync'

describe('archive-safe artist mapping', () => {
  it('maps existing Airtable names and separates private contacts', () => {
    expect(
      mapArtistSync({
        'Name (Korean)': '작가',
        'Name (Chinese)': '書',
        Phone: '010',
        Email: 'a@example.com',
        DOB: '1960-01-01',
      })
    ).toEqual({
      artist: { name: '작가', name_zh: '書', birth_year: 1960 },
      contacts: { phone: '010', email: 'a@example.com' },
    })
  })
  it('does not allow Airtable to overwrite archive ownership, visibility or certification', () => {
    const fields = Object.fromEntries(
      [
        'visibility',
        'claimed_by_user_id',
        'archive_bio',
        'archive_bio_en',
        'profile_image_path',
        'art_name_ko',
        'certified_at',
        'certification_grade',
        'calligraphy_styles',
        'teacher_artist_id',
        'branch_name',
        'id',
        'airtable_id',
      ].map(k => [k, 'override'])
    )
    expect(mapArtistSync({ ...fields, name: '기존 이름', bio: '기존 소개' })).toEqual({
      artist: { name: '기존 이름', bio: '기존 소개' },
      contacts: {},
    })
  })
  it('preserves omitted contact values and supports explicit clearing', () => {
    expect(mapArtistSync({ Email: null, name: '작가' }).contacts).toEqual({ email: null })
    expect(mapArtistSync({ name: '작가' }).contacts).toEqual({})
  })
})

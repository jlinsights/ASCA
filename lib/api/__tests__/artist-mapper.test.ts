import { artNameLabel, toPublicArtist, type ArtistDbRow } from '../artist-mapper'

const row: ArtistDbRow = {
  id: 'a1',
  name: '김정호',
  name_en: 'Kim Jeongho',
  name_ja: 'キム・ジョンホ',
  name_zh: '金正浩',
  bio: '서예가',
  bio_en: null,
  bio_ja: null,
  bio_zh: null,
  birth_year: 1960,
  death_year: null,
  nationality: '대한민국',
  specialties: ['해서', '행서'],
  awards: [],
  exhibitions: [],
  profile_image: 'https://x/p.jpg',
  membership_type: '정회원',
  artist_type: '초대작가',
  title: '이사',
  created_at: '2026-10-10T00:00:00Z',
  updated_at: '2026-10-10T00:00:00Z',
  airtable_id: null,
  slug: 'test-artist',
  art_name_ko: '청산',
  art_name_hanja: ' 靑山 ',
}

describe('toPublicArtist', () => {
  // PostgREST 는 snake_case 컬럼을 그대로 돌려준다 — 화면이 읽는 camelCase 로 바꾸는 경계
  it('maps snake_case columns to the camelCase fields the UI reads', () => {
    expect(toPublicArtist(row)).toEqual({
      id: 'a1',
      name: '김정호',
      nameEn: 'Kim Jeongho',
      nameJa: 'キム・ジョンホ',
      nameZh: '金正浩',
      bio: '서예가',
      birthYear: 1960,
      deathYear: null,
      nationality: '대한민국',
      specialties: ['해서', '행서'],
      awards: [],
      profileImage: 'https://x/p.jpg',
      membershipType: '정회원',
      artistType: '초대작가',
      title: '이사',
      slug: 'test-artist',
      artNameKo: '청산',
      artNameHanja: '靑山',
    })
  })

  it('normalises missing optional columns to null and empty arrays', () => {
    const sparse = toPublicArtist({
      ...row,
      name_en: null,
      birth_year: null,
      profile_image: null,
      specialties: null,
      awards: null,
      membership_type: null,
    })
    expect(sparse.nameEn).toBeNull()
    expect(sparse.birthYear).toBeNull()
    expect(sparse.profileImage).toBeNull()
    expect(sparse.specialties).toEqual([])
    expect(sparse.awards).toEqual([])
    expect(sparse.membershipType).toBeNull()
  })

  it('slug 를 고르지 않은 행이면 slug 는 null', () => {
    const { slug: _omit, ...withoutSlug } = row
    expect(toPublicArtist(withoutSlug).slug).toBeNull()
  })

  it('아호 컬럼을 고르지 않았거나 빈 칸이면 null', () => {
    const { art_name_ko: _ko, ...withoutKo } = row
    expect(toPublicArtist(withoutKo).artNameKo).toBeNull()
    expect(toPublicArtist({ ...row, art_name_hanja: '  ' }).artNameHanja).toBeNull()
  })
})

describe('artNameLabel', () => {
  it.each([
    ['청산', '靑山', '靑山'],
    [null, '靑山', '靑山'],
    ['솔바람', null, '솔바람'],
    ['청산', '청산', '청산'],
    [null, null, null],
    ['', '  ', null],
  ])('한글 %p · 한자 %p → %p', (ko, hanja, expected) => {
    expect(artNameLabel(ko, hanja)).toBe(expected)
  })
})

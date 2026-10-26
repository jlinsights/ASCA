import { candidatesFor, lookupNames, nameKey, type EntryArtist } from '../admin-entries'

const artist = (id: string, name: string, name_zh: string | null = null): EntryArtist => ({
  id,
  name,
  name_zh,
  membership_type: null,
  visibility: 'public',
})

describe('출품 작가 후보', () => {
  it('띄어쓰기만 다른 이름은 같게 본다', () => {
    expect(nameKey(' 김 정 례 ')).toBe('김정례')
    expect(nameKey('   ')).toBeNull()
    expect(lookupNames(['김 정 례', null, '김정례', ' '])).toEqual(['김 정 례', '김정례'])
  })

  it('이름·한자 둘 다 맞는 작가를 앞에 두고, 맞지 않는 작가는 뺀다', () => {
    const result = candidatesFor({ entrant_name: '김정례', entrant_name_hanja: '金貞禮' }, [
      artist('name-only', '김정례'),
      artist('both', '김 정례', '金貞禮'),
      artist('hanja-only', '김정레', '金貞禮'),
      artist('other', '이권재', '李權載'),
    ])
    expect(result.map(c => [c.id, c.reason])).toEqual([
      ['both', 'both'],
      ['hanja-only', 'hanja'],
      ['name-only', 'name'],
    ])
  })

  it('출품자 이름이 없으면 후보도 없다', () => {
    expect(
      candidatesFor({ entrant_name: null, entrant_name_hanja: ' ' }, [artist('a', '')])
    ).toEqual([])
  })

  it('후보는 다섯 명까지', () => {
    const many = Array.from({ length: 8 }, (_, i) => artist(`a${i}`, '김정례'))
    expect(candidatesFor({ entrant_name: '김정례', entrant_name_hanja: null }, many)).toHaveLength(
      5
    )
  })
})

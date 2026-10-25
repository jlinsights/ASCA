import { nextGalleryQuery } from '../GalleryPageClient'

describe('nextGalleryQuery — 갤러리 주소 갱신', () => {
  // 회귀: 'all' 을 모든 키의 기본값으로 지워 similar=all(모두 펼침)이 주소에 남지 않았다
  it('비슷한 사진 모두 보기는 similar=all 로 남는다', () => {
    expect(nextGalleryQuery('category=sac&page=3', { similar: 'all' })).toBe(
      'category=sac&similar=all'
    )
    expect(nextGalleryQuery('similar=all', { similar: '' })).toBe('')
  })

  it('연도·분류의 all 과 1쪽은 기본값이라 지운다', () => {
    expect(nextGalleryQuery('year=2025&category=sac', { year: 'all', category: 'all' })).toBe('')
    expect(nextGalleryQuery('page=4', { page: '1' })).toBe('')
    expect(nextGalleryQuery('year=2025', { page: '2' })).toBe('year=2025&page=2')
  })

  it('거르는 조건이 바뀌면 1쪽으로 돌아간다', () => {
    expect(nextGalleryQuery('page=5&similar=all', { search: '시상' })).toBe(
      'similar=all&search=%EC%8B%9C%EC%83%81'
    )
  })
})

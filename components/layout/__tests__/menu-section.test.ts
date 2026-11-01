import { currentMenuHref, findMenuGroup, findMenuGroupForEyebrow } from '../menu-section'

const params = (query: string) => new URLSearchParams(query)

describe('메뉴 묶음 찾기 — 머리 눈썹·번호 목차', () => {
  it.each([
    ['/contests', 'exhibitions'],
    ['/exhibitions/past', 'exhibitions'],
    ['/artists', 'artists'],
    ['/artists/homepages', 'artists'],
    ['/regulations', 'regulations'],
    ['/academy', 'membership'],
    ['/community/board', 'news'],
    ['/faq', 'contact'],
    ['/history', 'about'],
  ])('%s → %s', (pathname, key) => {
    expect(findMenuGroup(pathname)?.key).toBe(key)
  })

  it('메뉴에 없는 페이지는 목차를 그리지 않는다', () => {
    expect(findMenuGroup('/privacy-policy')).toBeUndefined()
    expect(findMenuGroup('/notice/12')).toBeUndefined()
    expect(findMenuGroup(null)).toBeUndefined()
  })

  it('상세 페이지 눈썹은 가장 가까운 메뉴 항목의 묶음을 따른다', () => {
    expect(findMenuGroupForEyebrow('/notice/12')?.key).toBe('news')
    expect(findMenuGroupForEyebrow('/exhibitions/past/3')?.key).toBe('exhibitions')
    expect(findMenuGroupForEyebrow('/privacy-policy')).toBeUndefined()
  })
})

describe('지금 항목', () => {
  const artists = findMenuGroup('/artists')!

  it('쿼리가 없으면 작가 소개', () => {
    expect(currentMenuHref(artists, '/artists', params(''))).toBe('/artists')
  })

  it('등급·직함 쿼리가 맞으면 그 항목만', () => {
    expect(currentMenuHref(artists, '/artists', params('membershipType=초대작가'))).toBe(
      `/artists?${params('membershipType=초대작가').toString()}`
    )
    expect(currentMenuHref(artists, '/artists', params('title=고문'))).toBe(
      `/artists?${params('title=고문').toString()}`
    )
  })

  it('쿼리를 모르면(정적 첫 그림) 쿼리 없는 항목으로 둔다', () => {
    expect(currentMenuHref(artists, '/artists', null)).toBe('/artists')
  })
})

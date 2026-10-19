import { generateOrganizationSchema } from '../seo'
import { SOCIAL_LINKS } from '../social-links'

describe('Organization JSON-LD sameAs', () => {
  it('공식 소셜 채널·링크 모음 다섯 곳을 검색엔진에 알린다', () => {
    const { sameAs } = generateOrganizationSchema()
    expect(sameAs).toEqual(SOCIAL_LINKS.map(link => link.href))
    expect(sameAs).toHaveLength(5)
    for (const url of sameAs) expect(url).toMatch(/^https:\/\//)
  })
})

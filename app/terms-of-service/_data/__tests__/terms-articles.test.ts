import { termsAddenda, termsArticles } from '../terms-articles'

const allText = (): string[] => [
  ...termsArticles.flatMap(article => [
    article.title,
    ...article.clauses.flatMap(clause => [clause.text, ...(clause.items ?? [])]),
  ]),
  ...termsAddenda,
]

describe('이용약관 본문', () => {
  // 회귀: 약칭을 '서협' 으로 적었다 — 협회의 약칭은 '동양서협' 이다
  it('약칭은 동양서협만 쓴다', () => {
    const bare = allText().filter(text => /(?<!동양)서협/.test(text))
    expect(bare).toStrictEqual([])
    expect(termsArticles[0].clauses[0].text).toContain('(이하 "동양서협")')
  })

  // 회귀: 없는 제7조·제8조를 가리키고, 제3조가 제15조 제1항을 잘못 인용했다
  it('제N조 제M항 참조는 실제 조·항을 가리킨다', () => {
    const broken: string[] = []
    for (const text of allText()) {
      for (const match of text.matchAll(/제(\d+)조(?:\s*제(\d+)항)?/g)) {
        const article = termsArticles[Number(match[1]) - 1]
        const clauseCount = article?.clauses.length ?? 0
        if (!article || (match[2] && Number(match[2]) > clauseCount)) broken.push(match[0])
      }
    }
    expect(broken).toStrictEqual([])
  })

  // 회귀: 쇼핑몰 표준약관 문구(재화·용역 품절, 마일리지·적립금, 업체 간 통합)가 남아 있었다
  it('협회와 무관한 전자상거래 문구가 없다', () => {
    const commerce = allText().filter(text =>
      /재화|용역|품절|마일리지|적립금|업체간|업체 간/.test(text)
    )
    expect(commerce).toStrictEqual([])
  })

  it('폐지된 「전자거래기본법」 대신 현행 법령명을 쓴다', () => {
    const joined = allText().join('\n')
    expect(joined).not.toMatch(/전자거래기본법/)
    expect(joined).toContain('「전자문서 및 전자거래 기본법」')
  })

  it('탈퇴·통지·개인정보 조항이 있다', () => {
    const titles = termsArticles.map(article => article.title)
    expect(titles).toEqual(
      expect.arrayContaining(['회원 탈퇴 및 자격 상실', '이용자에 대한 통지', '개인정보 보호'])
    )
    expect(termsArticles.find(a => a.title === '개인정보 보호')?.link?.href).toBe('/privacy-policy')
  })
})

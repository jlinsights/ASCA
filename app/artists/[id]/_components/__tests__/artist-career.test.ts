import { parseArtistCareer } from '../artist-career'

describe('parseArtistCareer', () => {
  it('한 줄에 한 경력씩 적은 bio 는 연보로 옮기고 연도를 따로 뽑는다', () => {
    const bio = [
      '제10회(2013) 대한민국 동양서예대전 특선, 입선(문인화)',
      '제11회(2014) 대한민국 동양서예대전 삼체상(문인화)수상',
    ].join('\n')
    expect(parseArtistCareer(bio)).toEqual({
      paragraphs: [],
      entries: [
        { year: 2013, text: '제10회 대한민국 동양서예대전 특선, 입선(문인화)' },
        { year: 2014, text: '제11회 대한민국 동양서예대전 삼체상(문인화)수상' },
      ],
    })
  })

  it('산문 소개는 빈 줄 기준 문단으로 둔다 — 年 이 든 산문 줄도 연보로 옮기지 않는다', () => {
    const bio = '劉振江（易石），1952年1月生，\n\n北京人。祖籍，山東濱州。畢業於中央美術學院國畫專業。'
    expect(parseArtistCareer(bio)).toEqual({
      paragraphs: ['劉振江（易石），1952年1月生，', '北京人。祖籍，山東濱州。畢業於中央美術學院國畫專業。'],
      entries: [],
    })
  })

  it('경력처럼 보이는 줄이 하나뿐이면 문단에 남긴다', () => {
    const parsed = parseArtistCareer('서예를 40년 하였다.\n2019 개인전 개최')
    expect(parsed.entries).toEqual([])
    expect(parsed.paragraphs).toEqual(['서예를 40년 하였다.', '2019 개인전 개최'])
  })

  it('글머리표 줄은 연도가 없어도 연보로, awards·exhibitions 배열도 덧붙인다', () => {
    const parsed = parseArtistCareer('• 한국서가협회 회원\n- 서울서예대전 심사위원', {
      awards: ['2020 동양서예대전 대상'],
      exhibitions: [' '],
    })
    expect(parsed.entries).toEqual([
      { year: null, text: '한국서가협회 회원' },
      { year: null, text: '서울서예대전 심사위원' },
      { year: 2020, text: '2020 동양서예대전 대상' },
    ])
  })

  it('비어 있으면 둘 다 빈 배열', () => {
    expect(parseArtistCareer(null)).toEqual({ paragraphs: [], entries: [] })
  })
})

import { artistNativeName } from '../artist-name'

describe('artistNativeName', () => {
  const artist = { name: '가상 작가', nameJa: '書家一', nameZh: '書家二' }

  it.each(['日本', '일본', 'Japan', ' JP ', 'JPN'])(
    '%s: 일본어 한자 이름을 우선 표시한다',
    nationality => expect(artistNativeName({ ...artist, nationality })).toBe('書家一')
  )
  it.each(['中國', '中国', '중국', 'China', ' CN ', 'CHN'])(
    '%s: 중국어 한자 이름을 표시한다',
    nationality => expect(artistNativeName({ ...artist, nationality })).toBe('書家二')
  )
  it('일본어 칸이 없거나 가나뿐이면 등록된 한자 이름을 쓴다', () => {
    expect(artistNativeName({ ...artist, nationality: '日本', nameJa: null })).toBe('書家二')
    expect(artistNativeName({ ...artist, nationality: '日本', nameJa: 'テスト' })).toBe('書家二')
  })
  it.each([null, '', '  ', 'Test', '가상작가', '書家 작가'])(
    '한자 이름 %p가 사용할 수 없으면 기본 이름을 유지한다',
    nameZh => expect(artistNativeName({ ...artist, nationality: '中國', nameZh })).toBe('가상 작가')
  )
  it('확장 한자·공백을 포함한 실제 원어 표기를 보존한다', () => {
    expect(artistNativeName({ ...artist, nationality: '日本', nameJa: '  𠮷田 一  ' })).toBe(
      '𠮷田 一'
    )
  })
  it.each(['韓國', '대한민국', 'Korea', null, '', '일본계 한국'])(
    '%p: 다른 국적이나 미상인 작가는 기본 이름을 유지한다',
    nationality => expect(artistNativeName({ ...artist, nationality })).toBe('가상 작가')
  )
})

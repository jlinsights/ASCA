import { nameScale } from '../artist-hero'

describe('nameScale', () => {
  it.each([
    ['민문자', 'short'],
    ['刘建格', 'short'],
    ['张军', 'short'],
    ['남궁민수', 'medium'],
    ['志井惠風子葉', 'long'],
    ['Min Mun-ja', 'long'],
  ])('%s → %s', (name, expected) => {
    expect(nameScale(name)).toBe(expected)
  })

  it('counts characters, not UTF-16 units, and ignores outer spaces', () => {
    expect(nameScale(' 𠀋𠀌𠀍 ')).toBe('short')
  })
})

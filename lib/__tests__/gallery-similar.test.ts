import { groupSimilar, hamming, type SimilarEntry } from '../gallery-similar'

const ZERO = '0'.repeat(64)

/** 앞에서부터 n 비트를 뒤집은 해시 — 거리 n 을 정확히 만든다 */
function flipped(bits: number): string {
  const nibbles = ZERO.split('').map(() => 0)
  for (let i = 0; i < bits; i++) nibbles[Math.floor(i / 4)]! |= 8 >> i % 4
  return nibbles.map(n => n.toString(16)).join('')
}

function entry(key: string, bits: number, overrides: Partial<SimilarEntry> = {}): SimilarEntry {
  return {
    key: `/images/gallery/2026/sac_2026-04-19/${key}`,
    category: 'sac',
    hash: flipped(bits),
    color: [200, 200, 200],
    ...overrides,
  }
}

describe('hamming', () => {
  it('다른 비트 수를 센다', () => {
    expect(hamming(ZERO, flipped(0))).toBe(0)
    expect(hamming(ZERO, flipped(37))).toBe(37)
  })
})

describe('groupSimilar', () => {
  it('연속 촬영으로 거의 같은 사진은 첫 장을 대표로 묶는다', () => {
    const groups = groupSimilar([
      entry('JTL0100-1', 0),
      entry('JTL0101-1', 10),
      entry('JTL0102-1', 20),
    ])
    expect(groups.get(entry('JTL0101-1', 0).key)).toBe(entry('JTL0100-1', 0).key)
    expect(groups.get(entry('JTL0102-1', 0).key)).toBe(entry('JTL0100-1', 0).key)
  })

  it('다른 장면은 따로 둔다', () => {
    const groups = groupSimilar([entry('JTL0100-1', 0), entry('JTL0101-1', 120)])
    expect(groups.get(entry('JTL0101-1', 0).key)).toBe(entry('JTL0101-1', 0).key)
  })

  // 사슬 효과: A~B, B~C 가 가까워도 A 와 C 가 멀면 한 묶음이 되면 안 된다(흰 벽 전시장 사진이 통째로 묶인다)
  it('대표와 비교해 사슬처럼 번지지 않는다', () => {
    const groups = groupSimilar([
      entry('JTL0100-1', 0),
      entry('JTL0101-1', 40),
      entry('JTL0102-1', 80), // 앞 장과는 40, 대표와는 80
    ])
    expect(groups.get(entry('JTL0102-1', 0).key)).toBe(entry('JTL0102-1', 0).key)
  })

  // 시상기념: 같은 단상·배경에 수상자만 바뀐다. 다른 사람의 수상 사진을 숨기면 안 된다(실측 d=57 에서 다른 사람)
  it('시상 사진은 훨씬 엄격하게 묶는다', () => {
    const award = (key: string, bits: number) =>
      entry(key, bits, { key: `/images/gallery/2025/award_2025/${key}`, category: 'award' })
    const groups = groupSimilar([
      award('JTL0200-1', 0),
      award('JTL0201-1', 8),
      award('JTL0202-1', 30),
    ])
    // 재촬영(거리 8)은 묶고, 다른 분류라면 묶였을 거리 30 은 시상 사진에선 따로 둔다
    expect(groups.get(award('JTL0201-1', 0).key)).toBe(award('JTL0200-1', 0).key)
    expect(groups.get(award('JTL0202-1', 0).key)).toBe(award('JTL0202-1', 0).key)
    expect(
      groupSimilar([entry('JTL0200-1', 0), entry('JTL0202-1', 30)]).get(entry('JTL0202-1', 0).key)
    ).toBe(entry('JTL0200-1', 0).key)
  })

  it('다른 행사 폴더끼리는 묶지 않는다', () => {
    const other = entry('JTL0101-1', 0, { key: '/images/gallery/2026/event_2026-04-19/JTL0101-1' })
    const groups = groupSimilar([entry('JTL0100-1', 0), other])
    expect(groups.get(other.key)).toBe(other.key)
  })

  it('번호가 멀리 떨어진 사진은 묶지 않는다', () => {
    const groups = groupSimilar([entry('JTL0100-1', 0), entry('JTL0190-1', 0)])
    expect(groups.get(entry('JTL0190-1', 0).key)).toBe(entry('JTL0190-1', 0).key)
  })

  it('구도가 같아도 색이 크게 다르면 묶지 않는다', () => {
    const groups = groupSimilar([
      entry('JTL0100-1', 0),
      entry('JTL0101-1', 0, { color: [40, 40, 40] }),
    ])
    expect(groups.get(entry('JTL0101-1', 0).key)).toBe(entry('JTL0101-1', 0).key)
  })

  it('한 묶음은 최대 8장', () => {
    const groups = groupSimilar(
      Array.from({ length: 12 }, (_, i) => entry(`JTL01${String(i).padStart(2, '0')}-1`, 0))
    )
    const covers = new Set(groups.values())
    expect(covers.size).toBe(2)
  })
})

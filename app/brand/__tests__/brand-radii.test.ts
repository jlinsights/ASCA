/**
 * /brand 의 반경 견본(RADII)이 DESIGN.md front matter `rounded` 단계와 같은지 확인한다.
 * `full`(알약)과 지역 반경(panel·tile·seal)은 견본에 넣지 않는다.
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { RADII } from '../_components/brand-data'

const NOT_SAMPLED = new Set(['full', 'panel', 'tile', 'seal'])

function designRadii(): { name: string; px: number }[] {
  const md = readFileSync(resolve(__dirname, '../../../docs/02-design/DESIGN.md'), 'utf8')
  const block = md.match(/^rounded:\n((?:[ #].*\n)+)/m)?.[1] ?? ''
  return [...block.matchAll(/^ {2}(\w+): '([\d.]+)rem'/gm)]
    .filter(([, name]) => !NOT_SAMPLED.has(name))
    .map(([, name, rem]) => ({ name, px: parseFloat(rem) * 16 }))
}

describe('brand radius samples', () => {
  it('match the DESIGN.md rounded scale', () => {
    expect(RADII.map(r => ({ name: r.name, px: r.px }))).toEqual(designRadii())
  })
})

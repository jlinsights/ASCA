/**
 * @jest-environment node
 *
 * 루트 레이아웃(app/layout.tsx)이 모든 페이지를 <main id='main-content'> 로 감싼다.
 * 페이지·컴포넌트가 <main> 을 또 쓰면 한 문서에 main 랜드마크가 겹친다(HTML 규칙 위반, 스크린리더 혼란).
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.join(__dirname, '../..')
const ALLOWED = new Set([
  'app/layout.tsx',
  // shadcn 원본 — 아직 쓰는 곳이 없다. 쓰게 되면 루트 main 과 겹치지 않게 바꿀 것
  'components/ui/sidebar.tsx',
])

function sources(dir: string): string[] {
  return fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true }).flatMap(entry => {
    const rel = path.join(dir, entry.name)
    if (entry.isDirectory()) return entry.name === '__tests__' ? [] : sources(rel)
    return entry.name.endsWith('.tsx') ? [rel] : []
  })
}

it('only the root layout renders a <main> landmark', () => {
  const offenders = [...sources('app'), ...sources('components')].filter(
    file =>
      !ALLOWED.has(file.split(path.sep).join('/')) &&
      /<main[\s>]/.test(fs.readFileSync(path.join(ROOT, file), 'utf8'))
  )
  expect(offenders).toEqual([])
})

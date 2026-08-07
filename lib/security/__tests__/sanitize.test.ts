import fs from 'node:fs'
import path from 'node:path'

import { sanitizeHTML } from '../sanitize'

describe('sanitizeHTML', () => {
  it('스크립트와 이벤트 핸들러를 제거한다', () => {
    const dirty = '<p onclick="alert(1)">안전한 내용</p><script>alert(1)</script>'

    expect(sanitizeHTML(dirty)).toBe('<p>안전한 내용</p>')
  })

  it('클라이언트 번들에 jsdom을 포함하는 isomorphic-dompurify를 사용하지 않는다', () => {
    const source = fs.readFileSync(path.resolve(__dirname, '../sanitize.ts'), 'utf8')

    expect(source).not.toContain('isomorphic-dompurify')
    expect(source).toContain("from 'dompurify'")
  })
})

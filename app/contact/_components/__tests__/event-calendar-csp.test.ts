/**
 * 회귀: /contact "행사 및 전시회 일정" Luma 캘린더가 프로덕션 CSP frame-src 에 없어
 * 빈 칸으로 보였다. iframe 이 부르는 오리진이 frame-src 에 있는지를 묶어 둔다.
 */
import fs from 'node:fs'
import path from 'node:path'

const nextConfig = require('../../../../next.config.js')

async function productionFrameSrc(): Promise<string[]> {
  const env = process.env as Record<string, string | undefined>
  const original = env.NODE_ENV
  env.NODE_ENV = 'production'
  let groups: { headers: { key: string; value: string }[] }[]
  try {
    groups = await nextConfig.headers()
  } finally {
    env.NODE_ENV = original
  }
  const value = groups.flatMap(g => g.headers).find(h => h.key === 'Content-Security-Policy')?.value
  if (!value) throw new Error('Content-Security-Policy 헤더가 없다')
  const directive = value
    .split(';')
    .map(d => d.trim().split(/\s+/))
    .find(([name]) => name === 'frame-src')
  return directive ? directive.slice(1) : []
}

const calendarSource = fs.readFileSync(path.join(__dirname, '..', 'event-calendar.tsx'), 'utf8')

describe('/contact 행사 캘린더(Luma) CSP', () => {
  it('iframe 오리진이 frame-src 에 있다', async () => {
    const src = calendarSource.match(/src='(https:\/\/[^']+)'/)?.[1]
    expect(src).toBeDefined()
    const origin = new URL(src as string).origin
    expect(await productionFrameSrc()).toContain(origin)
  })

  it('lu.ma 가 아니라 리다이렉트 최종 도메인 luma.com 을 직접 부른다', () => {
    expect(calendarSource).toContain('https://luma.com/embed/calendar/')
  })
})

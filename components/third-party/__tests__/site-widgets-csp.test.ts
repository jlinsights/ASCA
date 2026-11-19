/**
 * 회귀: 프로덕션 CSP 가 서드파티 스크립트를 막아도 build·lint·test 는 모두 통과한다
 * (2026-08 Clerk 장애 — next.config.js 상단 주석). 위젯이 부르는 오리진이 CSP 에
 * 들어 있는지를 여기서 묶어 둔다.
 */
import fs from 'node:fs'
import path from 'node:path'

const nextConfig = require('../../../next.config.js')

// next.config.js 는 headers() 를 부를 때 NODE_ENV 로 dev/프로덕션 CSP 를 고른다.
// 실행 환경(NODE_ENV=development 인 셸 등)과 무관하게 프로덕션 정책을 본다.
async function productionCsp(): Promise<Record<string, string[]>> {
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
  return Object.fromEntries(
    value
      .split(';')
      .map(d => d.trim().split(/\s+/))
      .filter(parts => parts[0])
      .map(([name, ...sources]) => [name, sources])
  )
}

const widgetSource = fs.readFileSync(path.join(__dirname, '..', 'site-widgets.tsx'), 'utf8')

describe('전역 위젯(Cal.com) CSP', () => {
  it('완화된 개발용 정책이 아니라 프로덕션 정책을 검사한다', async () => {
    const csp = await productionCsp()
    expect(csp['default-src']).toEqual(["'self'"])
  })

  it('위젯 코드가 부르는 스크립트 오리진이 script-src 에 모두 있다', async () => {
    const csp = await productionCsp()
    const scriptOrigins = [
      ...widgetSource.matchAll(/https:\/\/[a-z0-9.-]+(?=\/[^"'\s]*\.js)/g),
    ].map(m => m[0])
    expect(scriptOrigins).toEqual(expect.arrayContaining(['https://app.cal.com']))
    for (const origin of scriptOrigins) expect(csp['script-src']).toContain(origin)
  })

  it('Cal.com 예약 창(iframe)과 API 를 허용한다', async () => {
    const csp = await productionCsp()
    expect(csp['frame-src']).toEqual(expect.arrayContaining(['https://app.cal.com']))
    expect(csp['connect-src']).toContain('https://app.cal.com')
  })

  // 2026-11-01 채널톡 위젯을 빼고 카카오톡 채널 링크(KakaoChatButton)로 바꿨다.
  // 스크립트가 다시 들어오면 CSP 예외도 같이 되살려야 하므로 둘 다 없는 상태를 묶어 둔다.
  it('채널톡 스크립트를 싣지 않고, CSP 에도 channel.io 예외가 없다', async () => {
    expect(widgetSource).not.toMatch(/channel\.io|ChannelIO/)
    const csp = await productionCsp()
    expect(Object.values(csp).flat().join(' ')).not.toContain('channel.io')
  })
})

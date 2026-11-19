/**
 * 이미지 최적화를 끈 뒤(2026-11-01, Vercel 한도 초과로 /_next/image 가 402) 브라우저가 원격 이미지를
 * 직접 받는다. 그래서 next/image 가 쓰던 원격 호스트가 프로덕션 CSP img-src 에 모두 있어야 한다 —
 * 빠지면 build·test 는 통과해도 사진만 조용히 깨진다(R2 지원 서식·운영 Supabase 주소가 그랬다).
 */
const nextConfig = require('../../../next.config.js')

async function productionImgSrc(): Promise<string[]> {
  const env = process.env as Record<string, string | undefined>
  const original = env.NODE_ENV
  env.NODE_ENV = 'production'
  let groups: { headers: { key: string; value: string }[] }[]
  try {
    groups = await nextConfig.headers()
  } finally {
    env.NODE_ENV = original
  }
  const csp = groups.flatMap(g => g.headers).find(h => h.key === 'Content-Security-Policy')?.value
  const directive = csp
    ?.split(';')
    .map(d => d.trim())
    .find(d => d.startsWith('img-src '))
  if (!directive) throw new Error('img-src 가 없다')
  return directive.split(/\s+/).slice(1)
}

describe('이미지 직접 로드', () => {
  it('Vercel 이미지 최적화를 쓰지 않는다 (한도 초과 402)', () => {
    expect(nextConfig.images.unoptimized).toBe(true)
  })

  it('next/image 원격 호스트가 모두 프로덕션 img-src 에 있다', async () => {
    const imgSrc = await productionImgSrc()
    const hosts = nextConfig.images.remotePatterns.map(
      (pattern: { hostname: string }) => `https://${pattern.hostname}`
    )
    expect(hosts).toEqual(
      expect.arrayContaining([
        'https://caxjyimsuvjnbmjoxfad.supabase.co',
        'https://pub-918cc20d48bd44a29913d2bf8f72a874.r2.dev',
      ])
    )
    for (const host of hosts) expect(imgSrc).toContain(host)
  })

  it('img-src 에 같은 출처가 두 번 들어가지 않는다', async () => {
    const imgSrc = await productionImgSrc()
    expect(new Set(imgSrc).size).toBe(imgSrc.length)
  })
})

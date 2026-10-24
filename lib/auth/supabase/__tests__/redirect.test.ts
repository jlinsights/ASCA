import { safeAuthRedirect } from '../redirect'

describe('authentication return URL', () => {
  it.each([
    undefined,
    null,
    '',
    'https://attacker.example',
    '//attacker.example',
    '/\\attacker.example',
    '/%5cattacker.example',
    '/%2fattacker.example',
    '/%252fattacker.example',
    '/%0a/attacker.example',
    '/\n/attacker.example',
    '/%E0%A4%A',
    'javascript:alert(1)',
  ])('rejects an unsafe destination: %s', destination => {
    expect(safeAuthRedirect(destination)).toBe('/profile')
  })

  it.each(['/profile', '/artists?search=홍길동', '/contests/id/apply?next=1#terms'])(
    'preserves a local destination: %s',
    destination => {
      expect(safeAuthRedirect(destination)).toBe(destination)
    }
  )
})

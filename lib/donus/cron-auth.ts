import { timingSafeEqual } from 'node:crypto'

/**
 * Vercel Cron 은 Authorization: Bearer $CRON_SECRET 을 붙여 부른다.
 * 비밀값이 없으면 "Bearer undefined" 가 통과하지 않도록 늘 거절한다.
 */
export function isCronAuthorized(authorization: string | null): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const given = Buffer.from(authorization ?? '')
  const expected = Buffer.from(`Bearer ${secret}`)
  return given.length === expected.length && timingSafeEqual(given, expected)
}

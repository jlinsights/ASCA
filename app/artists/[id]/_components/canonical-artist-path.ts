/**
 * 대표 slug 가 있고 요청 주소 조각이 그 slug 가 아니면(uuid·옛 주소) 옮겨 갈 주소.
 * 이미 대표 주소면 null.
 */
export function canonicalArtistPath(
  requested: string,
  slug: string | null | undefined
): string | null {
  if (!slug || requested.toLowerCase() === slug.toLowerCase()) return null
  return `/artists/${encodeURIComponent(slug)}`
}

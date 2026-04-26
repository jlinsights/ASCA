/**
 * 전시 타이틀에서 hero 워터마크용 캐릭터 추출.
 * 한자 우선 → 한글 폴백 → 기본 "書"
 */
export function pickWatermarkChar(title: string): string {
  const hanjaMatch = title.match(/[一-鿿]+/g)
  if (hanjaMatch?.length) {
    return hanjaMatch.join('').slice(0, 2)
  }
  const hangulMatch = title.match(/[가-힯]/)
  if (hangulMatch) return hangulMatch[0]
  return '書'
}

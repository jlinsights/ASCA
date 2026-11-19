// 가견적 계산기는 기본 비활성이다. 서버 환경 변수 CATALOG_QUOTE_PREVIEW=on 일 때만 열린다.
export function catalogQuoteEnabled(): boolean {
  return process.env.CATALOG_QUOTE_PREVIEW === 'on'
}

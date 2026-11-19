/**
 * 언어를 바꿀 때의 전체 이동. 서버가 그 언어로 <html lang> 과 첫 화면을 다시 그리게 한다.
 * 따로 둔 까닭: jsdom 은 window.location 이동을 흉내 낼 수 없어 테스트가 이 모듈을 jest.mock 한다.
 */
export function navigateTo(url: string, { replace = false }: { replace?: boolean } = {}): void {
  if (replace) window.location.replace(url)
  else window.location.assign(url)
}

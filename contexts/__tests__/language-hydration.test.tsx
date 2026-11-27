import { act, lazy, Suspense } from 'react'
import { renderToString } from 'react-dom/server.node'
import { hydrateRoot } from 'react-dom/client'
import { LanguageProvider, useLanguage } from '../language-context'

// jsdom 에서는 react-dom/server 가 브라우저용(MessageChannel 필요)으로 풀리므로 Node 용을 직접 쓴다

jest.mock('@/lib/i18n/navigate', () => ({ navigateTo: jest.fn() }))

// 회귀: 번역 주소가 없는 페이지(/sign-in·/sign-up)는 서버가 늘 한국어로 그리고, 마운트 뒤 쿠키 언어로 바꾼다.
// 로그인 폼은 Suspense 안이라 따로 늦게 수화(hydration)되는데, 그 전에 언어가 바뀌면 새 언어로 수화해
// 서버의 한국어 HTML 과 어긋났다(React #418, 2026-11-27 운영에서 asca-lang=ja 로 재현).
function Notice() {
  const { t } = useLanguage()
  return <strong>{t('authNativeReturningTitle')}</strong>
}

const KO = '예전 홈페이지에서 쓰시던 비밀번호는 옮겨지지 않았습니다.'
const JA = '旧ホームページのパスワードは引き継がれていません。'
const tick = () => new Promise(resolve => setTimeout(resolve, 20))

afterEach(() => {
  document.cookie = 'asca-lang=; path=/; max-age=0'
  document.body.innerHTML = ''
  window.history.pushState({}, '', '/')
})

it('늦게 수화되는 Suspense 영역도 서버 언어로 수화한 뒤 쿠키 언어로 바꾼다', async () => {
  window.history.pushState({}, '', '/sign-in')
  document.cookie = 'asca-lang=ja; path=/'

  const html = renderToString(
    <LanguageProvider>
      <Suspense fallback={null}>
        <Notice />
      </Suspense>
    </LanguageProvider>
  )
  expect(html).toContain(KO)

  // 폼 영역이 언어 전환보다 늦게 수화되도록 붙잡아 둔다
  let release!: () => void
  const gate = new Promise<void>(resolve => {
    release = resolve
  })
  const LateNotice = lazy(async () => {
    await gate
    return { default: Notice }
  })

  const container = document.createElement('div')
  container.innerHTML = html
  document.body.appendChild(container)
  const errors: unknown[] = []

  await act(async () => {
    hydrateRoot(
      container,
      <LanguageProvider>
        <Suspense fallback={null}>
          <LateNotice />
        </Suspense>
      </LanguageProvider>,
      { onRecoverableError: error => errors.push(error) }
    )
  })
  // 쿠키 언어(ja) 표를 받아 언어를 바꿀 시간을 준다 — 폼 영역은 아직 수화 전이다
  await act(tick)
  await act(async () => {
    release()
    await tick()
  })
  await act(tick)

  expect(errors).toEqual([])
  expect(container.textContent).toBe(JA)
})

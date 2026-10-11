import { readFileSync } from 'fs'
import path from 'path'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { LanguageProvider, useLanguage } from '../language-context'

// 공지 페이지가 t('…') 로 부르는 키 — 사전에 없으면 화면에 'noticeInquiry' 같은 키 이름이 그대로 찍힌다
const noticeSource = readFileSync(path.join(__dirname, '../../app/notice/page.tsx'), 'utf8')
const noticeKeys = [...new Set([...noticeSource.matchAll(/\bt\('([A-Za-z]+)'\)/g)].map(m => m[1]!))]

const wrapper = ({ children }: { children: ReactNode }) => (
  <LanguageProvider>{children}</LanguageProvider>
)

describe('notice page translation keys', () => {
  it('finds the keys the notice page uses', () => {
    expect(noticeKeys).toEqual(expect.arrayContaining(['noticeInquiry', 'generalNotice']))
  })

  it.each(['ko', 'en', 'ja', 'zh'] as const)(
    'resolves every notice key to text in %s',
    async lang => {
      const { result } = renderHook(() => useLanguage(), { wrapper })
      if (lang !== 'ko') {
        await act(async () => {
          await result.current.setLanguage(lang)
        })
        await waitFor(() => expect(result.current.language).toBe(lang))
      }
      const unresolved = noticeKeys.filter(key => result.current.t(key) === key)
      expect(unresolved).toEqual([])
    }
  )
})

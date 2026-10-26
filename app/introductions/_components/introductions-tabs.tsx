'use client'

import { useState } from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { ArrowDownToLine } from 'lucide-react'
import { AboutChapter } from '@/components/about/about-layout'
import { useLanguage } from '@/contexts/language-context'
import { SUPPORTED_LANGUAGES, isValidLanguage } from '@/lib/i18n'
import type { Language } from '@/lib/i18n/types'
import { chairmanMessages } from './chairman-message'

const BROCHURE_KO =
  'https://pub-918cc20d48bd44a29913d2bf8f72a874.r2.dev/소개자료/동양서예협회%20-%20The%20Asian%20Society%20of%20Calligraphic%20Arts%20(ASCA).pdf'
const BROCHURE_MULTI =
  'https://pub-918cc20d48bd44a29913d2bf8f72a874.r2.dev/소개자료/동양서예협회%20소개_한국어%20영어%20중국어%20일본어_PDF.pdf'

// 장 제목은 사이트 언어로 쓴다 — 탭으로 다른 언어 인사말을 펼쳐도 제목은 그대로다
const HEADINGS: Record<Language, string> = {
  ko: '이사장 인사말',
  en: 'Message from the Chairman',
  ja: '理事長あいさつ',
  zh: '理事長致辭',
}

/** 인사말 본문 — 마지막 문단(서명)은 오른쪽 아래로 뗀다 */
function Letter({ lang }: { lang: Language }) {
  const message = chairmanMessages[lang]
  const paragraphs = message.body.split('\n\n')
  const signature = paragraphs.at(-1)
  return (
    <article className='ab-letter' lang={lang}>
      {paragraphs.slice(0, -1).map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
      <p className='ab-letter__sign'>{signature}</p>
      {message.translationNote && <p className='ab-letter__note'>{message.translationNote}</p>}
    </article>
  )
}

export function IntroductionsTabs() {
  const { language, t } = useLanguage()
  // 사이트 언어를 바꾸면 그 언어의 인사말 탭으로 따라간다. 사용자가 탭을 직접 고를 수도 있다.
  // 고른 탭은 그때의 사이트 언어와 함께 적어 두고, 사이트 언어가 바뀌면 버린다 — 같은 그림에서 제목과 탭이 함께 바뀐다
  const [picked, setPicked] = useState<{ site: Language; tab: Language } | null>(null)
  const tab = picked?.site === language ? picked.tab : language
  const setTab = (value: Language) => setPicked({ site: language, tab: value })

  return (
    <>
      <AboutChapter id='message' tc='致辭' eyebrow='Message' title={HEADINGS[language]}>
        <TabsPrimitive.Root
          value={tab}
          onValueChange={value => isValidLanguage(value) && setTab(value)}
        >
          <TabsPrimitive.List className='ab-langs'>
            {SUPPORTED_LANGUAGES.map(lang => (
              <TabsPrimitive.Trigger key={lang} value={lang} lang={lang} className='ab-lang'>
                {chairmanMessages[lang].tabLabel}
              </TabsPrimitive.Trigger>
            ))}
          </TabsPrimitive.List>
          {SUPPORTED_LANGUAGES.map(lang => (
            <TabsPrimitive.Content key={lang} value={lang}>
              <Letter lang={lang} />
            </TabsPrimitive.Content>
          ))}
        </TabsPrimitive.Root>
      </AboutChapter>

      <AboutChapter
        id='brochures'
        tone='navy'
        tc='資料'
        eyebrow='Brochure'
        title={t('introDownloadTitle')}
      >
        <ul className='ab-links'>
          {[
            { href: BROCHURE_KO, label: t('introBrochureKo') },
            { href: BROCHURE_MULTI, label: t('introBrochureMulti') },
          ].map(item => (
            <li key={item.href}>
              <a
                href={item.href}
                target='_blank'
                rel='noopener noreferrer'
                className='ab-link'
                data-reveal
              >
                {item.label}
                <ArrowDownToLine aria-hidden='true' className='ab-link__arrow' />
              </a>
            </li>
          ))}
        </ul>
      </AboutChapter>
    </>
  )
}

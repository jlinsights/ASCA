'use client'

import { useEffect, useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { FileDown } from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'
import { SUPPORTED_LANGUAGES, isValidLanguage } from '@/lib/i18n'
import type { Language } from '@/lib/i18n/types'
import { chairmanMessages } from './chairman-message'

const BROCHURE_KO =
  'https://pub-918cc20d48bd44a29913d2bf8f72a874.r2.dev/소개자료/동양서예협회%20-%20The%20Asian%20Society%20of%20Calligraphic%20Arts%20(ASCA).pdf'
const BROCHURE_MULTI =
  'https://pub-918cc20d48bd44a29913d2bf8f72a874.r2.dev/소개자료/동양서예협회%20소개_한국어%20영어%20중국어%20일본어_PDF.pdf'

// 탭 제목은 그 탭의 언어로 쓴다(사이트 언어와 무관하게 '名誉理事長あいさつ' 탭은 일본어 제목)
const HEADINGS: Record<Language, string> = {
  ko: '명예이사장 소개글',
  en: 'Message from the Honorary Chairman',
  ja: '名誉理事長あいさつ',
  zh: '名譽理事長致辭',
}

export function IntroductionsTabs() {
  const { language, t } = useLanguage()
  // 사이트 언어를 바꾸면 그 언어의 인사말 탭으로 따라간다. 사용자가 탭을 직접 고를 수도 있다.
  const [tab, setTab] = useState<Language>(language)
  useEffect(() => setTab(language), [language])

  return (
    <div className='space-y-10'>
      <Tabs
        value={tab}
        onValueChange={value => isValidLanguage(value) && setTab(value)}
        className='w-full'
      >
        <TabsList className='mb-8'>
          {SUPPORTED_LANGUAGES.map(lang => (
            <TabsTrigger key={lang} value={lang}>
              {chairmanMessages[lang].tabLabel}
            </TabsTrigger>
          ))}
        </TabsList>

        {SUPPORTED_LANGUAGES.map(lang => {
          const message = chairmanMessages[lang]
          return (
            <TabsContent key={lang} value={lang} lang={lang}>
              <article className='prose prose-lg dark:prose-invert max-w-none'>
                <h2 className='text-2xl font-bold mb-6'>{HEADINGS[lang]}</h2>
                {message.body.split('\n\n').map((paragraph, index) => (
                  <p key={index} className='leading-relaxed text-foreground/90'>
                    {paragraph}
                  </p>
                ))}
                {message.translationNote && (
                  <p className='text-sm text-muted-foreground'>{message.translationNote}</p>
                )}
              </article>
            </TabsContent>
          )
        })}
      </Tabs>

      <Card>
        <CardContent className='pt-6'>
          <h3 className='text-lg font-semibold mb-4'>{t('introDownloadTitle')}</h3>
          <div className='flex flex-col sm:flex-row gap-4'>
            <a
              href={BROCHURE_KO}
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center gap-2 rounded-md bg-scholar-red px-4 py-2.5 text-sm font-medium text-white hover:bg-scholar-red/90 transition-colors'
            >
              <FileDown className='h-4 w-4' />
              {t('introBrochureKo')}
            </a>
            <a
              href={BROCHURE_MULTI}
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center gap-2 rounded-md border border-scholar-red px-4 py-2.5 text-sm font-medium text-scholar-red hover:bg-scholar-red/10 transition-colors'
            >
              <FileDown className='h-4 w-4' />
              {t('introBrochureMulti')}
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

'use client'

import Link from 'next/link'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { useLanguage } from '@/contexts/language-context'
import { SITE_FAQ } from '@/lib/content/site-faq'
import { localizeFaqItem } from '@/lib/content/site-faq-locale'
import { faqTranslations } from '@/lib/i18n/translations/faq'

interface SiteFaqListProps {
  /** 주면 이 id 의 항목만, 준 순서대로 보여 준다. 없으면 전체(/contact·/fundraising) */
  ids?: readonly string[]
}

/** 자주 묻는 질문 아코디언 — /contact 와 /fundraising 이 같은 목록을 쓴다. 답 끝에 근거 조문 링크 */
export function SiteFaqList({ ids }: SiteFaqListProps = {}) {
  const { language } = useLanguage()
  const picked = ids ? ids.flatMap(id => SITE_FAQ.filter(item => item.id === id)) : SITE_FAQ
  const items = picked.map(item => localizeFaqItem(item, language))
  // t() 는 공급자 밖에서 키를 그대로 돌려주므로 번역표를 직접 읽는다
  const sourcesLabel = faqTranslations[language]?.faqSources ?? '근거'
  return (
    <Accordion type='single' collapsible className='space-y-3'>
      {items.map((item, i) => (
        <AccordionItem
          key={item.id ?? item.q}
          lang={item.translated ? undefined : 'ko'}
          value={`faq-${i}`}
          className='rounded-lg border bg-card px-4 md:px-6'
        >
          <AccordionTrigger className='text-left text-sm md:text-base font-medium py-4 hover:no-underline'>
            {item.q}
          </AccordionTrigger>
          <AccordionContent className='text-sm text-muted-foreground pb-4 leading-relaxed'>
            <p className='whitespace-pre-line'>{item.a}</p>
            {item.sources && item.sources.length > 0 && (
              <p className='mt-4 flex flex-wrap gap-x-1 gap-y-0.5 text-xs'>
                <span className='mr-1.5 font-semibold text-foreground'>{sourcesLabel}</span>
                {item.sources.map((source, index) => (
                  <span key={source.href}>
                    {index > 0 && <span aria-hidden='true'> · </span>}
                    <Link
                      href={source.href}
                      className='underline decoration-border underline-offset-4 hover:text-foreground hover:decoration-current transition-colors'
                    >
                      {source.label}
                    </Link>
                  </span>
                ))}
              </p>
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

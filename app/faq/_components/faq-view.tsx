'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import * as Accordion from '@radix-ui/react-accordion'
import { useLanguage } from '@/contexts/language-context'
import { EMAIL, OFFICE_HOURS, PHONE } from '@/lib/content/contact-info'
import { faqGroups } from '@/lib/content/site-faq'
import { localizeFaqItem } from '@/lib/content/site-faq-locale'
import { PageHero } from '@/components/layout/page-hero'
import { PAGE_HERO_MARKS } from '@/components/layout/page-hero-marks'
import './faq.css'

const GROUPS = faqGroups()

/** 주소의 #id 가 가리키는 질문 — 그 질문만 펼쳐 둔다 */
function useHashTarget(): string | null {
  const [target, setTarget] = useState<string | null>(null)
  useEffect(() => {
    const read = () => setTarget(decodeURIComponent(window.location.hash.slice(1)) || null)
    read()
    window.addEventListener('hashchange', read)
    return () => window.removeEventListener('hashchange', read)
  }, [])
  return target
}

export function FaqView() {
  const { t, language } = useLanguage()
  const target = useHashTarget()
  const total = GROUPS.reduce((sum, group) => sum + group.items.length, 0)

  useEffect(() => {
    if (target) document.getElementById(target)?.scrollIntoView({ block: 'start' })
  }, [target])

  return (
    <div className='fq'>
      <PageHero {...PAGE_HERO_MARKS.faq} title={t('faqTitle')} lede={t('faqIntro')} />
      <div className='fq__frame'>
        <aside className='fq-side'>
          <section className='fq-contact' aria-labelledby='fq-contact-title'>
            <h2 id='fq-contact-title' className='fq-contact__title'>
              {t('faqContactTitle')}
            </h2>
            <p className='fq-contact__body'>{t('faqContactBody')}</p>
            <a href={`mailto:${EMAIL}`} className='fq-contact__mail'>
              {EMAIL}
            </a>
            <p className='fq-contact__meta'>
              <span>
                {t('faqContactHours')} <a href={PHONE.href}>{PHONE.display}</a> · {OFFICE_HOURS}
              </span>
              <Link href='/contact'>{t('faqContactPage')} →</Link>
            </p>
          </section>
        </aside>

        <div className='fq-groups' aria-label={t('faqCount').replace('{n}', String(total))}>
          {GROUPS.map(group => (
            <section key={group.key} className='fq-group' aria-labelledby={`fq-${group.key}`}>
              <div className='fq-group__head'>
                <h2 id={`fq-${group.key}`} className='fq-group__title'>
                  {t(group.titleKey)}
                </h2>
                <span className='fq-group__count'>
                  {t('faqCount').replace('{n}', String(group.items.length))}
                </span>
              </div>
              <Accordion.Root
                type='multiple'
                key={target ?? 'none'}
                defaultValue={target && group.ids.includes(target) ? [target] : []}
              >
                {group.items
                  .map(source => localizeFaqItem(source, language))
                  .map((item, index) => (
                    <Accordion.Item
                      key={item.id}
                      lang={item.translated ? undefined : 'ko'}
                      value={item.id ?? item.q}
                      id={item.id}
                      className='fq-item'
                    >
                      <Accordion.Header asChild>
                        <h3 className='m-0'>
                          <Accordion.Trigger className='fq-q'>
                            <span className='fq-q__num'>{String(index + 1).padStart(2, '0')}</span>
                            <span className='fq-q__text'>{item.q}</span>
                            <svg
                              className='fq-q__icon'
                              viewBox='0 0 22 22'
                              fill='none'
                              aria-hidden='true'
                            >
                              <circle
                                cx='11'
                                cy='11'
                                r='10.25'
                                stroke='currentColor'
                                strokeWidth='1.2'
                              />
                              <path
                                d='M11 6.5v9M7 11.5l4 4 4-4'
                                stroke='currentColor'
                                strokeWidth='1.2'
                              />
                            </svg>
                          </Accordion.Trigger>
                        </h3>
                      </Accordion.Header>
                      <Accordion.Content className='fq-a'>
                        <div className='fq-a__body'>
                          {item.a}
                          {item.sources && item.sources.length > 0 && (
                            <p className='fq-a__sources'>
                              <span className='fq-a__sources-label'>{t('faqSources')}</span>
                              {item.sources.map((source, i) => (
                                <span key={source.href}>
                                  {i > 0 && <span aria-hidden='true'>· </span>}
                                  <Link href={source.href}>{source.label}</Link>
                                </span>
                              ))}
                            </p>
                          )}
                        </div>
                      </Accordion.Content>
                    </Accordion.Item>
                  ))}
              </Accordion.Root>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}

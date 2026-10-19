'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Check, Link2, List, Printer } from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'
import { REGULATIONS_BASE_PATH, regulationHref } from '@/lib/regulations/catalog'
import type { RegulationDocument } from '@/lib/regulations/types'
import { Blocks } from './regulation-body'
import { RegulationsContact } from './regulations-contact'

export interface RegulationNeighbor {
  slug: string
  nameKey: string
}

interface RegulationReaderProps {
  doc: RegulationDocument
  nameKey: string
  hanja: string
  /** 목록 안 순서 (0부터) */
  position: number
  total: number
  prev: RegulationNeighbor | null
  next: RegulationNeighbor | null
}

function useActiveArticle(ids: string[]): string | null {
  const [active, setActive] = useState<string | null>(ids[0] ?? null)
  const key = ids.join('|')

  useEffect(() => {
    if (ids.length === 0 || typeof IntersectionObserver === 'undefined') return
    // 화면 위쪽 1/3 띠에 걸친 조문을 "지금 읽는 조문"으로 본다
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: '-96px 0px -66% 0px' }
    )
    for (const id of ids) {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    }
    return () => observer.disconnect()
    // ids 는 key 로 비교한다 — 매 렌더 새 배열이어도 다시 구독하지 않게
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return active
}

export function RegulationReader({
  doc,
  nameKey,
  hanja,
  position,
  total,
  prev,
  next,
}: RegulationReaderProps) {
  const { t, language } = useLanguage()
  const [tocOpen, setTocOpen] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const articleIds = doc.sections.flatMap(section => section.articles.map(article => article.id))
  const active = useActiveArticle(articleIds)
  const tableLabel = t('regsTableLabel')
  const hasToc = articleIds.length > 0

  const copyLink = async (id: string) => {
    const url = `${window.location.origin}${window.location.pathname}#${id}`
    try {
      await navigator.clipboard.writeText(url)
      setCopiedId(id)
      window.setTimeout(() => setCopiedId(current => (current === id ? null : current)), 2000)
    } catch {
      // 클립보드 권한이 없으면 주소창 이동으로 대신한다
      window.location.hash = id
    }
  }

  return (
    <div className='asca-regs'>
      <header className='asca-regs-doc-head'>
        <span className='asca-regs-doc-head__hanja tc' aria-hidden='true'>
          {hanja}
        </span>
        <nav aria-label={t('regsMenu')} className='asca-regs-crumbs'>
          <Link href={REGULATIONS_BASE_PATH}>{t('regsMenu')}</Link>
          <span aria-hidden='true'>/</span>
          <span aria-current='page'>{t(nameKey)}</span>
        </nav>
        <div className='asca-regs-doc-head__kicker'>
          <p className='asca-eyebrow'>
            {String(position + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </p>
          <span className='asca-regs-status'>{t('regsStatusActive')}</span>
        </div>
        <h1 className='asca-regs-doc-head__title' lang='ko'>
          {doc.title}
        </h1>
        {doc.titleEn && (
          <p className='asca-regs-doc-head__en' lang='en'>
            {doc.titleEn}
          </p>
        )}
        <dl className='asca-regs-meta'>
          <div>
            <dt>{t('regsEffective')}</dt>
            <dd lang='ko'>{doc.effectiveNote || t('regsNoEffective')}</dd>
          </div>
          <div>
            <dt>{t('regsStatArticles')}</dt>
            <dd>
              {doc.articleCount > 0
                ? `${doc.articleCount}${t('regsArticlesUnit')}`
                : t('regsNoArticles')}
            </dd>
          </div>
        </dl>
        <div className='asca-regs-doc-head__actions'>
          {language !== 'ko' && <p className='asca-regs-lang-note'>{t('regsKoreanOnly')}</p>}
          <button type='button' className='asca-btn asca-btn--ghost' onClick={() => window.print()}>
            <Printer aria-hidden='true' /> {t('regsPrint')}
          </button>
        </div>
      </header>

      <div className={`asca-regs-layout${hasToc ? '' : ' asca-regs-layout--single'}`}>
        {hasToc && (
          <nav className='asca-regs-toc' aria-label={t('regsToc')} data-open={tocOpen}>
            <button
              type='button'
              className='asca-regs-toc__toggle'
              aria-expanded={tocOpen}
              aria-controls='regs-toc-list'
              onClick={() => setTocOpen(open => !open)}
            >
              <List aria-hidden='true' /> {tocOpen ? t('regsToc') : t('regsTocOpen')}
            </button>
            <p className='asca-regs-toc__label'>{t('regsToc')}</p>
            <ol id='regs-toc-list' className='asca-regs-toc__list' lang='ko'>
              {doc.sections.map(section => (
                <li key={section.id}>
                  {section.title && (
                    <a href={`#${section.id}`} className='asca-regs-toc__section'>
                      {section.title}
                    </a>
                  )}
                  {section.articles.length > 0 && (
                    <ol>
                      {section.articles.map(article => (
                        <li key={article.id}>
                          <a
                            href={`#${article.id}`}
                            aria-current={active === article.id ? 'location' : undefined}
                            onClick={() => setTocOpen(false)}
                          >
                            <span className='asca-regs-toc__num'>{article.label}</span>
                            {article.title}
                          </a>
                        </li>
                      ))}
                    </ol>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        <div className='asca-regs-text' lang='ko'>
          {doc.sections.map(section => (
            <section
              key={section.id}
              id={section.id}
              aria-labelledby={section.title ? `${section.id}-title` : undefined}
              className={section.isAddendum ? 'asca-regs-section is-addendum' : 'asca-regs-section'}
            >
              {section.title && (
                <h2 id={`${section.id}-title`} className='asca-regs-section__title'>
                  {section.title}
                </h2>
              )}
              {/* 장 제목이 없는 묶음(08 자격 요건)의 소제목은 h1 바로 아래 단계가 된다 */}
              <Blocks
                blocks={section.blocks}
                tableLabel={tableLabel}
                headingLevel={section.title ? 3 : 2}
              />
              {section.articles.map(article => (
                <article key={article.id} id={article.id} className='asca-regs-article'>
                  <div className='asca-regs-article__head'>
                    {/* 링크 복사 버튼은 제목 밖에 둔다 — 화면 낭독기의 제목 목록이 "제N조 제목"만 읽게 */}
                    <h3>
                      <span className='asca-regs-article__num'>{article.label}</span>
                      {article.title && (
                        <>
                          {' '}
                          <span className='asca-regs-article__title'>{article.title}</span>
                        </>
                      )}
                    </h3>
                    <button
                      type='button'
                      className='asca-regs-article__copy'
                      onClick={() => copyLink(article.id)}
                      aria-label={`${article.label} — ${t('regsCopyLink')}`}
                      lang={language}
                    >
                      {copiedId === article.id ? (
                        <Check aria-hidden='true' />
                      ) : (
                        <Link2 aria-hidden='true' />
                      )}
                    </button>
                  </div>
                  <div className='asca-regs-article__body'>
                    <Blocks blocks={article.blocks} tableLabel={tableLabel} headingLevel={4} />
                  </div>
                </article>
              ))}
            </section>
          ))}
          <p className='sr-only' aria-live='polite' lang={language}>
            {copiedId ? t('regsCopied') : ''}
          </p>
        </div>
      </div>

      <nav className='asca-regs-pager' aria-label={t('regsAll')}>
        {prev ? (
          <Link href={regulationHref(prev.slug)} className='asca-regs-pager__link' rel='prev'>
            <span className='asca-regs-pager__dir'>
              <ArrowLeft aria-hidden='true' /> {t('regsPrev')}
            </span>
            <span className='asca-regs-pager__name'>{t(prev.nameKey)}</span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={regulationHref(next.slug)}
            className='asca-regs-pager__link is-next'
            rel='next'
          >
            <span className='asca-regs-pager__dir'>
              {t('regsNext')} <ArrowRight aria-hidden='true' />
            </span>
            <span className='asca-regs-pager__name'>{t(next.nameKey)}</span>
          </Link>
        ) : (
          <Link href={REGULATIONS_BASE_PATH} className='asca-regs-pager__link is-next'>
            <span className='asca-regs-pager__dir'>
              {t('regsBackToAll')} <ArrowRight aria-hidden='true' />
            </span>
            <span className='asca-regs-pager__name'>{t('regsMenu')}</span>
          </Link>
        )}
      </nav>

      <RegulationsContact />
    </div>
  )
}

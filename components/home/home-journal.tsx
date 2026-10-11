'use client'

import { ArrowUpRight } from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'
import type { HomePost } from './home-data'
import { HomeSectionHead } from './home-section-head'

interface HomeJournalProps {
  posts: HomePost[]
}

export function HomeJournal({ posts }: HomeJournalProps) {
  const { t } = useLanguage()
  if (posts.length === 0) return null

  return (
    <section id='journal' className='asca-section' aria-labelledby='asca-journal-title'>
      <HomeSectionHead
        id='asca-journal-title'
        eyebrow={t('homeJournalEyebrow')}
        tc='學刊'
        title={t('homeJournalTitle')}
        more={{ label: t('homeJournalMore'), href: '/blog' }}
      />
      <ul className='asca-news__list'>
        {posts.map(post => (
          <li key={post.id} className='asca-news__item'>
            <time className='asca-news__date' dateTime={post.isoDate}>
              {post.date}
            </time>
            <div>
              <h3 className='asca-news__title'>
                {/* 글 본문은 협회 블로그에 있다 — /blog 목록과 같은 외부 링크 */}
                <a href={post.href} target='_blank' rel='noopener noreferrer'>
                  {post.title}
                  <span className='sr-only'> ({t('homeNewTab')})</span>
                </a>
              </h3>
            </div>
            <ArrowUpRight className='asca-news__arrow' aria-hidden='true' />
          </li>
        ))}
      </ul>
    </section>
  )
}

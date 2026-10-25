'use client'

import Link from 'next/link'
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
              {/* 블로그 글은 한국어로 쓰였다 — 화면 언어와 별개로 읽기 언어를 밝힌다 */}
              <h3 className='asca-news__title' lang='ko'>
                {/* 글 본문은 이 사이트의 /blog/<slug> 에 있다 — 같은 탭에서 연다 */}
                <Link href={post.href}>{post.title}</Link>
              </h3>
            </div>
            <ArrowUpRight className='asca-news__arrow' aria-hidden='true' />
          </li>
        ))}
      </ul>
    </section>
  )
}

'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/language-context'
import { excerpt, type ThreadView } from '@/lib/community/threads'
import { AuthorLine, PlusMark, useThreadDate } from './thread-parts'
import './board.css'

export const COMPOSE_PATH = '/community/board/new'
export const SIGN_IN_TO_COMPOSE = `/sign-in?next=${encodeURIComponent(COMPOSE_PATH)}`

interface BoardViewProps {
  threads: ThreadView[]
  total: number
  signedIn: boolean
}

/** 게시판 목록 — 왼쪽 행동 단, 오른쪽 쪽지 격자. 첫 칸은 점선 "새 글" 자리 */
export function BoardView({ threads, total, signedIn }: BoardViewProps) {
  const { t } = useLanguage()
  const composeHref = signedIn ? COMPOSE_PATH : SIGN_IN_TO_COMPOSE
  const composeLabel = t(signedIn ? 'boardWrite' : 'boardSignInToWrite')

  return (
    <div className='cb'>
      <div className='cb__frame'>
        <header className='cb-head'>
          <p className='cb-head__eyebrow'>{t('boardEyebrow')}</p>
          <div className='cb-head__row'>
            <h1 className='cb-head__title'>{t('boardTitle')}</h1>
            <p className='cb-head__count'>{t('boardCount').replace('{n}', String(total))}</p>
          </div>
          <p className='cb-head__intro'>{t('boardIntro')}</p>
        </header>

        <div className='cb-layout'>
          <aside className='cb-aside' aria-label={t('boardWrite')}>
            <Link href={composeHref} className='cb-write'>
              <span>{composeLabel}</span>
              <PlusMark />
            </Link>
            <p className='cb-aside__note'>{t('boardPublicNote')}</p>
          </aside>

          <section aria-labelledby='cb-list-title'>
            <h2 id='cb-list-title' className='sr-only'>
              {t('boardTitle')}
            </h2>
            <ul className='cb-grid'>
              <li>
                <Link href={composeHref} className='cb-compose'>
                  <PlusMark size={24} />
                  <span>{composeLabel}</span>
                  {threads.length === 0 && (
                    <span className='cb-compose__hint'>{t('boardEmpty')}</span>
                  )}
                </Link>
              </li>
              {threads.map(thread => (
                <li key={thread.id}>
                  <ThreadCard thread={thread} />
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}

function ThreadCard({ thread }: { thread: ThreadView }) {
  const { t } = useLanguage()
  const formatDate = useThreadDate()
  const preview = excerpt(thread.body)
  return (
    <article className='cb-card' aria-labelledby={`cb-thread-${thread.id}`}>
      <AuthorLine author={thread.author} />
      <div className='cb-notch' aria-hidden='true' />
      <h3 id={`cb-thread-${thread.id}`} className='cb-card__title'>
        <Link href={`/community/board/${thread.id}`} className='cb-card__link'>
          {thread.title}
        </Link>
      </h3>
      <p className='cb-card__excerpt'>{preview.text}</p>
      <p className='cb-card__foot'>
        <time dateTime={thread.created_at}>{formatDate(thread.created_at)}</time>
        {preview.truncated && (
          <span className='cb-card__more' aria-hidden='true'>
            {t('boardReadMore')} →
          </span>
        )}
      </p>
    </article>
  )
}

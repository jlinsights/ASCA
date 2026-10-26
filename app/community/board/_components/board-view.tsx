'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/language-context'
import { excerpt, type ThreadView } from '@/lib/community/threads'
import { SEARCH_MAX } from '@/lib/community/search'
import { AuthorLine, PlusMark, useThreadDate } from './thread-parts'
import './board.css'

export const COMPOSE_PATH = '/community/board/new'
export const SIGN_IN_TO_COMPOSE = `/sign-in?next=${encodeURIComponent(COMPOSE_PATH)}`
export const MINE_PATH = '/community/board?view=mine'

/** 내 글 목록에서만 붙는 숨김 표시 */
type BoardThread = ThreadView & { hidden?: boolean }
export type BoardTab = 'all' | 'mine'

interface BoardViewProps {
  threads: BoardThread[]
  total: number
  signedIn: boolean
  view?: BoardTab
  /** 다듬어진 검색어 — 있으면 결과 줄과 지우기 링크를 보인다 */
  search?: string | null
}

/** 게시판 목록 — 왼쪽 행동 단, 오른쪽 쪽지 격자. 첫 칸은 점선 "새 글" 자리 */
export function BoardView({
  threads,
  total,
  signedIn,
  view = 'all',
  search = null,
}: BoardViewProps) {
  const { t } = useLanguage()
  const composeHref = signedIn ? COMPOSE_PATH : SIGN_IN_TO_COMPOSE
  const composeLabel = t(signedIn ? 'boardWrite' : 'boardSignInToWrite')
  const mine = view === 'mine'
  const countKey = mine ? 'boardMyCount' : 'boardCount'

  return (
    <div className='cb'>
      <div className='cb__frame'>
        <header className='cb-head'>
          <p className='cb-head__eyebrow'>{t('boardEyebrow')}</p>
          <div className='cb-head__row'>
            <h1 className='cb-head__title'>{t('boardTitle')}</h1>
            <p className='cb-head__count'>{t(countKey).replace('{n}', String(total))}</p>
          </div>
          <p className='cb-head__intro'>{t('boardIntro')}</p>
        </header>

        <div className='cb-layout'>
          <aside className='cb-aside' aria-label={t('boardWrite')}>
            <Link href={composeHref} className='cb-write'>
              <span>{composeLabel}</span>
              <PlusMark />
            </Link>
            {signedIn && <BoardTabs view={view} />}
            <BoardSearch view={view} search={search} />
            <p className='cb-aside__note'>{t('boardPublicNote')}</p>
          </aside>

          <section aria-labelledby='cb-list-title'>
            <h2 id='cb-list-title' className='sr-only'>
              {t(mine ? 'boardTabMine' : 'boardTitle')}
            </h2>
            {search && (
              <p className='cb-results' role='status'>
                <span>
                  {t('boardSearchResults').replace('{q}', search).replace('{n}', String(total))}
                </span>
                <Link href={mine ? MINE_PATH : '/community/board'} className='cb-results__clear'>
                  {t('boardSearchClear')}
                </Link>
              </p>
            )}
            <ul className='cb-grid'>
              <li>
                <Link href={composeHref} className='cb-compose'>
                  <PlusMark size={24} />
                  <span>{composeLabel}</span>
                  {threads.length === 0 && (
                    <span className='cb-compose__hint'>
                      {t(search ? 'boardSearchEmpty' : mine ? 'boardMyEmpty' : 'boardEmpty')}
                    </span>
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

/** 전체 글 · 내 글 — 주소(?view=mine)로 남겨 새로 고쳐도, 링크로 보내도 같은 탭 */
function BoardTabs({ view }: { view: BoardTab }) {
  const { t } = useLanguage()
  const tabs: { key: BoardTab; href: string; label: string }[] = [
    { key: 'all', href: '/community/board', label: t('boardTabAll') },
    { key: 'mine', href: MINE_PATH, label: t('boardTabMine') },
  ]
  return (
    <nav className='cb-tabs' aria-label={t('boardTabsLabel')}>
      {tabs.map(tab => (
        <Link
          key={tab.key}
          href={tab.href}
          className='cb-tabs__link'
          aria-current={tab.key === view ? 'page' : undefined}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  )
}

/** 검색 — 평범한 GET 양식이라 스크립트 없이도 되고, 검색어가 주소(?q=)에 남는다 */
function BoardSearch({ view, search }: { view: BoardTab; search: string | null }) {
  const { t } = useLanguage()
  return (
    <form action='/community/board' method='get' role='search' className='cb-search'>
      {view === 'mine' && <input type='hidden' name='view' value='mine' />}
      <label htmlFor='cb-search' className='sr-only'>
        {t('boardSearchLabel')}
      </label>
      <input
        id='cb-search'
        type='search'
        name='q'
        defaultValue={search ?? ''}
        maxLength={SEARCH_MAX}
        placeholder={t('boardSearchPlaceholder')}
        className='cb-search__input'
      />
      <button type='submit' className='cb-search__button'>
        {t('boardSearchSubmit')}
      </button>
    </form>
  )
}

function ThreadCard({ thread }: { thread: BoardThread }) {
  const { t } = useLanguage()
  const formatDate = useThreadDate()
  const preview = excerpt(thread.body)
  return (
    <article
      className={`cb-card${thread.hidden ? ' cb-card--hidden' : ''}`}
      aria-labelledby={`cb-thread-${thread.id}`}
    >
      <AuthorLine author={thread.author} />
      <div className='cb-notch' aria-hidden='true' />
      {thread.hidden && <p className='cb-card__badge'>{t('boardMyHidden')}</p>}
      <h3 id={`cb-thread-${thread.id}`} className='cb-card__title'>
        {/* 숨김 글은 상세가 404 라 링크를 걸지 않는다 */}
        {thread.hidden ? (
          thread.title
        ) : (
          <Link href={`/community/board/${thread.id}`} className='cb-card__link'>
            {thread.title}
          </Link>
        )}
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

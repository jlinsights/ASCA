import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { getAccount } from '@/lib/auth/server'
import { listMyThreads, listThreads } from '@/lib/community/feed'
import { decodeCursor, pageHref } from '@/lib/community/paging'
import { normalizeSearch } from '@/lib/community/search'
import { BoardView } from './_components/board-view'

/**
 * /community/board — 회원 게시판. 누구나 읽고, 로그인한 회원이 글을 쓴다.
 * 숨김·삭제 글은 listThreads 가 거른다.
 */

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '회원 게시판 | 동양서예협회',
  description: '협회 회원들이 작업과 전시 소식을 나누고 함께할 작가를 찾는 게시판입니다.',
}

type Props = {
  searchParams: Promise<{
    view?: string | string[]
    q?: string | string[]
    before?: string | string[]
  }>
}

/**
 * ?view=mine — 내 글만. 로그인하지 않았으면 로그인 뒤 이 탭으로 돌아온다.
 * ?before= — 이전 쪽 마지막 글 표지. 모양이 틀리면 첫 쪽을 보인다.
 */
export default async function CommunityBoardPage({ searchParams }: Props) {
  const params = await searchParams
  const mine = params.view === 'mine'
  const search = normalizeSearch(params.q)
  const before = decodeCursor(params.before)
  const view = mine ? 'mine' : 'all'
  const account = await getAccount().catch(() => null)
  if (mine && !account)
    redirect(`/sign-in?next=${encodeURIComponent('/community/board?view=mine')}`)
  const feed =
    mine && account
      ? await listMyThreads(account.id, { search, before })
      : await listThreads({ search, before })
  return (
    <>
      <main>
        <BoardView
          threads={feed.threads}
          total={feed.total}
          signedIn={Boolean(account)}
          view={view}
          search={search}
          olderHref={feed.nextCursor ? pageHref({ view, search, before: feed.nextCursor }) : null}
          newestHref={before ? pageHref({ view, search }) : null}
        />
      </main>
      <LayoutFooter />
    </>
  )
}

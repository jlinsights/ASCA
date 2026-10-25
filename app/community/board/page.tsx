import type { Metadata } from 'next'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { getAccount } from '@/lib/auth/server'
import { listThreads } from '@/lib/community/feed'
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

export default async function CommunityBoardPage() {
  const [feed, account] = await Promise.all([listThreads(), getAccount().catch(() => null)])
  return (
    <>
      <main>
        <BoardView threads={feed.threads} total={feed.total} signedIn={Boolean(account)} />
      </main>
      <LayoutFooter />
    </>
  )
}

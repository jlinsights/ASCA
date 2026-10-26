import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { getAccount } from '@/lib/auth/server'
import { archiveIdentity } from '@/lib/archive/writer'
import { getReactions, getThread, listComments } from '@/lib/community/feed'
import { excerpt } from '@/lib/community/threads'
import { ThreadDetail } from './thread-detail'

export const dynamic = 'force-dynamic'
type Props = { params: Promise<{ id: string }> }

/**
 * 숨김 글은 관리자(aal2)에게만 보이고, 다른 사람에게는 없는 글(404)이다.
 * 메타데이터와 본문이 같은 요청에서 한 번만 읽도록 cache 로 묶는다.
 */
const load = cache(async (id: string) => {
  const identity = await archiveIdentity().catch(() => null)
  const admin = Boolean(identity?.admin)
  const found = await getThread(id, { includeHidden: admin })
  return found ? { ...found, admin } : null
})

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const found = await load((await params).id)
  if (!found) return { title: '게시판 | 동양서예협회' }
  return {
    title: `${found.thread.title} | 회원 게시판`,
    description: excerpt(found.thread.body, 140).text,
    robots: found.moderation.hiddenAt ? { index: false, follow: false } : undefined,
  }
}

export default async function CommunityThreadPage({ params }: Props) {
  const found = await load((await params).id)
  if (!found) notFound()
  const account = await getAccount().catch(() => null)
  const viewerId = account?.id ?? null
  const [comments, reactions] = await Promise.all([
    listComments(found.thread.id, viewerId),
    getReactions(found.thread.id, viewerId),
  ])
  return (
    <>
      <main>
        <ThreadDetail
          thread={found.thread}
          moderation={found.admin ? found.moderation : null}
          comments={comments}
          reactions={reactions}
          viewer={{
            signedIn: Boolean(account),
            hasDisplayName: Boolean(account?.displayName.trim()),
          }}
        />
      </main>
      <LayoutFooter />
    </>
  )
}

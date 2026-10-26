import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { getAccount } from '@/lib/auth/server'
import { getThread } from '@/lib/community/feed'
import { ComposeForm } from '../../new/compose-form'

export const dynamic = 'force-dynamic'
type Props = { params: Promise<{ id: string }> }

export const metadata: Metadata = {
  title: '글 고치기 | 회원 게시판',
  robots: { index: false, follow: false },
}

/** 내 글 고치기 — 작성자 본인의, 숨김·삭제되지 않은 글만. 아니면 없는 글(404) */
export default async function EditThreadPage({ params }: Props) {
  const { id } = await params
  const account = await getAccount().catch(() => null)
  if (!account) redirect(`/sign-in?next=${encodeURIComponent(`/community/board/${id}/edit`)}`)
  const found = await getThread(id, { viewerId: account.id })
  if (!found?.thread.mine) notFound()
  const { thread } = found
  return (
    <>
      <main>
        <ComposeForm
          hasDisplayName
          editing={{ id: thread.id, title: thread.title, body: thread.body }}
        />
      </main>
      <LayoutFooter />
    </>
  )
}

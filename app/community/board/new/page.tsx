import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { getAccount } from '@/lib/auth/server'
import { ComposeForm } from './compose-form'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '새 글 쓰기 | 회원 게시판',
  robots: { index: false, follow: false },
}

export default async function NewThreadPage() {
  const account = await getAccount().catch(() => null)
  if (!account) redirect(`/sign-in?next=${encodeURIComponent('/community/board/new')}`)
  return (
    <>
      <div>
        <ComposeForm hasDisplayName={Boolean(account.displayName.trim())} />
      </div>
      <LayoutFooter />
    </>
  )
}

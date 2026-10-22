import { archiveIdentity } from '@/lib/archive/writer'
import { ownedWorks } from '@/lib/archive/owned'
import { pageNumber } from '@/lib/archive/queries'
import { MyWorks } from '@/components/archive/my-works'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'
export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const identity = await archiveIdentity()
  if (!identity) redirect('/sign-in?redirect_url=%2Farchive%2Fmy')
  const page = pageNumber((await searchParams).page)
  const { data, count, error } = await ownedWorks(identity.userId)
    .order('updated_at', { ascending: false })
    .order('id')
    .range((page - 1) * 24, page * 24 - 1)
  if (error) throw error
  const works = (data || []).map(work => ({
    id: work.id,
    title: work.title,
    status: work.status,
    artists: { name: work.artists.name },
    feedback:
      work.status === 'draft' &&
      work.archive_reviews[0]?.action === 'return' &&
      work.archive_reviews[0]?.state === 'completed'
        ? work.archive_reviews[0].reason
        : null,
  }))
  return <MyWorks works={works} page={page} total={count || 0} />
}

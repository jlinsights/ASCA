import { redirect, notFound } from 'next/navigation'
import { archiveIdentity } from '@/lib/archive/writer'
import { reviewList } from '@/lib/archive/review-queries'
import { pageNumber } from '@/lib/archive/queries'
import { ReviewList } from '@/components/archive/review-list'

export const dynamic = 'force-dynamic'
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>
}) {
  const identity = await archiveIdentity()
  if (!identity) redirect('/sign-in?redirect_url=%2Fadmin%2Farchive%2Freviews')
  if (!identity.admin) notFound()
  const params = await searchParams
  const page = pageNumber(params.page)
  const status = params.status === 'published' ? 'published' : 'pending_review'
  const result = await reviewList(page, status)
  return <ReviewList {...result} page={page} status={status} />
}

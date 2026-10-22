import { redirect, notFound } from 'next/navigation'
import { z } from 'zod'
import { archiveIdentity } from '@/lib/archive/writer'
import { reviewDetail } from '@/lib/archive/review-queries'
import { ReviewDetail } from '@/components/archive/review-detail'

export const dynamic = 'force-dynamic'
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const identity = await archiveIdentity()
  if (!identity) redirect('/sign-in?redirect_url=%2Fadmin%2Farchive%2Freviews')
  if (!identity.admin) notFound()
  const { id } = await params
  if (!z.string().uuid().safeParse(id).success) notFound()
  const result = await reviewDetail(id)
  if (!result) notFound()
  return <ReviewDetail {...result} />
}

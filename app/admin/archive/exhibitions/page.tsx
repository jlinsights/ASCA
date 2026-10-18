import { notFound, redirect } from 'next/navigation'
import { archiveIdentity } from '@/lib/archive/writer'
import { archiveExhibitions } from '@/lib/archive/exhibitions'
import { pageNumber } from '@/lib/archive/queries'
import { ExhibitionIndex } from '@/components/archive/exhibition-index'
export const dynamic = 'force-dynamic'
export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const identity = await archiveIdentity()
  if (!identity) redirect('/sign-in?redirect_url=%2Fadmin%2Farchive%2Fexhibitions')
  if (!identity.admin) notFound()
  const page = pageNumber((await searchParams).page)
  return <ExhibitionIndex {...await archiveExhibitions(page, true)} page={page} admin />
}

import { notFound, redirect } from 'next/navigation'
import { z } from 'zod'
import { archiveIdentity } from '@/lib/archive/writer'
import { exhibitionPicker } from '@/lib/archive/exhibitions'
import { pageNumber, safeSearch } from '@/lib/archive/queries'
import { ExhibitionPicker } from '@/components/archive/exhibition-picker'
export const dynamic = 'force-dynamic'
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ page?: string; q?: string; mode?: string }>
}) {
  const identity = await archiveIdentity()
  if (!identity) redirect('/sign-in?redirect_url=%2Fadmin%2Farchive%2Fexhibitions')
  if (!identity.admin) notFound()
  const { id } = await params
  if (!z.string().uuid().safeParse(id).success) notFound()
  const search = await searchParams
  const page = pageNumber(search.page),
    q = safeSearch(search.q || ''),
    linked = search.mode !== 'available'
  const result = await exhibitionPicker(id, page, q, linked)
  if (!result) notFound()
  return <ExhibitionPicker {...result} page={page} q={q} linked={linked} />
}

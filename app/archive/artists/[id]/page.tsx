import { notFound } from 'next/navigation'
import { z } from 'zod'
import { artistDetail, artistWorks, recordsFor, pageNumber } from '@/lib/archive/queries'
import { ArtistProfile } from '@/components/archive/artist-profile'
export const dynamic = 'force-dynamic'
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string; page?: string }>
}) {
  const { id } = await params
  if (!z.string().uuid().safeParse(id).success) notFound()
  const artist = await artistDetail(id)
  if (!artist) notFound()
  const search = await searchParams
  const page = pageNumber(search.page)
  const tab = search.tab === 'records' ? 'records' : 'works'
  const workData = tab === 'works' ? await artistWorks(id, page) : { works: [], total: 0 }
  const recordData = tab === 'records' ? await recordsFor(id, page) : { records: [], total: 0 }
  return (
    <ArtistProfile
      artist={artist}
      {...workData}
      {...recordData}
      workTotal={workData.total}
      recordTotal={recordData.total}
      page={page}
      tab={tab}
    />
  )
}

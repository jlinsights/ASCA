import { notFound } from 'next/navigation'
import { z } from 'zod'
import { artistDetail, workDetail, recordsFor, pageNumber } from '@/lib/archive/queries'
import { ArtworkDetail } from '@/components/archive/artwork-detail'
export const dynamic = 'force-dynamic'
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const { id } = await params
  if (!z.string().uuid().safeParse(id).success) notFound()
  const work = await workDetail(id)
  if (!work) notFound()
  const artist = await artistDetail(work.artist_id)
  if (!artist) notFound()
  const page = pageNumber((await searchParams).page)
  const { records, total } = await recordsFor(artist.id, page, work.id)
  return (
    <ArtworkDetail work={work} artist={artist} records={records} recordTotal={total} page={page} />
  )
}

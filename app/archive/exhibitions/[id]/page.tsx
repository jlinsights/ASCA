import { notFound } from 'next/navigation'
import { z } from 'zod'
import { exhibitionArchive } from '@/lib/archive/exhibitions'
import { pageNumber } from '@/lib/archive/queries'
import { ExhibitionWorks } from '@/components/archive/exhibition-works'
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
  const page = pageNumber((await searchParams).page)
  const result = await exhibitionArchive(id, page)
  if (!result) notFound()
  return <ExhibitionWorks {...result} page={page} />
}

import { archiveExhibitions } from '@/lib/archive/exhibitions'
import { pageNumber } from '@/lib/archive/queries'
import { ExhibitionIndex } from '@/components/archive/exhibition-index'
export const dynamic = 'force-dynamic'
export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const page = pageNumber((await searchParams).page)
  return <ExhibitionIndex {...await archiveExhibitions(page)} page={page} />
}

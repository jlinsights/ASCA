import { listArtists } from '@/lib/archive/queries'
import { ArtistList } from '@/components/archive/artist-list'
export const dynamic = 'force-dynamic'
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const raw = await searchParams
  const get = (key: string) => (typeof raw[key] === 'string' ? (raw[key] as string) : undefined)
  const filters = { q: get('q'), style: get('style'), grade: get('grade') }
  const result = await listArtists({ ...filters, page: get('page') })
  return <ArtistList {...result} filters={filters} />
}

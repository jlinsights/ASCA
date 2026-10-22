import { notFound } from 'next/navigation'
import { z } from 'zod'
import { publicCv } from '@/lib/archive/cv-queries'
import { ArtistCv } from '@/components/archive/artist-cv'
import './print.css'

export const dynamic = 'force-dynamic'
export const metadata = { title: '작가 공개 이력 · CV | ASCA' }
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!z.string().uuid().safeParse(id).success) notFound()
  const cv = await publicCv(id)
  if (!cv) notFound()
  return <ArtistCv {...cv} />
}

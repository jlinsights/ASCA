import { notFound, redirect } from 'next/navigation'
import { z } from 'zod'
import { archiveIdentity } from '@/lib/archive/writer'
import { ownedWorks } from '@/lib/archive/owned'
import { SubmissionForm } from '@/components/archive/submission-form'

export const dynamic = 'force-dynamic'
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!z.string().uuid().safeParse(id).success) notFound()
  const identity = await archiveIdentity()
  if (!identity) redirect(`/sign-in?redirect_url=${encodeURIComponent(`/archive/my/${id}`)}`)
  const { data: work, error } = await ownedWorks(identity.userId).eq('id', id).maybeSingle()
  if (error) throw error
  if (!work) notFound()
  if (work.status !== 'draft') redirect('/archive/my')
  return (
    <SubmissionForm
      access='ready'
      artists={[{ id: work.artist_id!, name: work.artists.name }]}
      draft={{
        id: work.id,
        updatedAt: work.updated_at,
        values: {
          artistId: work.artist_id!,
          title: work.title,
          titleHanja: work.title_hanja || '',
          titleEn: work.title_en || '',
          style: work.style || '',
          width: work.width_cm || 0,
          height: work.height_cm || 0,
          year: work.year_created || 0,
          materials: (work.materials || []).join(', '),
          transcription: work.transcription || '',
          interpretation: work.interpretation || '',
          interpretationEn: work.interpretation_en || '',
          source: work.source_text || '',
          seal: work.seal_description || '',
          recordTitle: '',
          organizer: '',
          contestRef: '',
          status: 'draft',
        },
      }}
    />
  )
}

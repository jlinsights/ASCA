'use client'

import { useParams } from 'next/navigation'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { useExhibitionDetail } from '@/lib/hooks/use-exhibition-detail'
import { ExhibitionDetailBody } from './_components/exhibition-detail-body'
import { ExhibitionLoading } from './_components/exhibition-loading'
import { ExhibitionError } from './_components/exhibition-error'

export default function ExhibitionDetailPage() {
  const params = useParams()
  const exhibitionId = params.id as string
  const { exhibition, loading, error, isOwner, handleDelete } = useExhibitionDetail(exhibitionId)

  if (loading) {
    return (
      <>
        <ExhibitionLoading />
        <LayoutFooter />
      </>
    )
  }

  if (error || !exhibition) {
    return (
      <>
        <ExhibitionError
          message={error ?? '전시 정보를 찾을 수 없습니다.'}
          kind={error?.toLowerCase().includes('not found') ? 'not-found' : 'network'}
        />
        <LayoutFooter />
      </>
    )
  }

  return (
    <div className='min-h-screen bg-transparent'>
      <main className='container mx-auto px-4 py-8'>
        <ExhibitionDetailBody exhibition={exhibition} isOwner={isOwner} onDelete={handleDelete} />
      </main>
      <LayoutFooter />
    </div>
  )
}

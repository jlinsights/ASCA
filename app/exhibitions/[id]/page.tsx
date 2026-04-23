'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, AlertCircle, Loader2, Edit, Trash2 } from 'lucide-react'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { Button } from '@/components/ui/button'
import { useUser } from '@clerk/nextjs'
import { fetchExhibitionById, deleteExhibition } from '@/lib/api/exhibitions'
import type { ExhibitionWithDetails } from '@/types/exhibition'
import { ExhibitionDetailBody } from './_components/exhibition-detail-body'

export default function ExhibitionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const exhibitionId = params.id as string
  const { isLoaded, isSignedIn, user: clerkUser } = useUser()

  const [exhibition, setExhibition] = useState<ExhibitionWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOwner, setIsOwner] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoaded) return
    if (isSignedIn && clerkUser) {
      setCurrentUserId(clerkUser.id)
    } else {
      setCurrentUserId(null)
    }
  }, [isLoaded, isSignedIn, clerkUser])

  // Load exhibition data
  useEffect(() => {
    const loadExhibition = async () => {
      try {
        setLoading(true)
        setError(null)

        // Check for static exhibition ID 3 (Suh-Kyung)
        if (exhibitionId === '3') {
          const staticExhibition: ExhibitionWithDetails = {
            id: '3',
            title: '서경(書境) 새로운 지평 - 동양서예의 현재와 미래',
            subtitle: 'New Horizons in East Asian Calligraphy',
            description:
              '사단법인 동양서예협회가 주최하는 2026년 특별 기획전입니다. 개인전뿐만 아니라 소규모 서예단체들의 부스전, 연합전, 그리고 작품 1점만 출품하는 것도 가능한 열린 전시입니다. 실력있는 작가들을 발굴하고 품격있는 전시공간에서 새로운 서예의 지평을 엽니다. 서경(書境) 1부와 2부로 나누어 진행되며, 동양서예의 현재와 미래를 조망할 수 있는 귀중한 자리가 될 것입니다.',
            content: '',
            startDate: '2026-04-15',
            endDate: '2026-04-28',
            location: '예술의전당',
            venue: '서울서예박물관 제1전시실 (2층)',
            curator: '(사)동양서예협회 운영위원회',
            featuredImageUrl: '/images/exhibitions/poster-main.png',
            galleryImages: [],
            status: 'upcoming',
            isFeatured: true,
            isPublished: true,
            views: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ticketPrice: 0,
            artworks: [],
            artists: [],
          }
          setExhibition(staticExhibition)
          setLoading(false)
          return
        }

        // Fetch exhibition with details
        const { data: exhibitionData, error: fetchError } = await fetchExhibitionById(exhibitionId)

        if (fetchError || !exhibitionData) {
          throw new Error('전시를 찾을 수 없습니다.')
        }

        setExhibition(exhibitionData)

        // Check ownership
        if (currentUserId && exhibitionData.artists) {
          const isOrganizer = exhibitionData.artists.some(
            artist =>
              artist.artistId === currentUserId &&
              (artist.role === 'organizer' || artist.role === 'curator')
          )
          setIsOwner(isOrganizer)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '전시를 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    if (exhibitionId) {
      loadExhibition()
    }
  }, [exhibitionId, currentUserId])

  // Delete handler
  const handleDelete = async () => {
    if (!confirm('정말 이 전시를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return
    }

    const { error: deleteError } = await deleteExhibition(exhibitionId)
    if (deleteError) {
      alert('전시 삭제 중 오류가 발생했습니다.')
      return
    }

    alert('전시가 삭제되었습니다.')
    router.push('/profile/exhibitions')
  }

  if (loading) {
    return (
      <div className='min-h-screen bg-transparent'>
        <main className='container mx-auto px-4 py-8'>
          <div className='flex items-center justify-center py-12'>
            <div className='flex items-center gap-3'>
              <Loader2 className='h-6 w-6 animate-spin' />
              <span className='text-lg'>전시를 불러오는 중...</span>
            </div>
          </div>
        </main>
        <LayoutFooter />
      </div>
    )
  }

  if (error || !exhibition) {
    return (
      <div className='min-h-screen bg-transparent'>
        <main className='container mx-auto px-4 py-8'>
          <div className='text-center py-12'>
            <AlertCircle className='h-16 w-16 text-red-600 mx-auto mb-4' />
            <h3 className='text-lg font-semibold text-foreground mb-2'>오류가 발생했습니다</h3>
            <p className='text-muted-foreground mb-4'>{error}</p>
            <Link href='/exhibitions'>
              <Button variant='outline'>목록으로 돌아가기</Button>
            </Link>
          </div>
        </main>
        <LayoutFooter />
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-transparent'>
      <main className='container mx-auto px-4 py-8'>
        {/* Navigation */}
        <div className='flex items-center justify-between mb-8'>
          <div className='flex items-center gap-4'>
            <Link href='/exhibitions'>
              <Button variant='outline' size='sm'>
                <ArrowLeft className='h-4 w-4 mr-2' />
                목록으로
              </Button>
            </Link>
            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
              <Link href='/' className='hover:text-foreground'>
                홈
              </Link>
              <span>/</span>
              <Link href='/exhibitions' className='hover:text-foreground'>
                전시
              </Link>
              <span>/</span>
              <span className='text-foreground'>{exhibition.title}</span>
            </div>
          </div>

          {/* Owner Actions */}
          {isOwner && (
            <div className='flex gap-2'>
              <Link href={`/exhibitions/${exhibitionId}/edit`}>
                <Button variant='outline' size='sm'>
                  <Edit className='w-4 h-4 mr-2' />
                  수정
                </Button>
              </Link>
              <Button
                variant='outline'
                size='sm'
                onClick={handleDelete}
                className='text-scholar-red hover:text-scholar-red hover:border-scholar-red'
              >
                <Trash2 className='w-4 h-4 mr-2' />
                삭제
              </Button>
            </div>
          )}
        </div>

        <ExhibitionDetailBody exhibition={exhibition} />
      </main>

      <LayoutFooter />
    </div>
  )
}

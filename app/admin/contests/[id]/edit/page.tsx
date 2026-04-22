'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ContestForm } from '@/components/admin/contest-form'
import { useUser } from '@clerk/nextjs'
import { fetchContestById } from '@/lib/api/contests'
import { getSupabaseClient } from '@/lib/supabase'
import type { Contest } from '@/types/contest-new'

export default function AdminContestEditPage() {
  const { isLoaded, isSignedIn, user: clerkUser } = useUser()
  const params = useParams()
  const router = useRouter()
  const contestId = params.id as string

  const [contest, setContest] = useState<Contest | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoaded) return

    const loadContest = async () => {
      try {
        if (!isSignedIn || !clerkUser) {
          router.push('/sign-in')
          return
        }

        const supabase = getSupabaseClient()
        if (!supabase) {
          router.push('/sign-in')
          return
        }

        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('clerk_user_id', clerkUser.id)
          .single()

        if (!profile || !['admin', 'moderator'].includes(profile.role)) {
          router.push('/')
          return
        }

        // Load contest
        const { data: contestData, error: fetchError } = await fetchContestById(contestId)
        if (fetchError || !contestData) {
          throw new Error('공모전을 불러올 수 없습니다')
        }

        setContest(contestData as unknown as Contest)
      } catch (err) {
        setError(err instanceof Error ? err.message : '오류가 발생했습니다')
      } finally {
        setLoading(false)
      }
    }

    loadContest()
  }, [contestId, router, isLoaded, isSignedIn, clerkUser])

  if (loading) {
    return (
      <div className='min-h-screen bg-background'>
        <main className='container mx-auto px-4 py-8'>
          <div className='flex items-center justify-center py-12'>
            <div className='animate-spin rounded-full h-12 w-12 border-2 border-celadon-green border-t-transparent'></div>
          </div>
        </main>
      </div>
    )
  }

  if (error || !contest) {
    return (
      <div className='min-h-screen bg-background'>
        <main className='container mx-auto px-4 py-8 max-w-4xl'>
          <div className='text-center py-12'>
            <p className='text-scholar-red mb-4'>{error || '공모전을 찾을 수 없습니다'}</p>
            <Link href='/admin/contests'>
              <Button>공모전 목록으로</Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-background'>
      <main className='container mx-auto px-4 py-8 max-w-4xl'>
        <div className='mb-8'>
          <Link href='/admin/contests'>
            <Button variant='ghost' className='mb-4'>
              <ArrowLeft className='w-4 h-4 mr-2' />
              공모전 목록
            </Button>
          </Link>
          <h1 className='text-3xl font-serif font-bold text-foreground'>공모전 수정</h1>
          <p className='text-muted-foreground mt-2'>{contest.title}</p>
        </div>

        <ContestForm contest={contest} />
      </main>
    </div>
  )
}

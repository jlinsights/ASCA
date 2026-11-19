'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ContestForm } from '@/components/admin/contest-form'
import { useAccount } from '@/components/auth/session-provider'
import { fetchContestById } from '@/lib/api/contests'
import type { Contest } from '@/lib/types/contest-new-legacy'

export default function AdminContestEditPage() {
  const { isLoaded, isSignedIn, user: account } = useAccount()
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
        if (!isSignedIn || !account) {
          router.push('/sign-in')
          return
        }

        if (account.role !== 'admin' || account.assuranceLevel !== 'aal2') {
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
  }, [contestId, router, isLoaded, isSignedIn, account])

  if (loading) {
    return (
      <div className='min-h-screen bg-background'>
        <div className='container py-8'>
          <div className='flex items-center justify-center py-12'>
            <div className='animate-spin rounded-full h-12 w-12 border-2 border-celadon-green border-t-transparent'></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !contest) {
    return (
      <div className='min-h-screen bg-background'>
        <div className='container py-8 [--shell-max:56rem]'>
          <div className='text-center py-12'>
            <p className='text-scholar-red mb-4'>{error || '공모전을 찾을 수 없습니다'}</p>
            <Link href='/admin/contests'>
              <Button>공모전 목록으로</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-background'>
      <div className='container py-8 [--shell-max:56rem]'>
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
      </div>
    </div>
  )
}

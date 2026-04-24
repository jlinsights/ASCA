'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

interface AdminProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const { isLoaded, isSignedIn } = useUser()
  const router = useRouter()

  if (!isLoaded) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-2 border-celadon-green border-t-transparent' />
          <p className='mt-4 text-lg text-muted-foreground'>인증 확인 중...</p>
        </div>
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center space-y-4'>
          <h1 className='text-2xl font-bold'>접근 제한</h1>
          <p className='text-muted-foreground'>이 페이지에 접근하려면 로그인이 필요합니다.</p>
          <button
            onClick={() => router.push('/sign-in')}
            className='px-4 py-2 bg-celadon-green text-white rounded hover:bg-celadon-green/90'
          >
            로그인
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, ReactNode } from 'react'
import { log } from '@/lib/utils/logger'

interface AdminProtectedRouteProps {
  children: ReactNode
  fallback?: ReactNode
}

export function AdminProtectedRoute({ 
  children, 
  fallback = null 
}: AdminProtectedRouteProps) {
  const { user, isLoaded } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!isLoaded) return

    if (!user) {
      log.info('사용자가 없음, 로그인 페이지로 이동')
      router.push('/admin/login')
      return
    }

    // 관리자 계정 확인
    const adminEmails = ['info@orientalcalligraphy.org', 'admin@asca.kr', 'content@asca.kr', 'editor@asca.kr']
    const isAdmin = adminEmails.includes(user.emailAddresses?.[0]?.emailAddress || '')
    
    if (isAdmin) {
      log.debug('관리자 사용자 확인됨', { email: user.emailAddresses?.[0]?.emailAddress })
    } else {
      log.warn('관리자 권한이 없는 사용자의 접근 시도', { 
        email: user.emailAddresses?.[0]?.emailAddress 
      })
      router.push('/')
    }
  }, [user, isLoaded, router])

  // 로딩 중이거나 사용자가 없는 경우
  if (!isLoaded || !user) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>인증 확인 중...</p>
        </div>
      </div>
    )
  }

  // 관리자 권한 확인
  const adminEmails = ['info@orientalcalligraphy.org', 'admin@asca.kr', 'content@asca.kr', 'editor@asca.kr']
  const isAdmin = adminEmails.includes(user.emailAddresses?.[0]?.emailAddress || '')
  
  if (!isAdmin) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">접근 권한이 없습니다</h1>
          <p className="text-gray-600 mb-4">관리자 권한이 필요한 페이지입니다.</p>
          <button 
            onClick={() => router.push('/')}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// Default export 추가
export default AdminProtectedRoute
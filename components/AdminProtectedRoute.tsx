'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'

interface AdminProtectedRouteProps {
  children: React.ReactNode
  requiredPermission?: {
    resource: string
    action: string
  }
}

export default function AdminProtectedRoute({ 
  children, 
  requiredPermission 
}: AdminProtectedRouteProps) {
  const { user, loading, hasPermission } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        console.log('사용자가 없음, 로그인 페이지로 이동')
        router.push('/admin/login')
        return
      }

      console.log('관리자 사용자 확인됨:', user.email)

      if (requiredPermission) {
        const hasAccess = hasPermission(
          requiredPermission.resource, 
          requiredPermission.action
        )
        if (!hasAccess) {
          router.push('/admin/unauthorized')
        }
      }
    }
  }, [user, loading, router, requiredPermission, hasPermission])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}

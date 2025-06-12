'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, LogIn } from 'lucide-react'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { signIn, user, loading: authLoading } = useAuth()
  const router = useRouter()

  // 이미 로그인된 사용자가 있다면 관리자 페이지로 리다이렉트
  useEffect(() => {
    if (!authLoading && user) {
      
      router.push('/admin')
    }
  }, [user, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await signIn(email, password)
      // 로그인 성공 후 관리자 대시보드로 이동
      router.push('/admin')
      router.refresh() // 페이지 새로고침으로 상태 확실히 반영
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 인증 로딩 중이거나 이미 로그인된 사용자가 있을 때 로딩 표시
  if (authLoading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">
            {user ? '관리자 페이지로 이동 중...' : '로딩 중...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <LogIn className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl text-center">관리자 로그인</CardTitle>
          <CardDescription className="text-center">
            동양서예협회 관리자 시스템에 로그인하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>            
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  로그인 중...
                </>
              ) : (
                '로그인'
              )}
            </Button>
          </form>
          
          {/* 관리자 계정 정보 */}
          <div className="mt-6 space-y-4">
            {/* 특별 관리자 계정 */}
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg">
              <h3 className="text-sm font-semibold text-emerald-800 dark:text-emerald-200 mb-2">
                동양서예협회 관리자 계정
              </h3>
              <div className="text-xs text-emerald-700 dark:text-emerald-300">
                • info@orientalcalligraphy.org (최고 관리자)
              </div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                이메일만 입력하면 비밀번호 없이 자동으로 로그인되어 관리자 대시보드로 이동합니다.
              </p>
            </div>

            {/* 개발용 계정 정보 */}
            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
                개발용 테스트 계정
              </h3>
              <div className="space-y-1 text-xs text-blue-700 dark:text-blue-300">
                <div>• admin@asca.kr / admin123!@# (시스템 관리자)</div>
                <div>• content@asca.kr / content123!@# (콘텐츠 관리자)</div>
                <div>• editor@asca.kr / editor123!@# (편집자)</div>
              </div>
              <div className="mt-2">
                <a 
                  href="/admin/dev-login" 
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  → 간편 개발 로그인 페이지
                </a>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { LogIn, LogOut, User, MessageCircle } from 'lucide-react'
import { loginWithKakao, logoutFromKakao, getKakaoUserInfo, KakaoUserInfo } from '@/lib/kakao'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface KakaoLoginButtonProps {
  // 버튼 스타일링
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary' | 'link'
  size?: 'sm' | 'md' | 'lg'
  className?: string

  // 텍스트 커스터마이징
  loginText?: string
  logoutText?: string

  // 사용자 정보 표시 여부
  showUserInfo?: boolean

  // 콜백 함수
  onLoginSuccess?: (userInfo: KakaoUserInfo) => void
  onLoginError?: (error: any) => void
  onLogout?: () => void
}

export function KakaoLoginButton({
  variant = 'outline',
  size = 'md',
  className = '',
  loginText = '카카오 로그인',
  logoutText = '로그아웃',
  showUserInfo = false,
  onLoginSuccess,
  onLoginError,
  onLogout,
}: KakaoLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [userInfo, setUserInfo] = useState<KakaoUserInfo | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // 초기 로그인 상태 확인
  useEffect(() => {
    checkLoginStatus()
  }, [])

  const checkLoginStatus = async () => {
    try {
      const info = await getKakaoUserInfo()
      if (info) {
        setUserInfo(info)
        setIsLoggedIn(true)
      }
    } catch (error) {
      // 로그인되지 않은 상태는 정상
      setIsLoggedIn(false)
      setUserInfo(null)
    }
  }

  const handleLogin = async () => {
    try {
      setIsLoading(true)

      const loginResponse = await loginWithKakao()
      if (!loginResponse) {
        throw new Error('로그인에 실패했습니다')
      }

      // 로그인 성공 후 사용자 정보 가져오기
      const info = await getKakaoUserInfo()
      if (info) {
        setUserInfo(info)
        setIsLoggedIn(true)
        toast.success(`안녕하세요, ${info.properties?.nickname || '사용자'}님! 🎉`)
        onLoginSuccess?.(info)
      }
    } catch (error) {
      toast.error('로그인 중 오류가 발생했습니다. 다시 시도해주세요.')
      onLoginError?.(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      setIsLoading(true)

      const success = await logoutFromKakao()
      if (success) {
        setUserInfo(null)
        setIsLoggedIn(false)
        toast.success('로그아웃되었습니다')
        onLogout?.()
      }
    } catch (error) {
      toast.error('로그아웃 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const getButtonSize = () => {
    switch (size) {
      case 'sm':
        return 'h-8 px-3 text-xs'
      case 'lg':
        return 'h-12 px-6 text-base'
      default:
        return 'h-10 px-4 text-sm'
    }
  }

  // 로그인된 상태에서 사용자 정보 표시
  if (isLoggedIn && showUserInfo && userInfo) {
    return (
      <Card className='w-full max-w-sm'>
        <CardHeader className='pb-3'>
          <div className='flex items-center space-x-3'>
            <Avatar className='h-10 w-10'>
              <AvatarImage
                src={
                  userInfo.properties?.profile_image ||
                  userInfo.kakao_account?.profile?.profile_image_url
                }
                alt={userInfo.properties?.nickname || '프로필'}
              />
              <AvatarFallback>
                <User className='h-5 w-5' />
              </AvatarFallback>
            </Avatar>
            <div className='flex-1 min-w-0'>
              <CardTitle className='text-sm font-medium truncate'>
                {userInfo.properties?.nickname ||
                  userInfo.kakao_account?.profile?.nickname ||
                  '사용자'}
              </CardTitle>
              <CardDescription className='text-xs text-muted-foreground'>
                카카오 계정으로 로그인됨
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className='pt-0'>
          <Button
            variant='outline'
            size='sm'
            onClick={handleLogout}
            disabled={isLoading}
            className='w-full'
          >
            <LogOut className='h-4 w-4 mr-2' />
            {isLoading ? '로그아웃 중...' : logoutText}
          </Button>
        </CardContent>
      </Card>
    )
  }

  // 기본 로그인/로그아웃 버튼
  return (
    <Button
      variant={variant}
      onClick={isLoggedIn ? handleLogout : handleLogin}
      disabled={isLoading}
      className={`
        ${getButtonSize()}
        ${
          isLoggedIn
            ? 'bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-300'
            : 'bg-yellow-400 hover:bg-yellow-500 text-yellow-900 border-yellow-400 hover:border-yellow-500'
        }
        dark:${
          isLoggedIn
            ? 'bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 dark:border-gray-600'
            : 'bg-yellow-500 dark:hover:bg-yellow-600 dark:text-yellow-50 dark:border-yellow-500'
        }
        transition-all duration-200 flex items-center gap-2
        ${className}
      `}
    >
      {isLoggedIn ? (
        <>
          <LogOut className='h-4 w-4' />
          <span className='font-medium'>{isLoading ? '로그아웃 중...' : logoutText}</span>
        </>
      ) : (
        <>
          <MessageCircle className={`h-4 w-4 ${isLoading ? 'animate-pulse' : ''}`} />
          <span className='font-medium'>{isLoading ? '로그인 중...' : loginText}</span>
        </>
      )}
    </Button>
  )
}

// 카카오 사용자 정보 훅
export function useKakaoAuth() {
  const [userInfo, setUserInfo] = useState<KakaoUserInfo | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    checkLoginStatus()
  }, [])

  const checkLoginStatus = async () => {
    try {
      setIsLoading(true)
      const info = await getKakaoUserInfo()
      if (info) {
        setUserInfo(info)
        setIsLoggedIn(true)
      }
    } catch (error) {
      setIsLoggedIn(false)
      setUserInfo(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async () => {
    try {
      setIsLoading(true)
      const loginResponse = await loginWithKakao()
      if (loginResponse) {
        const info = await getKakaoUserInfo()
        if (info) {
          setUserInfo(info)
          setIsLoggedIn(true)
          return info
        }
      }
      return null
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      setIsLoading(true)
      const success = await logoutFromKakao()
      if (success) {
        setUserInfo(null)
        setIsLoggedIn(false)
      }
      return success
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return {
    userInfo,
    isLoggedIn,
    isLoading,
    login,
    logout,
    checkLoginStatus,
  }
}

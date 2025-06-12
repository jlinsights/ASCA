 
'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase'
import { getCurrentUser, hasPermission } from '@/lib/supabase/auth'
import type { AdminUser, AuthContextType } from '@/types/auth'
import { log } from '@/lib/utils/logger'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 초기 사용자 상태 확인
    checkUser()

    // 인증 상태 변경 리스너 (Supabase가 설정된 경우에만)
    let subscription: any = null
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient()
      if (supabase) {
        const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
          if (event === 'SIGNED_IN' && session?.user) {
            await loadAdminUser()
          } else if (event === 'SIGNED_OUT') {
            setUser(null)
          }
          setLoading(false)
        })
        subscription = authSubscription
      }
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [])

  const checkUser = async () => {
    try {
      // 특별 관리자 세션 확인
      const specialSession = localStorage.getItem('special_admin_session')
      if (specialSession) {
        const session = JSON.parse(specialSession)
        if (session.isAuthenticated) {
          setUser({
            id: 'special_admin',
            user_id: 'special_admin',
            role_id: 'super_admin',
            name: '동양서예협회 관리자',
            email: 'info@orientalcalligraphy.org',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            role: {
              id: 'super_admin',
              name: 'super_admin',
              description: '최고 관리자',
              permissions: {
                cms: {
                  notices: ['create', 'read', 'update', 'delete', 'publish'],
                  exhibitions: ['create', 'read', 'update', 'delete', 'publish'],
                  events: ['create', 'read', 'update', 'delete', 'publish'],
                  comments: ['read', 'approve', 'delete']
                },
                artists: {
                  artists: ['create', 'read', 'update', 'delete'],
                  artworks: ['create', 'read', 'update', 'delete']
                },
                admin: {
                  users: ['create', 'read', 'update', 'delete'],
                  roles: ['create', 'read', 'update', 'delete'],
                  logs: ['read'],
                  backup: ['create', 'restore']
                }
              },
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          })
          setLoading(false)
          return
        }
      }

      // 개발 모드에서 localStorage 세션 확인
      const devSession = localStorage.getItem('dev_admin_session')
      if (devSession) {
        const session = JSON.parse(devSession)
        if (session.isAuthenticated) {
          setUser({
            id: session.user.id,
            user_id: session.user.id,
            role_id: session.user.role,
            name: session.user.name,
            email: session.user.email,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
                      role: {
            id: session.user.role,
            name: session.user.role,
            description: `${session.user.name} 역할`,
            permissions: {
              cms: {
                notices: ['create', 'read', 'update', 'delete', 'publish'],
                exhibitions: ['create', 'read', 'update', 'delete', 'publish'],
                events: ['create', 'read', 'update', 'delete', 'publish'],
                comments: ['read', 'approve', 'delete']
              },
              artists: {
                artists: ['create', 'read', 'update', 'delete'],
                artworks: ['create', 'read', 'update', 'delete']
              },
              admin: {
                users: ['create', 'read', 'update', 'delete'],
                roles: ['create', 'read', 'update', 'delete'],
                logs: ['read'],
                backup: ['create', 'restore']
              }
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          })
          setLoading(false)
          return
        }
      }

      const adminUser = await getCurrentUser()
      setUser(adminUser)
    } catch (error) {
      
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const loadAdminUser = async () => {
    try {
      const adminUser = await getCurrentUser()
      setUser(adminUser)
    } catch (error) {
      
      setUser(null)
    }
  }

  const signIn = async (email: string, password: string) => {
    // 특별 관리자 로그인 (개발 환경)
    if (process.env.NODE_ENV === 'development' && email && password) {
      if (email === 'info@orientalcalligraphy.org' && password === 'asca2024!') {
        const specialAdminUser = {
          id: 'special-admin',
          email: 'info@orientalcalligraphy.org',
          name: 'Special Admin',
          role: 'super_admin'
        }
        setUser(specialAdminUser)
        localStorage.setItem('special_admin_user', JSON.stringify(specialAdminUser))
        log.debug('특별 관리자 로그인 성공', { email: specialAdminUser.email })
        return { success: true, user: specialAdminUser }
      }
    }

    // 개발 모드에서 테스트 계정 확인
    const devAccounts = [
      { email: 'admin@asca.kr', password: 'admin123!@#', role: 'super_admin', name: '시스템 관리자' },
      { email: 'content@asca.kr', password: 'content123!@#', role: 'content_manager', name: '콘텐츠 관리자' },
      { email: 'editor@asca.kr', password: 'editor123!@#', role: 'editor', name: '편집자' }
    ]

    const devAccount = devAccounts.find(acc => acc.email === email && acc.password === password)
    
    if (devAccount) {
      // 개발 모드 로그인
      const devUser = {
        id: devAccount.role,
        user_id: devAccount.role,
        role_id: devAccount.role,
        name: devAccount.name,
        email: devAccount.email,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        role: {
          id: devAccount.role,
          name: devAccount.role,
          description: `${devAccount.name} 역할`,
          permissions: {
            cms: {
              notices: ['create', 'read', 'update', 'delete', 'publish'],
              exhibitions: ['create', 'read', 'update', 'delete', 'publish'],
              events: ['create', 'read', 'update', 'delete', 'publish'],
              comments: ['read', 'approve', 'delete']
            },
            artists: {
              artists: ['create', 'read', 'update', 'delete'],
              artworks: ['create', 'read', 'update', 'delete']
            },
            admin: {
              users: ['create', 'read', 'update', 'delete'],
              roles: ['create', 'read', 'update', 'delete'],
              logs: ['read'],
              backup: ['create', 'restore']
            }
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }
      
      localStorage.setItem('dev_admin_session', JSON.stringify({
        user: devAccount,
        isAuthenticated: true,
        loginTime: new Date().toISOString()
      }))
      
      setUser(devUser)
      return
    }

    // 정식 Supabase Auth 로그인 시도
    try {
      const { signInWithEmail } = await import('@/lib/supabase/auth')
      const result = await signInWithEmail(email, password)
      setUser(result.adminUser)
    } catch (error) {
      throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.')
    }
  }

  const signOut = async () => {
    // 특별 관리자 세션 제거
    localStorage.removeItem('special_admin_session')
    // 개발 모드 세션 제거
    localStorage.removeItem('dev_admin_session')
    
    try {
      const { signOut: authSignOut } = await import('@/lib/supabase/auth')
      await authSignOut()
    } catch (error) {
      log.warn('Supabase 로그아웃 오류 (개발 모드에서는 무시)', error as Error)
    }
    
    setUser(null)
  }

  const checkPermission = (resource: string, action: string): boolean => {
    if (!user) return false
    // 특별 관리자 계정은 모든 권한 허용
    if (user.email === 'info@orientalcalligraphy.org') return true
    // 개발 계정도 모든 권한 허용
    if (['admin@asca.kr', 'content@asca.kr', 'editor@asca.kr'].includes(user.email)) return true
    // 일반적인 권한 체크는 동기적으로 처리
    return true // 임시로 모든 권한 허용
  }

  const refreshUser = async () => {
    await loadAdminUser()
  }

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signOut,
    hasPermission: checkPermission,
    refreshUser
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth는 AuthProvider 내에서 사용되어야 합니다')
  }
  return context
}
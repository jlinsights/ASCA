 
'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase'
import { getCurrentUser, hasPermission as supabaseHasPermission } from '@/lib/supabase/auth'
import type { AdminUser, AuthContextType } from '@/types/auth'
import { log } from '@/lib/utils/logger'
import { devAuth } from '@/lib/auth/dev-auth'

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
      // 개발 모드에서 dev-auth 세션 확인
      if (process.env.NODE_ENV === 'development') {
        const isAuthenticated = await devAuth.isAuthenticated()
        if (isAuthenticated) {
          const devUser = await devAuth.getCurrentUser()
          if (devUser) {
            // dev-auth 사용자를 AdminUser 형식으로 변환
            const adminUser: AdminUser = {
              id: devUser.id,
              user_id: devUser.id,
              role_id: devUser.role === 'admin' ? 'admin' : 'member',
              name: `${devUser.firstName || ''} ${devUser.lastName || ''}`.trim() || devUser.email,
              email: devUser.email,
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              role: {
                id: devUser.role,
                name: devUser.role,
                description: devUser.role === 'admin' ? '관리자' : '회원',
                permissions: {
                  cms: {
                    notices: devUser.role === 'admin' ? ['create', 'read', 'update', 'delete', 'publish'] : ['read'],
                    exhibitions: devUser.role === 'admin' ? ['create', 'read', 'update', 'delete', 'publish'] : ['read'],
                    events: devUser.role === 'admin' ? ['create', 'read', 'update', 'delete', 'publish'] : ['read'],
                    comments: devUser.role === 'admin' ? ['read', 'approve', 'delete'] : ['read']
                  },
                  artists: {
                    artists: devUser.role === 'admin' ? ['create', 'read', 'update', 'delete'] : ['read'],
                    artworks: devUser.role === 'admin' ? ['create', 'read', 'update', 'delete'] : ['read']
                  },
                  admin: {
                    users: devUser.role === 'admin' ? ['create', 'read', 'update', 'delete'] : [],
                    roles: devUser.role === 'admin' ? ['create', 'read', 'update', 'delete'] : [],
                    logs: devUser.role === 'admin' ? ['read'] : [],
                    backup: devUser.role === 'admin' ? ['create', 'restore'] : []
                  }
                },
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            }
            setUser(adminUser)
            setLoading(false)
            return
          }
        }
      }

      // Supabase 인증 확인 (프로덕션)
      const adminUser = await getCurrentUser()
      setUser(adminUser)
    } catch (error) {
      log.error('인증 확인 실패', { error })
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
    try {
      // 개발 모드에서 dev-auth 사용
      if (process.env.NODE_ENV === 'development') {
        const devUser = await devAuth.signIn(email, password)
        
        // dev-auth 사용자를 AdminUser 형식으로 변환
        const adminUser: AdminUser = {
          id: devUser.id,
          user_id: devUser.id,
          role_id: devUser.role === 'admin' ? 'admin' : 'member',
          name: `${devUser.firstName || ''} ${devUser.lastName || ''}`.trim() || devUser.email,
          email: devUser.email,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          role: {
            id: devUser.role,
            name: devUser.role,
            description: devUser.role === 'admin' ? '관리자' : '회원',
            permissions: {
              cms: {
                notices: devUser.role === 'admin' ? ['create', 'read', 'update', 'delete', 'publish'] : ['read'],
                exhibitions: devUser.role === 'admin' ? ['create', 'read', 'update', 'delete', 'publish'] : ['read'],
                events: devUser.role === 'admin' ? ['create', 'read', 'update', 'delete', 'publish'] : ['read'],
                comments: devUser.role === 'admin' ? ['read', 'approve', 'delete'] : ['read']
              },
              artists: {
                artists: devUser.role === 'admin' ? ['create', 'read', 'update', 'delete'] : ['read'],
                artworks: devUser.role === 'admin' ? ['create', 'read', 'update', 'delete'] : ['read']
              },
              admin: {
                users: devUser.role === 'admin' ? ['create', 'read', 'update', 'delete'] : [],
                roles: devUser.role === 'admin' ? ['create', 'read', 'update', 'delete'] : [],
                logs: devUser.role === 'admin' ? ['read'] : [],
                backup: devUser.role === 'admin' ? ['create', 'restore'] : []
              }
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        }
        
        setUser(adminUser)
        return
      }

      // 프로덕션에서 Supabase Auth 사용
      const { signInWithEmail } = await import('@/lib/supabase/auth')
      const result = await signInWithEmail(email, password)
      setUser(result.adminUser)
    } catch (error) {
      log.error('로그인 실패', { error, email })
      throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.')
    }
  }

  const signOut = async () => {
    try {
      // 개발 모드에서 dev-auth 로그아웃
      if (process.env.NODE_ENV === 'development') {
        await devAuth.signOut()
      } else {
        // 프로덕션에서 Supabase Auth 로그아웃
        const { signOut: authSignOut } = await import('@/lib/supabase/auth')
        await authSignOut()
      }
    } catch (error) {
      log.warn('로그아웃 오류', error as Error)
    }
    
    setUser(null)
  }

  const hasPermission = async (resource: string, action: string): Promise<boolean> => {
    if (!user) return false
    
    // 개발 모드에서 dev-auth 사용자 권한 확인
    if (process.env.NODE_ENV === 'development') {
      // 관리자는 모든 권한 허용
      if (user.role?.name === 'admin') return true
      // 일반 회원은 읽기 권한만 허용
      return action === 'read'
    }
    
    // 프로덕션에서 Supabase 권한 확인
    return await supabaseHasPermission(resource, action)
  }

  const refreshUser = async () => {
    await loadAdminUser()
  }

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signOut,
    hasPermission,
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
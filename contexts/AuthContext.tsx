'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useUser, useClerk } from '@clerk/nextjs'
import type { AdminUser, AuthContextType } from '@/lib/types/auth-legacy'
import { log } from '@/lib/utils/logger'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, user: clerkUser } = useUser()
  const { signOut: clerkSignOut } = useClerk()
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoaded) return

    if (!isSignedIn || !clerkUser) {
      setUser(null)
      setLoading(false)
      return
    }

    const adminUser: AdminUser = {
      id: clerkUser.id,
      user_id: clerkUser.id,
      role_id: 'member',
      name: clerkUser.fullName || clerkUser.emailAddresses[0]?.emailAddress || '',
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
      is_active: true,
      created_at: clerkUser.createdAt?.toISOString() || new Date().toISOString(),
      updated_at: clerkUser.updatedAt?.toISOString() || new Date().toISOString(),
      role: {
        id: 'member',
        name: 'member',
        description: '회원',
        permissions: {
          cms: {
            notices: ['read'],
            exhibitions: ['read'],
            events: ['read'],
            comments: ['read'],
          },
          artists: {
            artists: ['read'],
            artworks: ['read'],
          },
          admin: {
            users: [],
            roles: [],
            logs: [],
            backup: [],
          },
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    }

    setUser(adminUser)
    setLoading(false)
  }, [isLoaded, isSignedIn, clerkUser])

  const signIn = async (_email: string, _password: string) => {
    log.warn('signIn called on AuthContext — use Clerk SignIn component instead')
  }

  const signOut = async () => {
    try {
      await clerkSignOut({ redirectUrl: '/' })
    } catch (error) {
      log.warn('로그아웃 오류', error as Error)
    }
    setUser(null)
  }

  const hasPermission = async (_resource: string, action: string): Promise<boolean> => {
    if (!user) return false
    if (user.role?.name === 'admin') return true
    return action === 'read'
  }

  const refreshUser = async () => {
    // Clerk handles user refresh automatically
  }

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signOut,
    hasPermission,
    refreshUser,
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

'use client'

import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useAccount } from '@/components/auth/session-provider'
import { createAuthBrowserClient } from '@/lib/auth/supabase/browser'
import type { AdminUser, AuthContextType } from '@/lib/types/auth-legacy'

const Context = createContext<AuthContextType | null>(null)

/** Adapter for legacy CMS presentation. Server/API permissions remain authoritative. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const { user: account, isLoaded, refresh, signOut } = useAccount()
  const admin = account?.role === 'admin' && account.assuranceLevel === 'aal2'
  const user = useMemo<AdminUser | null>(
    () =>
      account
        ? {
            id: account.id,
            user_id: account.id,
            name: account.displayName,
            email: account.email,
            role_id: admin ? 'admin' : 'member',
            role: {
              id: admin ? 'admin' : 'member',
              name: admin ? 'admin' : 'member',
              permissions: {},
              created_at: account.createdAt,
              updated_at: account.updatedAt,
            },
            is_active: true,
            created_at: account.createdAt,
            updated_at: account.updatedAt,
          }
        : null,
    [account, admin]
  )
  async function signIn(email: string, password: string) {
    const { error } = await createAuthBrowserClient().auth.signInWithPassword({ email, password })
    if (error) throw error
    await refresh()
  }
  return (
    <Context.Provider
      value={{
        user,
        loading: !isLoaded,
        signIn,
        signOut,
        refreshUser: refresh,
        hasPermission: async () => !!admin,
      }}
    >
      {children}
    </Context.Provider>
  )
}
export function useAuth() {
  const context = useContext(Context)
  if (!context) throw new Error('useAuth requires AuthProvider')
  return context
}

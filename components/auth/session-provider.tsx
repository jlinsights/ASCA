'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { SupabaseAccount } from '@/lib/auth/supabase/types'
import { createAuthBrowserClient } from '@/lib/auth/supabase/browser'

interface AccountSession {
  user: SupabaseAccount | null
  isLoaded: boolean
  isSignedIn: boolean
  error: boolean
  refresh: () => Promise<void>
  signOut: () => Promise<void>
}
const Context = createContext<AccountSession | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SupabaseAccount | null>(null)
  const [isLoaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const generation = useRef(0)
  const refresh = useCallback(async () => {
    const current = ++generation.current
    try {
      const response = await fetch('/api/auth/session', {
        cache: 'no-store',
        credentials: 'same-origin',
      })
      if (!response.ok) throw new Error('AUTH_UNAVAILABLE')
      const data: { account: SupabaseAccount | null } = await response.json()
      if (current !== generation.current) return
      setUser(data.account)
      setError(false)
    } catch {
      if (current !== generation.current) return
      setUser(null)
      setError(true)
    } finally {
      if (current === generation.current) setLoaded(true)
    }
  }, [])

  useEffect(() => {
    const pendingRequests = generation
    const client = createAuthBrowserClient()
    void refresh()
    // Never await another Supabase call inside its auth-state callback (SDK lock).
    const { data } = client.auth.onAuthStateChange(() => {
      void refresh()
    })
    const focus = () => {
      void refresh()
    }
    window.addEventListener('focus', focus)
    return () => {
      pendingRequests.current++
      data.subscription.unsubscribe()
      window.removeEventListener('focus', focus)
    }
  }, [refresh])

  const signOut = useCallback(async () => {
    const { error: signOutError } = await createAuthBrowserClient().auth.signOut()
    if (signOutError) {
      setError(true)
      throw signOutError
    }
    generation.current++
    setUser(null)
    window.location.assign('/')
  }, [])

  return (
    <Context.Provider value={{ user, isLoaded, isSignedIn: !!user, error, refresh, signOut }}>
      {children}
    </Context.Provider>
  )
}

export function useAccount() {
  const session = useContext(Context)
  if (!session) throw new Error('useAccount requires SessionProvider')
  return session
}

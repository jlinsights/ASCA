"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { User } from "@supabase/supabase-js"
import { getSupabaseClient } from "@/lib/supabase"
import { Button } from "./ui/button"
import { LogOut } from "lucide-react"

interface HeaderMobileAuthProps {
  onCloseMenu: () => void
}

export function HeaderMobileAuth({ onCloseMenu }: HeaderMobileAuthProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = getSupabaseClient()

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleSignOut = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    onCloseMenu()
    window.location.href = '/'
  }

  if (loading) {
    return (
      <div className="border-t border-[#222222]/10 dark:border-[#fcfcfc]/10 pt-4 mt-4">
        <div className="h-12 bg-muted animate-pulse rounded" />
      </div>
    )
  }

  return (
    <div className="border-t border-[#222222]/10 dark:border-[#fcfcfc]/10 pt-4 mt-4">
      {user ? (
        <div className="space-y-3">
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium text-foreground mb-1">로그인됨</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
          <Link href="/profile/edit">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={onCloseMenu}
            >
              프로필
            </Button>
          </Link>
          <Link href="/profile/applications">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={onCloseMenu}
            >
              내 신청
            </Button>
          </Link>
          <Button
            variant="outline"
            className="w-full justify-start text-scholar-red hover:bg-scholar-red/10"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            로그아웃
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <Link href="/sign-in">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={onCloseMenu}
            >
              로그인
            </Button>
          </Link>
          <Link href="/sign-up">
            <Button
              className="w-full justify-start bg-celadon-green hover:bg-celadon-green/90"
              onClick={onCloseMenu}
            >
              회원가입
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
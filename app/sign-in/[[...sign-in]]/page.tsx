'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { getSupabaseClient } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SignInPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const supabase = getSupabaseClient()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!supabase) return

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.push('/')
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, router])

  if (!mounted || !supabase) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-celadon-green border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
            로그인
          </h1>
          <p className="text-muted-foreground">
            계정에 로그인하세요
          </p>
        </div>
        
        <div className="glass-panel p-8 rounded-lg">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#81B29A',
                    brandAccent: '#618B75',
                  }
                }
              },
              className: {
                container: 'w-full',
                label: 'text-foreground',
                button: 'bg-celadon-green hover:bg-celadon-green/90',
                input: 'bg-background border-border',
              }
            }}
            localization={{
              variables: {
                sign_in: {
                  email_label: '이메일',
                  password_label: '비밀번호',
                  button_label: '로그인',
                  loading_button_label: '로그인 중...',
                  social_provider_text: '{{provider}}로 로그인',
                  link_text: '이미 계정이 있으신가요? 로그인',
                },
                sign_up: {
                  email_label: '이메일',
                  password_label: '비밀번호',
                  button_label: '회원가입',
                  loading_button_label: '가입 중...',
                  social_provider_text: '{{provider}}로 가입',
                  link_text: '계정이 없으신가요? 회원가입',
                },
              },
            }}
            providers={['google', 'apple', 'kakao']}
            view="sign_in"
            showLinks={true}
          />
        </div>
      </div>
    </div>
  )
}

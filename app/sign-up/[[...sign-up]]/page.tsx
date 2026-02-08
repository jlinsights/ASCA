'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { getSupabaseClient } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { TermsAgreement } from '@/components/auth/TermsAgreement'

export default function SignUpPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [step, setStep] = useState<'terms' | 'form'>('terms')
  const [marketingConsent, setMarketingConsent] = useState(false)
  const supabase = getSupabaseClient()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!supabase) return

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Marketing consent can be saved here or handled via a post-signup flow
        // For now, we'll log it (real implementation depends on user_metadata schema)
        if (marketingConsent) {
          console.log('User agreed to marketing:', marketingConsent)
          // await supabase.auth.updateUser({ data: { marketing_consent: true } })
        }
        router.push('/')
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, router, marketingConsent])

  if (!mounted || !supabase) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-celadon-green border-t-transparent"></div>
      </div>
    )
  }

  const handleTermsAgreement = (consent: boolean) => {
    setMarketingConsent(consent)
    setStep('form')
    window.scrollTo(0, 0)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-background px-4 pt-28 md:pt-36 pb-12">
      <div className="w-full max-w-2xl">
        {step === 'terms' ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <TermsAgreement onAgree={handleTermsAgreement} />
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-md mx-auto">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
                회원가입
              </h1>
              <p className="text-muted-foreground">
                새 계정을 만드세요
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
                view="sign_up"
                showLinks={true}
              />
            </div>
            <div className="mt-4 text-center">
              <button 
                onClick={() => setStep('terms')}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
              >
                ← 약관 다시 보기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

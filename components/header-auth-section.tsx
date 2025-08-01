"use client"

import Link from "next/link"
import { Settings } from "lucide-react"

import { useLanguage } from "@/contexts/language-context"
import { KakaoLoginButton } from "./kakao/kakao-login-button"
import { log } from "@/lib/utils/logger"

export function HeaderAuthSection() {
  const { t } = useLanguage()
  
  return (
    <div className="flex items-center space-x-2">
      <KakaoLoginButton 
        variant="outline"
        size="sm"
        loginText="카카오 로그인"
        onLoginSuccess={(userInfo) => {
          log.debug('Kakao login success', { userInfo })
        }}
      />
      <div className="h-4 w-px bg-border"></div>
      <Link href="/admin/dev-login">
        <button className="text-xs uppercase tracking-wider px-3 py-2 border border-current rounded hover:bg-foreground hover:text-background transition-colors">
          {t("signIn")}
        </button>
      </Link>
      <Link href="/admin/dev-login">
        <button className="text-xs uppercase tracking-wider px-3 py-2 bg-foreground text-background rounded hover:bg-foreground/90 transition-colors">
          {t("signUp")}
        </button>
      </Link>
    </div>
  )
}
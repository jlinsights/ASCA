"use client"

import Link from "next/link"
import { Settings } from "lucide-react"

import { useLanguage } from "@/contexts/language-context"
import { KakaoLoginButton } from "./kakao/kakao-login-button"
import { log } from "@/lib/utils/logger"

interface HeaderMobileAuthProps {
  onCloseMenu: () => void
}

export function HeaderMobileAuth({ onCloseMenu }: HeaderMobileAuthProps) {
  const { t } = useLanguage()

  // 모바일 인증 기능 숨김 처리
  return null

  /*
  return (
    <div className="border-t border-[#222222]/10 dark:border-[#fcfcfc]/10 pt-4 mt-4">
      <div className="space-y-3">
        <KakaoLoginButton 
          variant="outline"
          size="md"
          className="w-full justify-start"
          loginText="카카오 로그인"
          onLoginSuccess={(userInfo) => {
            log.debug('Mobile Kakao login success', { userInfo })
          }}
        />
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/50" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">또는</span>
          </div>
        </div>
        <Link href="/admin/dev-login">
          <button 
            className="w-full text-sm uppercase tracking-wider py-3 px-4 border border-current rounded hover:bg-foreground hover:text-background transition-colors text-left"
            onClick={onCloseMenu}
          >
            {t("signIn")}
          </button>
        </Link>
        <Link href="/admin/dev-login">
          <button 
            className="w-full text-sm uppercase tracking-wider py-3 px-4 bg-foreground text-background rounded hover:bg-foreground/90 transition-colors text-left"
            onClick={onCloseMenu}
          >
            {t("signUp")}
          </button>
        </Link>
      </div>
    </div>
  )
  */
}
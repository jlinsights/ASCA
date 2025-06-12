"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageSelector } from "@/components/language-selector"
import { KakaoLoginButton } from "@/components/kakao/kakao-login-button"
import { SignInButton, SignUpButton, UserButton, SignedIn, SignedOut } from "@clerk/nextjs"
import { NavigationMenu } from "@/components/header/navigation-menu"
import { useLanguage } from "@/contexts/language-context"
import { log } from "@/lib/utils/logger"

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const { language } = useLanguage()

  const handleClose = () => setIsOpen(false)

  return (
    <div className="lg:hidden flex items-center gap-2">
      <ThemeToggle onToggle={() => {}} />
      <LanguageSelector />
      
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="lg:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">메뉴 열기</span>
          </Button>
        </SheetTrigger>
        
        <SheetContent side="right" className="w-80 p-0">
          <div className="flex flex-col h-full">
            {/* 모바일 메뉴 헤더 */}
            <div className="flex items-center justify-between p-4 border-b">
              <span className="font-semibold text-lg">메뉴</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* 네비게이션 메뉴 */}
            <div className="flex-1 overflow-y-auto">
              <NavigationMenu onItemClick={handleClose} />
            </div>

            {/* 모바일 로그인 섹션 */}
            <div className="p-4 border-t bg-muted/30">
              <SignedOut>
                <div className="space-y-3">
                  <SignInButton mode="modal">
                    <Button variant="outline" className="w-full">
                      {language === 'ko' ? '로그인' : 'Sign In'}
                    </Button>
                  </SignInButton>
                  
                  <SignUpButton mode="modal">
                    <Button className="w-full">
                      {language === 'ko' ? '회원가입' : 'Sign Up'}
                    </Button>
                  </SignUpButton>
                  
                  <KakaoLoginButton
                    loginText="카카오 로그인"
                    onLoginSuccess={(userInfo) => {
                      log.debug('Mobile Kakao login success', { userInfo })
                      handleClose()
                    }}
                  />
                </div>
              </SignedOut>
              
              <SignedIn>
                <div className="flex items-center justify-between">
                  <UserButton 
                    appearance={{
                      elements: {
                        avatarBox: "h-8 w-8"
                      }
                    }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {language === 'ko' ? '로그인됨' : 'Signed in'}
                  </span>
                </div>
              </SignedIn>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
} 
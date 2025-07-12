'use client'

import { UserProfile } from "@clerk/nextjs"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useSearchParams } from "next/navigation"

export default function ProfilePage() {
  const searchParams = useSearchParams()
  const require2fa = searchParams.get("require2fa") === "1"
  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-semibold mb-8 text-center">프로필 관리</h1>
          {require2fa && (
            <p className="text-center text-red-700 font-bold mb-4">
              관리자는 반드시 2단계 인증을 등록해야 합니다.
            </p>
          )}
          <p className="text-center text-red-600 mb-6 font-medium">
            보안을 위해 2단계 인증(OTP 또는 SMS) 등록을 권장합니다.
          </p>
          <div className="flex justify-center">
            <UserProfile 
              appearance={{
                elements: {
                  rootBox: "w-full max-w-none",
                  card: "shadow-lg border border-border"
                }
              }}
            />
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
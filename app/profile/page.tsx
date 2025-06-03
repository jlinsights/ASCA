'use client'

import { UserProfile } from "@clerk/nextjs"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-semibold mb-8 text-center">프로필 관리</h1>
          
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
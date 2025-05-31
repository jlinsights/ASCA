'use client'

import { useAuth } from "@clerk/nextjs"
import { useParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock, Eye, Heart, Download } from "lucide-react"

export default function ProtectedArtworkPage() {
  const { isSignedIn, isLoaded } = useAuth()
  const params = useParams()

  if (!isLoaded) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-pulse">로딩 중...</div>
        </div>
        <Footer />
      </main>
    )
  }

  if (!isSignedIn) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <Lock className="h-12 w-12 text-muted-foreground" />
              </div>
              <CardTitle>회원 전용 작품</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                이 작품은 회원만 감상하실 수 있습니다.
              </p>
              <p className="text-sm text-muted-foreground">
                로그인하여 프리미엄 작품 컬렉션을 확인해보세요.
              </p>
              <div className="pt-4">
                <Button className="w-full">
                  로그인하기
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-scholar-red/10 to-celadon-green/10 rounded-lg p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-scholar-red/20 rounded-full">
                <Eye className="h-5 w-5 text-scholar-red" />
              </div>
              <h1 className="text-2xl font-semibold">프리미엄 작품 #{params.id}</h1>
            </div>
            <p className="text-muted-foreground">
              회원님께만 특별히 공개되는 프리미엄 작품 컬렉션입니다.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 작품 이미지 */}
            <div className="space-y-4">
              <div className="aspect-[4/5] bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center space-y-2">
                  <div className="p-4 bg-muted-foreground/10 rounded-full inline-block">
                    <Eye className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">프리미엄 작품 이미지</p>
                </div>
              </div>
            </div>

            {/* 작품 정보 */}
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-semibold mb-2">특별 소장품 - 비밀의 정원</h2>
                <p className="text-lg text-muted-foreground">작가: 김예술</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-scholar-red">₩5,800,000</div>
                    <div className="text-sm text-muted-foreground">추정 가격</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-celadon-green">1954</div>
                    <div className="text-sm text-muted-foreground">제작 연도</div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">작품 설명</h3>
                <p className="text-muted-foreground leading-relaxed">
                  이 작품은 20세기 중반의 동양화 기법을 현대적으로 재해석한 
                  매우 희귀한 작품입니다. 전통적인 수묵화 기법과 현대적 감각이 
                  절묘하게 조화를 이루며, 관람자에게 깊은 명상적 경험을 선사합니다.
                </p>
              </div>

              <div className="flex gap-3">
                <Button className="flex-1 flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  관심 작품 추가
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  고해상도 다운로드
                </Button>
              </div>

              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">🎯 회원 특별 혜택</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• 고해상도 이미지 다운로드</li>
                    <li>• 작품 상세 정보 및 이력</li>
                    <li>• 작가와의 특별 만남 기회</li>
                    <li>• 우선 구매권 제공</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
} 
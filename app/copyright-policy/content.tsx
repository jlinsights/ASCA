'use client'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Copyright, 
  Shield, 
  Book, 
  Gavel, 
  Eye, 
  Lock,
  AlertTriangle,
  FileText,
  Image,
  Users,
  ExternalLink,
  Scale,
  Camera,
  Palette
} from 'lucide-react'

export default function CopyrightPolicyContent() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="py-12 md:py-20 bg-gradient-to-b from-blue-50/50 to-background dark:from-blue-950/20">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Copyright className="h-8 w-8 md:h-10 md:w-10 text-blue-600" />
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
              저작권 정책
            </h1>
          </div>
          <p className="text-lg md:text-xl text-muted-foreground mb-6 max-w-3xl mx-auto">
            동양서예협회는 창작자의 저작권을 존중하고 보호합니다
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Badge variant="outline" className="text-sm border-blue-200">
              <Palette className="h-3 w-3 mr-1" />
              작품 보호
            </Badge>
            <Badge variant="outline" className="text-sm border-blue-200">
              <Scale className="h-3 w-3 mr-1" />
              저작권법
            </Badge>
            <Badge variant="outline" className="text-sm border-blue-200">
              <Shield className="h-3 w-3 mr-1" />
              권리 보장
            </Badge>
            <Badge variant="outline" className="text-sm border-blue-200">
              <Eye className="h-3 w-3 mr-1" />
              공정이용
            </Badge>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* 기본 원칙 */}
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl md:text-3xl font-bold">저작권 보호 원칙</h2>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/30 p-6 rounded-lg border border-blue-200 dark:border-blue-800 mb-6">
                <div className="flex items-start gap-3">
                  <Copyright className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div className="space-y-3">
                    <p className="font-semibold text-blue-800 dark:text-blue-200">
                      저작권 존중 선언
                    </p>
                    <p className="text-sm md:text-base text-blue-700 dark:text-blue-300">
                      사단법인 동양서예협회는 모든 창작자의 지적재산권을 존중하며, 저작권법에 따라 작품과 콘텐츠를 보호합니다. 
                      당 협회의 모든 활동은 저작권 보호를 최우선으로 하여 진행됩니다.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-3">
                    <Palette className="h-5 w-5 text-green-600" />
                    <h3 className="font-semibold text-green-800 dark:text-green-200">작품 보호</h3>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    출품작, 전시작, 수상작 등 모든 서예 작품의 저작권을 엄격히 보호합니다.
                  </p>
                </div>

                <div className="bg-purple-50 dark:bg-purple-950/30 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-2 mb-3">
                    <Camera className="h-5 w-5 text-purple-600" />
                    <h3 className="font-semibold text-purple-800 dark:text-purple-200">이미지 보호</h3>
                  </div>
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    전시회 사진, 작품 이미지, 교육 자료의 무단 사용을 금지합니다.
                  </p>
                </div>

                <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="h-5 w-5 text-amber-600" />
                    <h3 className="font-semibold text-amber-800 dark:text-amber-200">콘텐츠 보호</h3>
                  </div>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    웹사이트의 모든 텍스트, 디자인, 로고는 저작권 보호를 받습니다.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="bg-gradient-to-r from-scholar-red/5 to-scholar-red/10 border-scholar-red/20">
            <CardContent className="p-6 md:p-8 text-center">
              <h3 className="text-lg md:text-xl font-bold mb-4">저작권 관련 문의사항</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-4">
                저작권 정책 및 침해 신고에 대해 궁금한 사항이 있으시면 언제든지 문의해 주세요.
              </p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>📧 info@orientalcalligraphy.org</p>
                <p>📞 0502-5550-8700</p>
                <p>📍 〒02872 서울시 성북구 보문로 105 보림빌딩</p>
              </div>
              <div className="flex gap-4 justify-center mt-6">
                <Button className="gap-2">
                  상담 문의
                </Button>
                <Button variant="outline" className="gap-2">
                  상담 예약
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>
      </section>

      <Footer />
    </div>
  )
} 
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

export default function CopyrightPolicyPage() {
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

          {/* 작품 저작권 */}
          <Card className="border-l-4 border-l-emerald-500">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <Palette className="h-6 w-6 text-emerald-600" />
                <h2 className="text-2xl md:text-3xl font-bold">작품 저작권</h2>
                <Badge variant="secondary">출품작 및 전시작</Badge>
              </div>

              <div className="space-y-6">
                <div className="bg-emerald-50 dark:bg-emerald-950/30 p-6 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  <h3 className="text-xl font-bold mb-4 text-emerald-800 dark:text-emerald-200">
                    작품 저작권 귀속 및 이용
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="border-l-4 border-l-blue-500 pl-4">
                      <h4 className="font-semibold text-lg mb-2">1. 저작권 귀속</h4>
                      <p className="text-sm md:text-base text-muted-foreground">
                        모든 출품작 및 전시작의 저작권은 각각의 창작자(작가)에게 귀속됩니다. 
                        동양서예협회는 작품의 저작권을 주장하지 않으며, 작가의 권리를 보호합니다.
                      </p>
                    </div>

                    <div className="border-l-4 border-l-green-500 pl-4">
                      <h4 className="font-semibold text-lg mb-2">2. 전시 및 홍보 목적 이용</h4>
                      <p className="text-sm md:text-base text-muted-foreground">
                        작가는 작품 출품시 다음 목적으로의 이용을 동의한 것으로 간주됩니다:
                      </p>
                      <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                        <li>• 전시회 개최 및 운영</li>
                        <li>• 협회 홍보 및 마케팅 자료</li>
                        <li>• 도록, 카탈로그 제작</li>
                        <li>• 웹사이트 및 SNS 게시</li>
                        <li>• 언론 보도 자료 제공</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-l-purple-500 pl-4">
                      <h4 className="font-semibold text-lg mb-2">3. 상업적 이용 제한</h4>
                      <p className="text-sm md:text-base text-muted-foreground">
                        작품의 상업적 이용, 복제, 판매는 작가의 별도 서면 동의 없이는 불가능합니다. 
                        협회는 작가의 권익 보호를 위해 무단 상업적 이용을 금지합니다.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border">
                    <div className="flex items-center gap-3 mb-3">
                      <Lock className="h-5 w-5 text-red-600" />
                      <h4 className="font-semibold text-red-800 dark:text-red-200">금지 사항</h4>
                    </div>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• 작품의 무단 복제 및 배포</li>
                      <li>• 상업적 목적의 무단 사용</li>
                      <li>• 작품 변형 및 2차 창작</li>
                      <li>• 작가명 삭제 또는 변경</li>
                    </ul>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border">
                    <div className="flex items-center gap-3 mb-3">
                      <Eye className="h-5 w-5 text-green-600" />
                      <h4 className="font-semibold text-green-800 dark:text-green-200">허용 범위</h4>
                    </div>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• 개인적 학습 및 연구 목적</li>
                      <li>• 비영리 교육 목적 인용</li>
                      <li>• 언론 보도 및 비평</li>
                      <li>• 공정이용 범위 내 활용</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 웹사이트 콘텐츠 저작권 */}
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <Image className="h-6 w-6 text-purple-600" />
                <h2 className="text-2xl md:text-3xl font-bold">웹사이트 콘텐츠 저작권</h2>
                <Badge variant="outline" className="border-purple-200">디지털 콘텐츠</Badge>
              </div>

              <div className="bg-purple-50 dark:bg-purple-950/30 p-6 rounded-lg border border-purple-200 dark:border-purple-800">
                <h3 className="text-xl font-bold mb-4 text-purple-800 dark:text-purple-200">
                  동양서예협회 웹사이트 저작권
                </h3>
                
                <div className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-white dark:bg-slate-900 rounded-lg border">
                      <FileText className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                      <h4 className="font-semibold">텍스트 콘텐츠</h4>
                      <p className="text-xs text-muted-foreground mt-1">기사, 공지사항, 설명문</p>
                    </div>
                    <div className="text-center p-4 bg-white dark:bg-slate-900 rounded-lg border">
                      <Image className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                      <h4 className="font-semibold">이미지 자료</h4>
                      <p className="text-xs text-muted-foreground mt-1">사진, 그래픽, 로고</p>
                    </div>
                    <div className="text-center p-4 bg-white dark:bg-slate-900 rounded-lg border">
                      <Palette className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                      <h4 className="font-semibold">디자인 요소</h4>
                      <p className="text-xs text-muted-foreground mt-1">레이아웃, UI, 브랜딩</p>
                    </div>
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <span className="font-semibold text-amber-800 dark:text-amber-200">이용 제한</span>
                    </div>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      웹사이트의 모든 콘텐츠는 저작권법의 보호를 받으며, 동양서예협회의 서면 허가 없이는 
                      상업적 목적으로 복제, 배포, 전송할 수 없습니다.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 저작권 침해 대응 */}
          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <Gavel className="h-6 w-6 text-red-600" />
                <h2 className="text-2xl md:text-3xl font-bold">저작권 침해 신고 및 대응</h2>
                <Badge variant="destructive">법적 보호</Badge>
              </div>

              <div className="space-y-6">
                <div className="bg-red-50 dark:bg-red-950/30 p-6 rounded-lg border border-red-200 dark:border-red-800">
                  <h3 className="text-xl font-bold mb-4 text-red-800 dark:text-red-200">
                    저작권 침해 신고 절차
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3 text-red-700 dark:text-red-300">신고 방법</h4>
                      <ul className="space-y-2 text-sm text-red-600 dark:text-red-400">
                        <li>• 📧 이메일: info@orientalcalligraphy.org</li>
                        <li>• 📞 전화: 0502-5550-8700</li>
                        <li>• 📄 서면: 협회 사무실 방문</li>
                        <li>• 💬 온라인: 문의 양식 작성</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3 text-red-700 dark:text-red-300">필요 정보</h4>
                      <ul className="space-y-2 text-sm text-red-600 dark:text-red-400">
                        <li>• 침해 받은 저작물 정보</li>
                        <li>• 침해 사이트/자료 URL</li>
                        <li>• 저작권자 신분 증명</li>
                        <li>• 침해 정도 및 피해 내용</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-yellow-50 dark:bg-yellow-950/30 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">1단계: 경고</h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      침해자에게 중단 요구 및 경고 조치
                    </p>
                  </div>
                  
                  <div className="bg-orange-50 dark:bg-orange-950/30 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                    <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">2단계: 법적 통지</h4>
                    <p className="text-sm text-orange-700 dark:text-orange-300">
                      내용증명 발송 및 법적 조치 예고
                    </p>
                  </div>
                  
                  <div className="bg-red-50 dark:bg-red-950/30 p-4 rounded-lg border border-red-200 dark:border-red-800">
                    <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">3단계: 법적 조치</h4>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      민·형사 소송 및 손해배상 청구
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 공정이용 가이드라인 */}
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <Scale className="h-6 w-6 text-green-600" />
                <h2 className="text-2xl md:text-3xl font-bold">공정이용 가이드라인</h2>
                <Badge variant="outline" className="border-green-200">Fair Use</Badge>
              </div>

              <div className="bg-green-50 dark:bg-green-950/30 p-6 rounded-lg border border-green-200 dark:border-green-800">
                <h3 className="text-xl font-bold mb-4 text-green-800 dark:text-green-200">
                  저작물의 공정한 이용
                </h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-green-700 dark:text-green-300">✅ 허용되는 이용</h4>
                    <ul className="space-y-2 text-sm text-green-600 dark:text-green-400">
                      <li>• 교육 및 학술 연구 목적</li>
                      <li>• 비영리 목적의 개인적 이용</li>
                      <li>• 언론 보도 및 비평 목적</li>
                      <li>• 출처 명시한 인용 (저작권법 제28조)</li>
                      <li>• 도서관 등에서의 복제 (제31조)</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3 text-red-700 dark:text-red-300">❌ 금지되는 이용</h4>
                    <ul className="space-y-2 text-sm text-red-600 dark:text-red-400">
                      <li>• 상업적 목적의 무단 사용</li>
                      <li>• 전체 또는 주요 부분의 복제</li>
                      <li>• 작가명 삭제 또는 변경</li>
                      <li>• 작품의 변형 및 2차 창작</li>
                      <li>• 재배포 및 재판매</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Book className="h-4 w-4 text-blue-600" />
                    <span className="font-semibold text-blue-800 dark:text-blue-200">인용 표기 방법</span>
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    출처: 작품명, 작가명, 사단법인 동양서예협회, 제○회 대한민국 동양서예대전 (연도)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 관련 법령 */}
          <Card className="border-l-4 border-l-slate-500">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <Book className="h-6 w-6 text-slate-600" />
                <h2 className="text-2xl md:text-3xl font-bold">관련 법령</h2>
                <Badge variant="secondary">저작권법</Badge>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950/30 p-6 rounded-lg border border-slate-200 dark:border-slate-800">
                <h3 className="text-xl font-bold mb-4 text-center">
                  저작권법 주요 조항
                </h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="border-l-4 border-l-blue-500 pl-4">
                      <h4 className="font-semibold text-lg mb-2">제10조 (저작권의 내용)</h4>
                      <p className="text-sm text-muted-foreground">
                        저작자는 저작물을 복제·공연·공중송신·전시·배포·대여·2차적저작물작성할 권리를 가진다.
                      </p>
                    </div>

                    <div className="border-l-4 border-l-green-500 pl-4">
                      <h4 className="font-semibold text-lg mb-2">제28조 (공표된 저작물의 인용)</h4>
                      <p className="text-sm text-muted-foreground">
                        공표된 저작물은 보도·비평·교육·연구 등을 위하여 정당한 범위 안에서 공정한 관행에 합치되게 인용할 수 있다.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="border-l-4 border-l-purple-500 pl-4">
                      <h4 className="font-semibold text-lg mb-2">제136조 (벌칙)</h4>
                      <p className="text-sm text-muted-foreground">
                        저작재산권을 침해한 자는 5년 이하의 징역 또는 5천만원 이하의 벌금에 처한다.
                      </p>
                    </div>

                    <div className="border-l-4 border-l-red-500 pl-4">
                      <h4 className="font-semibold text-lg mb-2">제125조 (손해배상)</h4>
                      <p className="text-sm text-muted-foreground">
                        고의 또는 과실로 저작권을 침해한 자는 그 손해를 배상할 책임을 진다.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <Button 
                    variant="outline" 
                    className="gap-2"
                    onClick={() => window.open('https://www.law.go.kr/법령/저작권법', '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                    저작권법 전문 보기
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 업데이트 정보 */}
          <Card className="bg-muted/50 border-2 border-dashed">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <span className="font-semibold text-muted-foreground">정책 정보</span>
              </div>
              <p className="text-sm text-muted-foreground">
                최초 제정: 2023년 11월 1일 | 최종 수정: 2024년 1월 15일
              </p>
            </CardContent>
          </Card>

          <Separator />

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
                <p>📍 서울시 성북구 보문로 57-1 중앙빌딩 6층</p>
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
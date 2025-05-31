'use client'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Shield, 
  Mail, 
  AlertTriangle, 
  Phone, 
  ExternalLink,
  Lock,
  Ban,
  Scale,
  FileText
} from 'lucide-react'

export default function EmailRefusePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="py-12 md:py-20 bg-gradient-to-b from-red-50/50 to-background dark:from-red-950/20">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Ban className="h-8 w-8 md:h-10 md:w-10 text-red-600" />
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
              이메일 무단수집 거부
            </h1>
          </div>
          <p className="text-lg md:text-xl text-muted-foreground mb-6 max-w-3xl mx-auto">
            동양서예협회는 이메일 주소의 무단 수집을 엄격히 금지합니다
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Badge variant="destructive" className="text-sm">
              <AlertTriangle className="h-3 w-3 mr-1" />
              법적 보호
            </Badge>
            <Badge variant="outline" className="text-sm border-red-200">
              <Scale className="h-3 w-3 mr-1" />
              정보통신망법
            </Badge>
            <Badge variant="outline" className="text-sm border-red-200">
              <Shield className="h-3 w-3 mr-1" />
              개인정보보호
            </Badge>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* 기본 원칙 */}
          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <Mail className="h-6 w-6 text-red-600" />
                <h2 className="text-2xl md:text-3xl font-bold">무단수집 거부 원칙</h2>
              </div>

              <div className="bg-red-50 dark:bg-red-950/30 p-6 rounded-lg border border-red-200 dark:border-red-800 mb-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-1 flex-shrink-0" />
                  <div className="space-y-3">
                    <p className="font-semibold text-red-800 dark:text-red-200">
                      중요 공지사항
                    </p>
                    <p className="text-sm md:text-base text-red-700 dark:text-red-300">
                      동양서예협회 홈페이지에 게시된 이메일 주소가 전자우편 수집 프로그램이나 그밖의 기술적 장치를 이용하여 무단으로 수집되는 것을 거부하며, 이를 위반 시 정보통신망법에 의해 형사처벌됨을 유념하시기 바랍니다.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center gap-2 mb-3">
                      <Scale className="h-5 w-5 text-amber-600" />
                      <h3 className="font-semibold text-amber-800 dark:text-amber-200">법적 처벌</h3>
                    </div>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      이메일을 기술적 장치를 사용하여 무단으로 수집, 판매·유통하거나 이를 이용한 자는 
                      <strong className="block mt-1">「정보통신망이용촉진 및 정보보호 등에 관한 법률」 제50조의2 규정</strong>
                      에 의하여 벌금형에 처해집니다.
                    </p>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-3">
                      <Phone className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-blue-800 dark:text-blue-200">신고 안내</h3>
                    </div>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      기술적 장치를 사용한 이메일주소 무단수집 피해를 당하신 경우
                    </p>
                    <div className="mt-2 space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 text-blue-600" />
                        <span className="font-medium">전용전화: 1336</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ExternalLink className="h-3 w-3 text-blue-600" />
                        <span className="font-medium">spamcop.or.kr</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 법령 조항 */}
          <Card className="border-l-4 border-l-slate-500">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="h-6 w-6 text-slate-600" />
                <h2 className="text-2xl md:text-3xl font-bold">관련 법령</h2>
                <Badge variant="secondary">정보통신망법 제50조의2</Badge>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950/30 p-6 rounded-lg border border-slate-200 dark:border-slate-800">
                <h3 className="text-xl font-bold mb-4 text-center">
                  정보통신망법 제50조의2 (전자우편주소의 무단 수집행위 등 금지)
                </h3>
                
                <div className="space-y-6">
                  <div className="border-l-4 border-l-blue-500 pl-4">
                    <h4 className="font-semibold text-lg mb-2 text-blue-800 dark:text-blue-200">제1항</h4>
                    <p className="text-sm md:text-base text-muted-foreground">
                      누구든지 전자우편주소의 수집을 거부하는 의사가 명시된 인터넷 홈페이지에서 자동으로 전자우편주소를 수집하는 프로그램 그 밖의 기술적 장치를 이용하여 전자우편주소를 수집하여서는 아니된다.
                    </p>
                  </div>

                  <div className="border-l-4 border-l-emerald-500 pl-4">
                    <h4 className="font-semibold text-lg mb-2 text-emerald-800 dark:text-emerald-200">제2항</h4>
                    <p className="text-sm md:text-base text-muted-foreground">
                      누구든지 제1항의 규정을 위반하여 수집된 전자우편주소를 판매·유통 하여서는 아니된다.
                    </p>
                  </div>

                  <div className="border-l-4 border-l-purple-500 pl-4">
                    <h4 className="font-semibold text-lg mb-2 text-purple-800 dark:text-purple-200">제3항</h4>
                    <p className="text-sm md:text-base text-muted-foreground">
                      누구든지 제1항 및 제2항의 규정에 의하여 수집·판매 및 유통이 금지된 전자우편주소임을 알고 이를 정보전송에 이용하여서는 아니된다.
                    </p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <span className="font-semibold text-amber-800 dark:text-amber-200">위반시 처벌</span>
                  </div>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    위 조항을 위반할 경우 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」에 따라 벌금형에 처해집니다.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 신고 방법 */}
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="h-6 w-6 text-green-600" />
                <h2 className="text-2xl md:text-3xl font-bold">신고 및 제보</h2>
                <Badge variant="outline" className="border-green-200">불법스팸대응센터</Badge>
              </div>

              <div className="bg-green-50 dark:bg-green-950/30 p-6 rounded-lg border border-green-200 dark:border-green-800">
                <h3 className="text-xl font-bold mb-4 text-green-800 dark:text-green-200">
                  이메일 무단수집 피해 신고 방법
                </h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border">
                    <div className="flex items-center gap-3 mb-3">
                      <Phone className="h-6 w-6 text-green-600" />
                      <h4 className="font-semibold">전화 신고</h4>
                    </div>
                    <div className="space-y-2">
                      <p className="text-2xl font-bold text-green-600">☎ 1336</p>
                      <p className="text-sm text-muted-foreground">불법스팸대응센터 전용전화</p>
                      <p className="text-xs text-muted-foreground">평일 09:00 ~ 18:00</p>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border">
                    <div className="flex items-center gap-3 mb-3">
                      <ExternalLink className="h-6 w-6 text-blue-600" />
                      <h4 className="font-semibold">온라인 신고</h4>
                    </div>
                    <div className="space-y-2">
                      <p className="font-mono text-blue-600">spamcop.or.kr</p>
                      <p className="text-sm text-muted-foreground">불법스팸대응센터 홈페이지</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2 gap-2"
                        onClick={() => window.open('http://www.spamcop.or.kr', '_blank')}
                      >
                        <ExternalLink className="h-3 w-3" />
                        사이트 바로가기
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">📌 신고시 필요 정보</p>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• 무단수집이 의심되는 웹사이트 주소</li>
                    <li>• 수집된 것으로 추정되는 이메일 주소</li>
                    <li>• 스팸메일 발송 증거 자료</li>
                    <li>• 피해 발생 일시 및 경위</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 게시 정보 */}
          <Card className="bg-muted/50 border-2 border-dashed">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <span className="font-semibold text-muted-foreground">공지 정보</span>
              </div>
              <p className="text-sm text-muted-foreground">
                게시일: 2023년 11월 1일
              </p>
            </CardContent>
          </Card>

          <Separator />

          {/* Contact Information */}
          <Card className="bg-gradient-to-r from-scholar-red/5 to-scholar-red/10 border-scholar-red/20">
            <CardContent className="p-6 md:p-8 text-center">
              <h3 className="text-lg md:text-xl font-bold mb-4">이메일 수집 관련 문의사항</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-4">
                이메일 무단수집 방지 정책에 대해 궁금한 사항이 있으시면 언제든지 문의해 주세요.
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
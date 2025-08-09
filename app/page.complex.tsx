import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Calendar, Users, Award, BookOpen, MapPin, Phone, Mail } from 'lucide-react'

export default function Page() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-background via-background to-muted/20 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-8">
            <div className="flex justify-center mb-8">
              <Image
                src="/logo/Logo & Tagline_white BG.png"
                alt="동양서예협회 로고"
                width={400}
                height={160}
                className="h-32 w-auto object-contain dark:hidden"
                priority
              />
              <Image
                src="/logo/Logo & Tagline_black BG.png"
                alt="동양서예협회 로고"
                width={400}
                height={160}
                className="h-32 w-auto object-contain hidden dark:block"
                priority
              />
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              사단법인 동양서예협회
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              正法의 계승, 創新의 조화
            </p>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              전통 서예의 정법을 계승하고 현대적 창신을 통해 동양서예의 새로운 미래를 열어갑니다
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button asChild size="lg" className="gap-2">
                <Link href="/exhibitions/current">
                  <Calendar className="w-4 h-4" />
                  현재 전시 보기
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2">
                <Link href="/artworks">
                  <BookOpen className="w-4 h-4" />
                  작품 갤러리
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              동양서예협회의 특별함
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              전통과 현대가 조화를 이루는 동양서예의 새로운 패러다임을 제시합니다
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>전통 계승</CardTitle>
                <CardDescription>
                  수천 년의 전통 서예 기법과 정신을 체계적으로 계승하고 보존합니다
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>작가 육성</CardTitle>
                <CardDescription>
                  젊은 작가들의 창작 활동을 지원하고 동양서예의 미래를 준비합니다
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>문화 교류</CardTitle>
                <CardDescription>
                  국내외 서예계와의 활발한 교류를 통해 동양서예의 발전을 도모합니다
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              주요 서비스
            </h2>
            <p className="text-lg text-muted-foreground">
              동양서예협회에서 제공하는 다양한 서비스를 확인해보세요
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="group hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Calendar className="w-8 h-8 text-primary" />
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
                <h3 className="text-lg font-semibold mb-2">전시회</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  현재, 예정, 과거 전시회 정보를 확인하세요
                </p>
                <Button asChild variant="ghost" className="p-0 h-auto">
                  <Link href="/exhibitions">
                    자세히 보기
                  </Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <BookOpen className="w-8 h-8 text-primary" />
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
                <h3 className="text-lg font-semibold mb-2">작품 갤러리</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  다양한 서예 작품들을 감상하세요
                </p>
                <Button asChild variant="ghost" className="p-0 h-auto">
                  <Link href="/artworks">
                    자세히 보기
                  </Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Users className="w-8 h-8 text-primary" />
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
                <h3 className="text-lg font-semibold mb-2">작가 소개</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  협회 소속 작가들의 프로필을 확인하세요
                </p>
                <Button asChild variant="ghost" className="p-0 h-auto">
                  <Link href="/artists">
                    자세히 보기
                  </Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Award className="w-8 h-8 text-primary" />
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
                <h3 className="text-lg font-semibold mb-2">공모전</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  서예 공모전 정보와 참가 방법을 확인하세요
                </p>
                <Button asChild variant="ghost" className="p-0 h-auto">
                  <Link href="/contests">
                    자세히 보기
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              문의 및 연락처
            </h2>
            <p className="text-lg text-muted-foreground">
              동양서예협회에 대한 문의사항이 있으시면 언제든 연락주세요
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  주소
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  서울시 성북구 보문로 57-1,<br />
                  중앙빌딩 6층 (보문동7가)
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  연락처
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  ☎ 0502-5550-8700<br />
                  FAX: 0504-256-6600
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  이메일
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  info@orientalcalligraphy.org
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>고유번호</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  209-82-11380
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
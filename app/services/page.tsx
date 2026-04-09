import { Metadata } from 'next'
import { LayoutFooter } from '@/components/layout/layout-footer'
import {
  Mail,
  Database,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Zap,
  BarChart3,
  Clock,
  Users,
  Building2,
  GraduationCap,
  Landmark,
} from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '서비스 | 사단법인 동양서예협회',
  description:
    '문화예술 단체를 위한 마케팅 자동화, 데이터 파이프라인, AI 챗봇. 엑셀에서 벗어나 디지털 전환을 시작하세요.',
  openGraph: {
    title: '서비스 | 동양서예협회 ASCA',
    description:
      '문화예술 단체의 디지털 전환을 위한 마케팅 자동화, 데이터 파이프라인, AI 챗봇 서비스.',
  },
}

const services = [
  {
    icon: Mail,
    title: '마케팅 자동화',
    headline: '전시 오픈부터 후기 수집까지, 하나의 흐름으로',
    description:
      '전시 홍보, 회원 커뮤니케이션, 수강생 모집을 자동화합니다. 수동 포스팅과 단체 문자 발송에서 벗어나세요.',
    features: [
      '전시 오픈 자동 이메일/카카오 알림',
      '회원 등급별 맞춤 콘텐츠 발송',
      '수강 만료 전 재등록 유도 자동 메시지',
      'VIP 컬렉터 전시 초대 자동화',
      '행사 후 만족도 조사 자동 발송',
    ],
    color: 'celadon-green',
  },
  {
    icon: Database,
    title: '데이터 파이프라인',
    headline: '엑셀 30개를 하나의 대시보드로',
    description:
      '회원, 작가, 작품, 전시 데이터를 통합 관리하고 분석합니다. 흩어진 데이터가 의사결정의 근거가 됩니다.',
    features: [
      '엑셀 회원 데이터 → 통합 DB 마이그레이션',
      '작가별 활동 이력/수상 경력 자동 축적',
      '전시 방문객 데이터 수집 및 트렌드 분석',
      '문화사업 성과 지표 자동 대시보드',
      '회원 이탈 예측 데이터 분석',
    ],
    color: 'scholar-red',
  },
  {
    icon: MessageSquare,
    title: 'AI 챗봇',
    headline: '전시 문의의 80%는 AI가 답합니다',
    description:
      '전시, 강좌, 가입 문의를 24시간 자동 응대합니다. 반복 문의에 묶인 인력을 핵심 업무에 집중시키세요.',
    features: [
      '전시 일정/위치/입장료 문의 자동 응답',
      '수강 신청/수업 시간/수강료 안내',
      '회원 가입 절차 안내 및 서류 접수',
      '작가 공모전 접수 안내',
      '문화행사 참가 신청 접수 자동화',
    ],
    color: 'temple-gold',
  },
]

const painPoints = [
  {
    icon: Users,
    icp: '문화예술 단체/협회',
    pain: '회원 관리가 엑셀과 카카오톡에 의존하고 있진 않으신가요?',
    solution: '통합 회원 DB + 자동 커뮤니케이션으로 누락 없는 관리',
  },
  {
    icon: Building2,
    icp: '갤러리/전시공간',
    pain: '전시 방문객 데이터를 수집하지 못해 마케팅 효과를 모르시나요?',
    solution: '방문객 데이터 자동 수집 + VIP 맞춤 전시 초대',
  },
  {
    icon: GraduationCap,
    icp: '서예/캘리그라피 교육기관',
    pain: '수강 문의에 전화 응대하느라 교육에 집중하기 어려우신가요?',
    solution: 'AI 챗봇 자동 응대 + 수강생 이탈 예측 알림',
  },
  {
    icon: Landmark,
    icp: '지자체/공공기관',
    pain: '문화사업 성과를 데이터로 증명하기 어려우신가요?',
    solution: '자동 성과 대시보드 + 참가자 만족도 분석',
  },
]

const partners = [
  '삼성금융네트웍스',
  '예술의전당',
  '대한검정회',
  '서울특별시',
  '문화체육관광부',
]

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-sm font-medium tracking-widest uppercase text-celadon-green mb-4">
              ASCA Digital Services
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground mb-6 leading-tight">
              문화예술 단체의{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-celadon-green via-scholar-red to-temple-gold">
                디지털 전환
              </span>
              을 함께합니다
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              엑셀과 수작업에서 벗어나세요. 마케팅 자동화, 데이터 파이프라인,
              AI 챗봇으로 협회 운영의 새로운 기준을 만듭니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:info@orientalcalligraphy.org?subject=서비스 문의"
                className="inline-flex items-center justify-center h-14 px-8 text-lg font-medium rounded-lg bg-celadon-green text-rice-paper hover:bg-celadon-green/90 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Zap className="mr-2 h-5 w-5" />
                무료 상담 신청
              </a>
              <Link
                href="/blog/digital-transformation-guide"
                className="inline-flex items-center justify-center h-14 px-8 text-lg font-medium rounded-lg border-2 border-scholar-red text-scholar-red hover:bg-scholar-red hover:text-rice-paper transition-all duration-300"
              >
                디지털 전환 가이드 읽기
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
              세 가지 핵심 서비스
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              문화예술 현장의 실제 문제를 해결하기 위해 설계되었습니다
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {services.map((service) => (
              <div
                key={service.title}
                className="group relative rounded-2xl border border-border/50 bg-card p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div
                  className={`inline-flex items-center justify-center w-14 h-14 rounded-xl mb-6 ${
                    service.color === 'celadon-green'
                      ? 'bg-celadon-green/10 text-celadon-green'
                      : service.color === 'scholar-red'
                        ? 'bg-scholar-red/10 text-scholar-red'
                        : 'bg-temple-gold/10 text-temple-gold'
                  }`}
                >
                  <service.icon className="h-7 w-7" />
                </div>

                <h3 className="text-2xl font-serif font-bold text-foreground mb-2">
                  {service.title}
                </h3>
                <p className="text-base font-medium text-foreground/80 mb-3">
                  {service.headline}
                </p>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {service.description}
                </p>

                <ul className="space-y-3">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-celadon-green mt-0.5 shrink-0" />
                      <span className="text-sm text-foreground/80">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pain Points Section */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
              이런 고민이 있으신가요?
            </h2>
            <p className="text-muted-foreground text-lg">
              각 분야별 가장 많이 겪는 문제와 해결 방법
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {painPoints.map((item) => (
              <div
                key={item.icp}
                className="rounded-2xl border border-border/50 bg-card p-8 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-scholar-red/10 text-scholar-red">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    {item.icp}
                  </span>
                </div>

                <div className="flex items-start gap-3 mb-4">
                  <HelpCircle className="h-5 w-5 text-scholar-red mt-0.5 shrink-0" />
                  <p className="text-foreground font-medium">{item.pain}</p>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-celadon-green mt-0.5 shrink-0" />
                  <p className="text-muted-foreground">{item.solution}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-celadon-green to-celadon-green/80">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
            {[
              { value: '80%', label: '문의 자동 응대율', icon: MessageSquare },
              { value: '24/7', label: '무중단 챗봇 운영', icon: Clock },
              { value: '30+', label: '엑셀 파일 통합 관리', icon: BarChart3 },
              { value: '5,000+', label: '회원 관리 규모', icon: Users },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl md:text-4xl font-bold text-rice-paper mb-1">
                  {stat.value}
                </p>
                <p className="text-rice-paper/70 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-4">
              함께하는 기관
            </h2>
            <p className="text-muted-foreground">
              대한민국 대표 문화예술 기관들이 신뢰합니다
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-8 md:gap-12 max-w-4xl mx-auto">
            {partners.map((partner) => (
              <div
                key={partner}
                className="flex items-center justify-center px-6 py-3 rounded-lg bg-muted/50 text-muted-foreground font-medium text-sm hover:bg-muted transition-colors"
              >
                {partner}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-6">
              디지털 전환, 지금 시작하세요
            </h2>
            <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
              현재 운영 방식과 고민을 공유해 주시면,
              <br />
              협회 상황에 맞는 맞춤 솔루션을 제안드립니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:info@orientalcalligraphy.org?subject=서비스 문의"
                className="inline-flex items-center justify-center h-14 px-10 text-lg font-medium rounded-lg bg-celadon-green text-rice-paper hover:bg-celadon-green/90 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Mail className="mr-2 h-5 w-5" />
                무료 상담 신청
              </a>
              <a
                href="tel:0502-5550-8700"
                className="inline-flex items-center justify-center h-14 px-10 text-lg font-medium rounded-lg border-2 border-foreground/20 text-foreground hover:bg-foreground/5 transition-all duration-300"
              >
                0502-5550-8700
              </a>
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              평일 09:00 - 18:00 | info@orientalcalligraphy.org
            </p>
          </div>
        </div>
      </section>

      <LayoutFooter />
    </div>
  )
}

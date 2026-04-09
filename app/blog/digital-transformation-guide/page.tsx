import { Metadata } from 'next'
import { LayoutFooter } from '@/components/layout/layout-footer'
import Link from 'next/link'
import {
  ArrowRight,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  BarChart3,
  Mail,
  Database,
  MessageSquare,
  Zap,
} from 'lucide-react'

export const metadata: Metadata = {
  title: '문화예술 단체의 디지털 전환 가이드 | ASCA 블로그',
  description:
    '서예협회, 갤러리, 문화센터의 회원관리, 전시홍보, 문의응대를 자동화하는 실전 가이드. 엑셀과 수작업에서 벗어나는 3단계 전략.',
  keywords: [
    '문화예술 단체 디지털 전환',
    '협회 회원관리 자동화',
    '전시회 관리 소프트웨어',
    '사단법인 CRM',
    '문화예술 마케팅 자동화',
  ],
  openGraph: {
    title: '문화예술 단체의 디지털 전환 가이드',
    description:
      '서예협회, 갤러리, 문화센터를 위한 디지털 전환 실전 가이드',
    type: 'article',
  },
}

const tableOfContents = [
  { id: 'current-state', title: '1. 문화예술 단체의 현재' },
  { id: 'three-pillars', title: '2. 디지털 전환의 3가지 축' },
  { id: 'step-by-step', title: '3. 단계별 도입 전략' },
  { id: 'case-study', title: '4. 적용 사례' },
  { id: 'getting-started', title: '5. 시작하는 방법' },
]

export default function DigitalTransformationGuidePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Article Header */}
      <header className="bg-gradient-to-b from-background to-muted/20 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-celadon-green/10 text-celadon-green text-sm font-medium">
                디지털 전환
              </span>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> 8분
              </span>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> 2026.03.29
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-6 leading-tight">
              문화예술 단체의
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-celadon-green to-scholar-red">
                디지털 전환 가이드
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8">
              서예협회, 갤러리, 문화센터가 엑셀과 수작업에서 벗어나
              회원관리, 전시홍보, 문의응대를 자동화하는 실전 전략.
            </p>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-celadon-green/20 flex items-center justify-center">
                <span className="text-sm font-bold text-celadon-green">A</span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">ASCA 디지털팀</p>
                <p className="text-xs text-muted-foreground">동양서예협회</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Article Body */}
      <article className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {/* Table of Contents */}
            <nav className="rounded-xl border border-border/50 bg-card p-6 mb-12">
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">
                목차
              </h2>
              <ol className="space-y-2">
                {tableOfContents.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className="text-muted-foreground hover:text-celadon-green transition-colors"
                    >
                      {item.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            {/* Section 1 */}
            <section id="current-state" className="mb-16">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-6">
                1. 문화예술 단체의 현재
              </h2>

              <p className="text-foreground/80 leading-relaxed mb-6">
                대부분의 문화예술 단체는 아직도 <strong>엑셀, 카카오톡, 네이버 카페</strong>로
                운영됩니다. 회원 명부는 엑셀 파일 수십 개에 흩어져 있고, 전시 홍보는
                블로그에 수동으로 포스팅하며, 문의 전화는 담당자가 직접 받습니다.
              </p>

              <div className="rounded-xl border border-scholar-red/20 bg-scholar-red/5 p-6 mb-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-scholar-red mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-foreground mb-2">흔히 보이는 문제들</p>
                    <ul className="space-y-2 text-foreground/80">
                      <li>- 회원 3,000명의 연락처가 엑셀 파일 30개에 분산</li>
                      <li>- 전시회 참가 신청을 전화와 FAX로 접수</li>
                      <li>- 행사 후 참가자 만족도를 종이 설문으로 수집</li>
                      <li>- 수강 문의 응대에 하루 2~3시간 소모</li>
                      <li>- 지자체 보고서 작성에 매번 데이터를 수기로 집계</li>
                    </ul>
                  </div>
                </div>
              </div>

              <p className="text-foreground/80 leading-relaxed">
                이런 방식은 <strong>담당자 1~2명이 모든 것을 처리하는</strong> 소규모 단체에서
                특히 치명적입니다. 사람이 바뀌면 데이터가 사라지고, 노하우가 단절됩니다.
                디지털 전환은 선택이 아니라 <strong>생존의 문제</strong>입니다.
              </p>
            </section>

            {/* Section 2 */}
            <section id="three-pillars" className="mb-16">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-6">
                2. 디지털 전환의 3가지 축
              </h2>

              <p className="text-foreground/80 leading-relaxed mb-8">
                문화예술 단체의 디지털 전환은 거창한 IT 프로젝트가 아닙니다.
                <strong>가장 시간이 많이 드는 3가지 업무</strong>를 자동화하는 것에서 시작합니다.
              </p>

              <div className="space-y-6">
                {/* Pillar 1 */}
                <div className="rounded-xl border border-border/50 bg-card p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-celadon-green/10 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-celadon-green" />
                    </div>
                    <h3 className="text-xl font-serif font-bold text-foreground">
                      마케팅 자동화
                    </h3>
                  </div>
                  <p className="text-foreground/80 leading-relaxed mb-4">
                    전시가 열리면 자동으로 회원에게 알림이 갑니다.
                    수강 기간이 끝나기 전에 재등록 안내가 발송됩니다.
                    행사가 끝나면 만족도 조사 링크가 전달됩니다.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-celadon-green">
                    <Lightbulb className="h-4 w-4" />
                    <span>효과: 홍보 업무 시간 <strong>70% 절감</strong>, 행사 참여율 <strong>2배</strong> 향상</span>
                  </div>
                </div>

                {/* Pillar 2 */}
                <div className="rounded-xl border border-border/50 bg-card p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-scholar-red/10 flex items-center justify-center">
                      <Database className="h-5 w-5 text-scholar-red" />
                    </div>
                    <h3 className="text-xl font-serif font-bold text-foreground">
                      데이터 파이프라인
                    </h3>
                  </div>
                  <p className="text-foreground/80 leading-relaxed mb-4">
                    엑셀 파일 30개를 하나의 대시보드로 통합합니다.
                    작가의 활동 이력이 자동으로 쌓이고,
                    전시 방문객 추이를 실시간으로 확인할 수 있습니다.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-scholar-red">
                    <Lightbulb className="h-4 w-4" />
                    <span>효과: 보고서 작성 시간 <strong>80% 절감</strong>, 데이터 기반 의사결정</span>
                  </div>
                </div>

                {/* Pillar 3 */}
                <div className="rounded-xl border border-border/50 bg-card p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-temple-gold/10 flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 text-temple-gold" />
                    </div>
                    <h3 className="text-xl font-serif font-bold text-foreground">
                      AI 챗봇
                    </h3>
                  </div>
                  <p className="text-foreground/80 leading-relaxed mb-4">
                    &ldquo;전시 언제까지 하나요?&rdquo; &ldquo;수강료가 얼마인가요?&rdquo;
                    이런 반복 문의의 80%를 AI가 자동으로 답변합니다.
                    담당자는 정말 중요한 상담에만 집중할 수 있습니다.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-temple-gold">
                    <Lightbulb className="h-4 w-4" />
                    <span>효과: 문의 응대 시간 <strong>80% 절감</strong>, 24시간 무중단 응대</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section id="step-by-step" className="mb-16">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-6">
                3. 단계별 도입 전략
              </h2>

              <p className="text-foreground/80 leading-relaxed mb-8">
                한 번에 모든 것을 바꿀 필요는 없습니다.
                <strong>3개월 단위로 하나씩</strong> 도입하는 것을 권장합니다.
              </p>

              <div className="space-y-6">
                {/* Step 1 */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-celadon-green text-rice-paper flex items-center justify-center font-bold text-sm shrink-0">
                      1
                    </div>
                    <div className="w-px h-full bg-border mt-2" />
                  </div>
                  <div className="pb-8">
                    <h3 className="text-lg font-bold text-foreground mb-2">
                      1~3개월: 데이터 통합
                    </h3>
                    <p className="text-foreground/80 leading-relaxed mb-3">
                      가장 먼저 흩어진 데이터를 한곳에 모읍니다. 엑셀 회원 명부를 통합 DB로 마이그레이션하고,
                      작가/작품/전시 정보를 체계적으로 정리합니다.
                    </p>
                    <ul className="space-y-1 text-sm text-foreground/70">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-celadon-green" />
                        회원 엑셀 파일 통합 및 중복 제거
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-celadon-green" />
                        작가별 프로필/이력 DB 구축
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-celadon-green" />
                        기본 대시보드 설정
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-scholar-red text-rice-paper flex items-center justify-center font-bold text-sm shrink-0">
                      2
                    </div>
                    <div className="w-px h-full bg-border mt-2" />
                  </div>
                  <div className="pb-8">
                    <h3 className="text-lg font-bold text-foreground mb-2">
                      4~6개월: 마케팅 자동화
                    </h3>
                    <p className="text-foreground/80 leading-relaxed mb-3">
                      데이터가 정리되면 자동 커뮤니케이션을 설정합니다.
                      전시 알림, 수강 안내, 생일 축하 메시지 등을 자동으로 발송합니다.
                    </p>
                    <ul className="space-y-1 text-sm text-foreground/70">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-celadon-green" />
                        전시 오픈/마감 자동 알림 설정
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-celadon-green" />
                        회원 등급별 맞춤 콘텐츠 발송
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-celadon-green" />
                        행사 후 만족도 조사 자동화
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-temple-gold text-rice-paper flex items-center justify-center font-bold text-sm shrink-0">
                      3
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-2">
                      7~9개월: AI 챗봇 도입
                    </h3>
                    <p className="text-foreground/80 leading-relaxed mb-3">
                      데이터와 자동화가 안정되면 AI 챗봇을 추가합니다.
                      축적된 FAQ 데이터로 챗봇을 학습시켜 정확도를 높입니다.
                    </p>
                    <ul className="space-y-1 text-sm text-foreground/70">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-celadon-green" />
                        FAQ 기반 AI 챗봇 구축
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-celadon-green" />
                        수강 신청/전시 안내 자동 접수
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-celadon-green" />
                        담당자 에스컬레이션 연동
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section id="case-study" className="mb-16">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-6">
                4. 적용 사례
              </h2>

              <div className="rounded-xl border border-celadon-green/20 bg-celadon-green/5 p-8 mb-6">
                <h3 className="text-lg font-bold text-foreground mb-4">
                  동양서예협회 (ASCA) 자체 적용
                </h3>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Before</p>
                    <ul className="space-y-2 text-foreground/80 text-sm">
                      <li>- 회원 5,000명 엑셀 관리</li>
                      <li>- 전시 홍보 네이버 카페 수동 포스팅</li>
                      <li>- 공모전 접수 전화/이메일</li>
                      <li>- 4개국어 콘텐츠 수동 번역/배포</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">After</p>
                    <ul className="space-y-2 text-foreground/80 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-celadon-green mt-0.5 shrink-0" />
                        통합 DB + 실시간 대시보드
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-celadon-green mt-0.5 shrink-0" />
                        전시 오픈 시 자동 4개국어 알림
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-celadon-green mt-0.5 shrink-0" />
                        온라인 접수 + 심사 시스템
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-celadon-green mt-0.5 shrink-0" />
                        AI 챗봇 24시간 문의 응대
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { metric: '70%', desc: '홍보 업무 시간 절감' },
                  { metric: '80%', desc: '문의 자동 응대율' },
                  { metric: '2x', desc: '전시 참여율 향상' },
                ].map((item) => (
                  <div
                    key={item.desc}
                    className="text-center rounded-xl border border-border/50 bg-card p-6"
                  >
                    <p className="text-3xl font-bold text-celadon-green mb-1">{item.metric}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 5 */}
            <section id="getting-started" className="mb-16">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-6">
                5. 시작하는 방법
              </h2>

              <p className="text-foreground/80 leading-relaxed mb-6">
                디지털 전환의 첫걸음은 <strong>현재 상태를 진단</strong>하는 것입니다.
                아래 질문에 3개 이상 해당된다면, 지금이 시작할 때입니다.
              </p>

              <div className="rounded-xl border border-border/50 bg-card p-6 mb-8">
                <h3 className="text-lg font-bold text-foreground mb-4">자가 진단 체크리스트</h3>
                <ul className="space-y-3">
                  {[
                    '회원 연락처가 엑셀 파일 5개 이상에 흩어져 있다',
                    '전시/행사 홍보를 블로그에 수동으로 포스팅한다',
                    '전시 참가 신청을 전화나 이메일로 받는다',
                    '같은 문의(수강료, 일정, 위치)에 하루 5회 이상 답한다',
                    '행사 성과 보고서를 데이터 수기 집계로 작성한다',
                    '담당자가 퇴사하면 회원 정보의 일부가 사라진다',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-foreground/80">
                      <BarChart3 className="h-5 w-5 text-scholar-red mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <p className="text-foreground/80 leading-relaxed">
                동양서예협회는 직접 디지털 전환을 경험하며 쌓은 노하우를 바탕으로,
                비슷한 고민을 가진 문화예술 단체에 <strong>맞춤형 솔루션</strong>을 제공합니다.
              </p>
            </section>

            {/* CTA Box */}
            <div className="rounded-2xl bg-gradient-to-r from-celadon-green to-celadon-green/80 p-8 md:p-10 text-center">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-rice-paper mb-4">
                우리 단체에 맞는 솔루션이 궁금하신가요?
              </h2>
              <p className="text-rice-paper/80 mb-8 max-w-lg mx-auto">
                현재 운영 방식과 고민을 공유해 주시면, 무료로 진단하고 맞춤 방안을 제안드립니다.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:info@orientalcalligraphy.org?subject=디지털 전환 상담 요청"
                  className="inline-flex items-center justify-center h-12 px-8 text-base font-medium rounded-lg bg-rice-paper text-celadon-green hover:bg-rice-paper/90 shadow-lg transition-all duration-300"
                >
                  <Zap className="mr-2 h-5 w-5" />
                  무료 진단 신청
                </a>
                <Link
                  href="/services"
                  className="inline-flex items-center justify-center h-12 px-8 text-base font-medium rounded-lg border-2 border-rice-paper/50 text-rice-paper hover:bg-rice-paper/10 transition-all duration-300"
                >
                  서비스 자세히 보기
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Related Articles */}
            <div className="mt-16 pt-12 border-t border-border/50">
              <h3 className="text-lg font-bold text-foreground mb-6">관련 글</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <Link
                  href="/services"
                  className="rounded-xl border border-border/50 bg-card p-6 hover:shadow-md transition-all group"
                >
                  <p className="text-sm text-celadon-green font-medium mb-2">서비스 안내</p>
                  <p className="font-bold text-foreground group-hover:text-celadon-green transition-colors">
                    ASCA 디지털 서비스 →
                  </p>
                </Link>
                <Link
                  href="/blog"
                  className="rounded-xl border border-border/50 bg-card p-6 hover:shadow-md transition-all group"
                >
                  <p className="text-sm text-scholar-red font-medium mb-2">블로그</p>
                  <p className="font-bold text-foreground group-hover:text-scholar-red transition-colors">
                    더 많은 글 보기 →
                  </p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </article>

      <LayoutFooter />
    </div>
  )
}

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  BrandContainer, 
  BrandSection, 
  BrandHeading, 
  BrandText, 
  BrandCard, 
  BrandGrid,
  BrandSpacer 
} from "@/components/ui/brand-components"
import { 
  Shield, 
  TrendingUp, 
  Users, 
  Award, 
  Target, 
  BarChart3,
  CheckCircle,
  Star,
  Globe,
  Building,
  Briefcase,
  PieChart,
  Calculator,
  Lock,
  ArrowRight,
  Phone,
  Mail,
  MapPin
} from "lucide-react"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/footer"

export default function AboutPage() {
  const stats = [
    { label: "관리 자산", value: "₩1조+", icon: TrendingUp, color: "text-success-green" },
    { label: "고객 만족도", value: "98.5%", icon: Star, color: "text-bronze-primary" },
    { label: "전문 컨설턴트", value: "50+", icon: Users, color: "text-navy-primary" },
    { label: "서비스 경력", value: "15년+", icon: Award, color: "text-forest-primary" }
  ]

  const values = [
    {
      icon: Shield,
      title: "신뢰성",
      description: "고객의 자산을 보호하고 안전한 투자 환경을 제공하는 것이 우리의 최우선 가치입니다.",
      color: "text-navy-primary"
    },
    {
      icon: Target,
      title: "전문성",
      description: "15년 이상의 경험을 바탕으로 한 전문적인 자산관리 노하우를 제공합니다.",
      color: "text-bronze-primary"
    },
    {
      icon: Users,
      title: "맞춤형 서비스",
      description: "각 고객의 상황과 목표에 맞는 개인화된 솔루션을 설계합니다.",
      color: "text-forest-primary"
    },
    {
      icon: TrendingUp,
      title: "지속적 성장",
      description: "장기적인 관점에서 안정적이고 지속가능한 자산 성장을 추구합니다.",
      color: "text-success-green"
    }
  ]

  const services = [
    {
      icon: PieChart,
      title: "포트폴리오 관리",
      description: "개인 맞춤형 투자 전략 수립과 포트폴리오 최적화",
      features: ["리스크 분석", "자산 배분", "성과 모니터링"]
    },
    {
      icon: Building,
      title: "부동산 투자",
      description: "프리미엄 부동산 투자 기회 발굴 및 관리",
      features: ["투자용 부동산", "상업용 부동산", "해외 부동산"]
    },
    {
      icon: Calculator,
      title: "세무 최적화",
      description: "세무 효율성을 극대화하는 전략적 컨설팅",
      features: ["절세 전략", "상속 설계", "법인 구조화"]
    },
    {
      icon: Lock,
      title: "자산 보호",
      description: "다양한 리스크로부터 자산을 보호하는 솔루션",
      features: ["보험 설계", "리스크 헤지", "자산 구조화"]
    }
  ]

  const team = [
    {
      name: "김성호",
      position: "대표이사 / CIO",
      experience: "20년",
      specialty: "포트폴리오 관리, 투자 전략",
      description: "글로벌 투자은행 출신으로 대형 자산관리 경험 보유"
    },
    {
      name: "이미영",
      position: "부동산 투자 본부장",
      experience: "15년",
      specialty: "부동산 투자, 개발 사업",
      description: "국내외 프리미엄 부동산 투자 전문가"
    },
    {
      name: "박준혁",
      position: "세무 컨설팅 본부장",
      experience: "18년",
      specialty: "세무 최적화, 상속 설계",
      description: "Big4 회계법인 출신 세무 전문가"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Header />
      {/* 히어로 섹션 */}
      <BrandSection background="gradient" spacing="xl">
        <BrandContainer variant="wide">
          <div className="text-center text-white">
            <BrandHeading as="h1" size="2xl" align="center" className="text-white mb-6">
              패밀리오피스 S
            </BrandHeading>
            <BrandText size="xl" align="center" className="text-white/90 mb-8 max-w-3xl mx-auto">
              대한민국 상위 1% 자산가를 위한 전문적인 자산관리 및 투자 자문 서비스
            </BrandText>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/contact">
                  <Phone className="h-5 w-5 mr-2" />
                  상담 신청
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-navy-primary" asChild>
                <Link href="/services">
                  <Briefcase className="h-5 w-5 mr-2" />
                  서비스 보기
                </Link>
              </Button>
            </div>
          </div>
        </BrandContainer>
      </BrandSection>

      {/* 통계 섹션 */}
      <BrandSection background="default" spacing="lg">
        <BrandContainer>
          <BrandGrid cols={4} gap="lg">
            {stats.map((stat, index) => (
              <BrandCard key={index} variant="glass" padding="lg">
                <div className="text-center">
                  <div className={`inline-flex p-3 rounded-full bg-muted/20 mb-4`}>
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                  <div className="text-3xl font-bold text-foreground mb-2">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              </BrandCard>
            ))}
          </BrandGrid>
        </BrandContainer>
      </BrandSection>

      {/* 회사 소개 */}
      <BrandSection background="muted" spacing="xl">
        <BrandContainer variant="narrow">
          <div className="text-center mb-12">
            <BrandHeading as="h2" size="xl" color="brand" align="center">
              신뢰할 수 있는 자산관리 파트너
            </BrandHeading>
            <BrandSpacer size="md" />
            <BrandText size="lg" color="muted" align="center">
              패밀리오피스 S는 2009년 설립 이래 대한민국 최고 수준의 자산관리 서비스를 제공해왔습니다.
            </BrandText>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <BrandHeading as="h3" size="lg" color="navy" className="mb-6">
                우리의 미션
              </BrandHeading>
              <BrandText className="mb-6">
                고객의 소중한 자산을 보호하고 성장시키는 것이 우리의 사명입니다. 
                단순한 투자 수익을 넘어서 고객의 인생 목표와 가치를 실현할 수 있도록 
                전문적이고 신뢰할 수 있는 서비스를 제공합니다.
              </BrandText>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-success-green" />
                  <span className="text-sm">개인 맞춤형 투자 전략 수립</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-success-green" />
                  <span className="text-sm">투명하고 신뢰할 수 있는 운용</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-success-green" />
                  <span className="text-sm">장기적 관점의 자산 성장</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-success-green" />
                  <span className="text-sm">24/7 전담 컨설턴트 서비스</span>
                </div>
              </div>
            </div>
            <div>
              <BrandCard variant="elevated" padding="lg">
                <BrandHeading as="h4" size="md" color="bronze" className="mb-4">
                  성과 지표
                </BrandHeading>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>연평균 수익률</span>
                      <span className="font-semibold text-success-green">12.8%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>고객 유지율</span>
                      <span className="font-semibold text-bronze-primary">96.2%</span>
                    </div>
                    <Progress value={96} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>리스크 관리 효율성</span>
                      <span className="font-semibold text-navy-primary">94.5%</span>
                    </div>
                    <Progress value={94} className="h-2" />
                  </div>
                </div>
              </BrandCard>
            </div>
          </div>
        </BrandContainer>
      </BrandSection>

      {/* 핵심 가치 */}
      <BrandSection background="default" spacing="xl">
        <BrandContainer>
          <div className="text-center mb-12">
            <BrandHeading as="h2" size="xl" color="brand" align="center">
              핵심 가치
            </BrandHeading>
            <BrandSpacer size="md" />
            <BrandText size="lg" color="muted" align="center">
              우리가 추구하는 가치와 원칙입니다.
            </BrandText>
          </div>

          <BrandGrid cols={2} gap="lg">
            {values.map((value, index) => (
              <BrandCard key={index} variant="glass" padding="lg">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg bg-muted/20`}>
                    <value.icon className={`h-6 w-6 ${value.color}`} />
                  </div>
                  <div className="flex-1">
                    <BrandHeading as="h3" size="md" className="mb-3">
                      {value.title}
                    </BrandHeading>
                    <BrandText color="muted" size="sm">
                      {value.description}
                    </BrandText>
                  </div>
                </div>
              </BrandCard>
            ))}
          </BrandGrid>
        </BrandContainer>
      </BrandSection>

      {/* 주요 서비스 */}
      <BrandSection background="muted" spacing="xl">
        <BrandContainer>
          <div className="text-center mb-12">
            <BrandHeading as="h2" size="xl" color="brand" align="center">
              주요 서비스
            </BrandHeading>
            <BrandSpacer size="md" />
            <BrandText size="lg" color="muted" align="center">
              전문적이고 포괄적인 자산관리 서비스를 제공합니다.
            </BrandText>
          </div>

          <BrandGrid cols={2} gap="lg">
            {services.map((service, index) => (
              <BrandCard key={index} variant="elevated" padding="lg">
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-navy-primary/10">
                    <service.icon className="h-6 w-6 text-navy-primary" />
                  </div>
                  <div className="flex-1">
                    <BrandHeading as="h3" size="md" className="mb-2">
                      {service.title}
                    </BrandHeading>
                    <BrandText color="muted" size="sm">
                      {service.description}
                    </BrandText>
                  </div>
                </div>
                <div className="space-y-2">
                  {service.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-bronze-primary" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </BrandCard>
            ))}
          </BrandGrid>

          <div className="text-center mt-8">
            <Button size="lg" asChild>
              <Link href="/services">
                모든 서비스 보기
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </Button>
          </div>
        </BrandContainer>
      </BrandSection>

      {/* 전문 팀 */}
      <BrandSection background="default" spacing="xl">
        <BrandContainer>
          <div className="text-center mb-12">
            <BrandHeading as="h2" size="xl" color="brand" align="center">
              전문 팀
            </BrandHeading>
            <BrandSpacer size="md" />
            <BrandText size="lg" color="muted" align="center">
              풍부한 경험과 전문성을 갖춘 최고의 전문가들이 함께합니다.
            </BrandText>
          </div>

          <BrandGrid cols={3} gap="lg">
            {team.map((member, index) => (
              <BrandCard key={index} variant="glass" padding="lg">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-brand mx-auto mb-4 flex items-center justify-center">
                    <span className="text-white text-xl font-bold">
                      {member.name.charAt(0)}
                    </span>
                  </div>
                  <BrandHeading as="h3" size="md" className="mb-1">
                    {member.name}
                  </BrandHeading>
                  <BrandText color="bronze" size="sm" weight="medium" className="mb-2">
                    {member.position}
                  </BrandText>
                  <div className="flex items-center justify-center gap-4 mb-3">
                    <Badge variant="outline" className="text-xs">
                      경력 {member.experience}
                    </Badge>
                  </div>
                  <BrandText size="xs" color="muted" className="mb-3">
                    전문분야: {member.specialty}
                  </BrandText>
                  <BrandText size="xs" color="muted">
                    {member.description}
                  </BrandText>
                </div>
              </BrandCard>
            ))}
          </BrandGrid>
        </BrandContainer>
      </BrandSection>

      {/* 연락처 및 CTA */}
      <BrandSection background="gradient" spacing="xl">
        <BrandContainer variant="narrow">
          <div className="text-center text-white">
            <BrandHeading as="h2" size="xl" align="center" className="text-white mb-6">
              지금 시작하세요
            </BrandHeading>
            <BrandText size="lg" align="center" className="text-white/90 mb-8">
              전문 컨설턴트와의 무료 상담을 통해 맞춤형 자산관리 전략을 수립해보세요.
            </BrandText>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="inline-flex p-3 rounded-full bg-white/20 mb-3">
                  <Phone className="h-6 w-6 text-white" />
                </div>
                <div className="text-white font-medium">전화 상담</div>
                <div className="text-white/80 text-sm">02-1234-5678</div>
              </div>
              <div className="text-center">
                <div className="inline-flex p-3 rounded-full bg-white/20 mb-3">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <div className="text-white font-medium">이메일 문의</div>
                <div className="text-white/80 text-sm">info@familyoffice-s.com</div>
              </div>
              <div className="text-center">
                <div className="inline-flex p-3 rounded-full bg-white/20 mb-3">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <div className="text-white font-medium">오피스 방문</div>
                <div className="text-white/80 text-sm">서울 강남구 테헤란로</div>
              </div>
            </div>

            <Button size="lg" variant="secondary">
              <Link href="/contact">
                무료 상담 신청하기
              </Link>
            </Button>
          </div>
        </BrandContainer>
      </BrandSection>
      <Footer />
    </div>
  )
} 
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ServiceCard } from "@/components/service-card"
import { SERVICES_DATA } from "@/lib/constants"
import Link from "next/link"
import Image from "next/image"
import type { Metadata } from "next"

// 페이지별 메타데이터
export const metadata: Metadata = {
  title: "중소중견기업 법인 대표 전용 자산관리",
  description: "비상장기업, 기술기업, 제조업 등 다양한 업종 법인 대표를 위한 프리미엄 자산관리. 정책자금부터 단체보험, 중대재해처벌법 대응, 기업재해보장보험까지 5조원+ 관리 실적의 FamilyOffice S",
  keywords: "중소중견기업 자산관리, 제조업 자산관리, 경영인정기보험, 중대재해처벌법, 기업재해보장보험, 위험업종 리스크 관리, 기업 임원보험, CEO 정기보험, 패밀리오피스 요금, 자산관리 수수료, 패밀리오피스 비용, 중소중견기업 자산관리 비용",
  openGraph: {
    title: "FamilyOffice S | 중소중견기업 법인 대표 전용 자산관리",
    description: "비상장기업, 기술기업, 제조업 등 다양한 업종 법인 대표를 위한 프리미엄 자산관리. 중대재해처벌법 대응까지",
    url: "https://familyoffices.vip",
    images: [
      {
        url: "/og-image-home.jpg",
        width: 1200,
        height: 630,
        alt: "FamilyOffice S - 중소중견기업 법인 대표 전용 자산관리"
      }
    ]
  }
}

export default function HomePage() {
  return (
    <div className="min-h-screen font-body text-navy-primary dark:text-white overflow-hidden">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-20 md:pb-32 min-h-screen flex items-center overflow-hidden" itemScope itemType="https://schema.org/FinancialService">
        {/* 애니메이션 그라데이션 배경 */}
        <div className="absolute inset-0 animated-gradient-bg" />
        
        {/* 가독성을 위한 강화된 오버레이 */}
        <div className="absolute inset-0 bg-navy-primary/70" />
        
        {/* 배경 이미지 */}
        <div className="absolute inset-0 opacity-10">
          <Image
            src="/placeholder.svg?height=800&width=1920"
            alt="대한민국 최고의 패밀리오피스 럭셔리 배경"
            className="w-full h-full object-cover"
            width={1920}
            height={800}
            priority
          />
        </div>
        
        {/* 파티클 효과 */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 md:w-2 md:h-2 bg-bronze-primary/20 rounded-full animate-pulse-soft"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-4xl animate-slide-up">
            {/* 메인 타이틀 - SEO 최적화된 H1 */}
            <h1 className="font-heading text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-6 md:mb-8 text-white leading-tight drop-shadow-lg" itemProp="name">
              <span className="text-bronze-primary drop-shadow-lg">중소중견기업 법인 대표</span>를 위한
              <br />
              프리미엄 <span className="text-bronze-primary drop-shadow-lg" itemProp="alternateName">FamilyOffice S</span>
            </h1>
            
            {/* 서브 타이틀 - 키워드 최적화 */}
            <p className="text-lg sm:text-xl md:text-2xl text-white/95 mb-8 md:mb-12 leading-relaxed drop-shadow-md" itemProp="description">
              <span className="text-bronze-200 font-semibold drop-shadow-md">비상장·기술·제조업 등 다양한 업종</span> 법인 대표님의 전문 파트너
              <br className="hidden sm:block" />
              자산관리부터 중대재해처벌법 대응, 기업재해보장보험까지 <span className="text-bronze-200 drop-shadow-md">통합 솔루션</span>
            </p>
            
            {/* CTA 버튼들 */}
            <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
              <Link
                href="/services"
                className="group relative bg-forest-primary hover:bg-forest-600 text-white px-8 md:px-10 py-4 md:py-5 rounded-xl md:rounded-2xl shadow-forest hover:shadow-forest-hover hover:scale-105 transition-fo font-semibold text-base md:text-lg overflow-hidden text-center"
                title="FamilyOffice S 자산관리 서비스 상세보기"
              >
                <span className="relative z-10">서비스 알아보기</span>
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full"
                  style={{ transition: 'transform 0.7s cubic-bezier(0.19, 1, 0.22, 1)' }}
                />
              </Link>
              
              <Link
                href="/contact"
                className="group glass-card hover:glass text-white hover:text-navy-primary px-8 md:px-10 py-4 md:py-5 rounded-xl md:rounded-2xl hover:scale-105 transition-fo font-semibold text-base md:text-lg border border-white/20 hover:border-bronze-primary/50 relative overflow-hidden text-center"
                title="FamilyOffice S 무료 자산관리 상담 신청"
              >
                <span className="relative z-10">무료 상담 신청</span>
                <div className="absolute inset-0 bg-gradient-bronze opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
              </Link>
            </div>
          </div>
        </div>

        {/* 구조화된 데이터 마이크로데이터 */}
        <meta itemProp="serviceType" content="자산관리, 상속설계, 투자자문, 재무설계, 세무최적화" />
        <meta itemProp="areaServed" content="대한민국" />
        <meta itemProp="priceRange" content="프리미엄" />
      </section>

      {/* 서비스 소개 */}
      <section className="py-16 md:py-24 relative" itemScope itemType="https://schema.org/Service">
        {/* 배경 그라데이션 */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50/50 to-white dark:from-navy-primary dark:via-navy-dark/50 dark:to-navy-primary" />
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          {/* 섹션 헤더 */}
          <div className="text-center mb-12 md:mb-20">
            <div className="inline-block glass-card px-4 md:px-6 py-2 md:py-3 rounded-full mb-4 md:mb-6">
              <span className="text-gradient-brand font-semibold text-sm md:text-base">Premium Services</span>
            </div>
            
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold mb-6 md:mb-8" itemProp="name">
              <span className="text-navy-primary dark:text-white">FamilyOffice S</span> 서비스
            </h2>
            
            <p className="text-lg md:text-xl lg:text-2xl max-w-4xl mx-auto text-gray-600 dark:text-gray-300 leading-relaxed px-2" itemProp="description">
              자산가와 기업 오너를 위한 통합적인 자산관리 솔루션
            </p>
          </div>

          {/* 서비스 카드 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16">
            {SERVICES_DATA.map((service, index) => (
              <div 
                key={service.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 200}ms` }}
                itemScope 
                itemType="https://schema.org/FinancialProduct"
              >
                <ServiceCard
                  icon={service.icon}
                  title={service.title}
                  description={service.description}
                  href={service.href}
                />
                <meta itemProp="name" content={service.title} />
                <meta itemProp="description" content={service.description} />
              </div>
            ))}
          </div>

          {/* 더보기 버튼 */}
          <div className="text-center">
            <Link
              href="/services"
              className="group inline-flex items-center glass-card hover:glass px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl hover:scale-105 transition-fo font-semibold text-base md:text-lg border border-white/20 hover:border-bronze-primary/50 relative overflow-hidden"
              title="FamilyOffice S 모든 자산관리 서비스 보기"
            >
              <span className="relative z-10 text-navy-primary dark:text-white group-hover:text-forest-primary dark:group-hover:text-bronze-primary transition-fo">
                모든 서비스 보기
              </span>
              
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="ml-2 md:ml-3 group-hover:translate-x-1 transition-transform duration-300"
                aria-hidden="true"
              >
                <path
                  d="M5 12H19M19 12L12 5M19 12L12 19"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              
              <div className="absolute inset-0 bg-gradient-bronze opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
            </Link>
          </div>
        </div>
      </section>

      {/* 신뢰도 & 사회적 증명 섹션 */}
      <section className="py-16 md:py-24 bg-gray-50 dark:bg-navy-dark/50 relative" itemScope itemType="https://schema.org/Organization">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-block glass-card px-4 md:px-6 py-2 md:py-3 rounded-full mb-4 md:mb-6">
              <span className="text-gradient-brand font-semibold text-sm md:text-base">Trusted by Leaders</span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold mb-6 md:mb-8 text-navy-primary dark:text-white">
              중소중견기업 법인 대표들의 <span className="text-bronze-primary">통합 파트너</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16">
            {/* 경험 연수 */}
            <div className="text-center glass-card p-6 md:p-8 hover:scale-105 transition-fo" itemScope itemType="https://schema.org/Offer">
              <div className="text-4xl md:text-5xl font-bold text-gradient-gold mb-3 md:mb-4" itemProp="validFrom">20+</div>
              <h3 className="text-lg md:text-xl font-semibold mb-2 text-navy-primary dark:text-white">년의 중소중견기업 전문성</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base">다양한 업종별 특성을 이해하는<br />자산관리부터 보험설계까지 원스톱 노하우</p>
            </div>

            {/* 관리 자산 규모 */}
            <div className="text-center glass-card p-6 md:p-8 hover:scale-105 transition-fo">
              <div className="text-4xl md:text-5xl font-bold text-gradient-gold mb-3 md:mb-4">5조+</div>
              <h3 className="text-lg md:text-xl font-semibold mb-2 text-navy-primary dark:text-white">관리자산 규모</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base">비상장·기술·제조업 등 다양한 업종<br />중소중견기업 법인들의 신뢰받는 파트너</p>
            </div>

            {/* 고객 만족도 */}
            <div className="text-center glass-card p-6 md:p-8 hover:scale-105 transition-fo" itemScope itemType="https://schema.org/AggregateRating">
              <div className="text-4xl md:text-5xl font-bold text-gradient-gold mb-3 md:mb-4" itemProp="ratingValue">99%</div>
              <h3 className="text-lg md:text-xl font-semibold mb-2 text-navy-primary dark:text-white">법인 대표 만족도</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base">자산관리부터 경영인정기보험까지<br />평균 12년+ 통합적 파트너십</p>
              <meta itemProp="bestRating" content="100" />
              <meta itemProp="reviewCount" content="150" />
            </div>
          </div>

          {/* 자격증명 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 items-center opacity-60">
            <div className="text-center p-3 md:p-4">
              <div className="bg-gradient-to-r from-navy-primary to-forest-primary text-white px-3 md:px-4 py-2 rounded-lg font-semibold text-xs md:text-sm">
                금융위원회 인가
              </div>
            </div>
            <div className="text-center p-3 md:p-4">
              <div className="bg-gradient-to-r from-bronze-primary to-forest-primary text-white px-3 md:px-4 py-2 rounded-lg font-semibold text-xs md:text-sm">
                자산관리 전문기관
              </div>
            </div>
            <div className="text-center p-3 md:p-4">
              <div className="bg-gradient-to-r from-forest-primary to-navy-primary text-white px-3 md:px-4 py-2 rounded-lg font-semibold text-xs md:text-sm">
                신탁업 허가
              </div>
            </div>
            <div className="text-center p-3 md:p-4">
              <div className="bg-gradient-to-r from-navy-primary to-bronze-primary text-white px-3 md:px-4 py-2 rounded-lg font-semibold text-xs md:text-sm">
                ISO 27001 인증
              </div>
            </div>
          </div>
        </div>

        {/* 회사 정보 마이크로데이터 */}
        <meta itemProp="name" content="FamilyOffice S" />
        <meta itemProp="foundingDate" content="2008" />
        <meta itemProp="numberOfEmployees" content="50-100" />
      </section>

      {/* 서비스 프로세스 섹션 */}
      <section className="py-16 md:py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50/50 to-white dark:from-navy-primary dark:via-navy-dark/50 dark:to-navy-primary" />
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-block glass-card px-4 md:px-6 py-2 md:py-3 rounded-full mb-4 md:mb-6">
              <span className="text-gradient-brand font-semibold text-sm md:text-base">Simple Process</span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold mb-6 md:mb-8 text-navy-primary dark:text-white">
              <span className="text-bronze-primary">3단계</span>로 시작하는 맞춤형 자산관리
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16">
            {/* 1단계 */}
            <div className="text-center group" itemScope itemType="https://schema.org/HowToStep">
              <div className="glass-card p-6 md:p-8 hover:scale-105 transition-fo relative">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-forest-primary to-forest-600 text-white rounded-full flex items-center justify-center text-lg md:text-2xl font-bold mx-auto mb-4 md:mb-6">
                  1
                </div>
                <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-navy-primary dark:text-white" itemProp="name">무료 상담 신청</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm md:text-base" itemProp="text">
                  간단한 정보 입력으로 전문가와의 개별 상담을 예약하세요. 귀하의 자산 현황과 목표를 파악합니다.
                </p>
              </div>
            </div>

            {/* 2단계 */}
            <div className="text-center group" itemScope itemType="https://schema.org/HowToStep">
              <div className="glass-card p-6 md:p-8 hover:scale-105 transition-fo relative">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-forest-primary to-forest-600 text-white rounded-full flex items-center justify-center text-lg md:text-2xl font-bold mx-auto mb-4 md:mb-6">
                  2
                </div>
                <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-navy-primary dark:text-white" itemProp="name">맞춤 전략 수립</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm md:text-base" itemProp="text">
                  자산 분석을 통해 귀하만의 맞춤형 자산관리 전략을 수립하고 상세한 실행 계획을 제안합니다.
                </p>
              </div>
            </div>

            {/* 3단계 */}
            <div className="text-center group" itemScope itemType="https://schema.org/HowToStep">
              <div className="glass-card p-6 md:p-8 hover:scale-105 transition-fo relative">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-forest-primary to-forest-600 text-white rounded-full flex items-center justify-center text-lg md:text-2xl font-bold mx-auto mb-4 md:mb-6">
                  3
                </div>
                <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-navy-primary dark:text-white" itemProp="name">지속적 관리</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm md:text-base" itemProp="text">
                  정기적인 모니터링과 리포팅을 통해 자산의 성장을 관리하고 변화하는 환경에 맞춰 전략을 조정합니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ 섹션 */}
      <section className="py-16 md:py-24 bg-gray-50 dark:bg-navy-dark/50 relative" itemScope itemType="https://schema.org/FAQPage">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-block glass-card px-4 md:px-6 py-2 md:py-3 rounded-full mb-4 md:mb-6">
              <span className="text-gradient-brand font-semibold text-sm md:text-base">Frequently Asked</span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold mb-6 md:mb-8 text-navy-primary dark:text-white">
              자주 묻는 <span className="text-bronze-primary">질문</span>
            </h2>
          </div>

          <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
            {/* FAQ 항목들 */}
            <div className="glass-card p-4 md:p-6 hover:scale-[1.01] transition-fo" itemScope itemType="https://schema.org/Question">
              <h3 className="text-base md:text-lg font-semibold mb-2 md:mb-3 text-navy-primary dark:text-white" itemProp="name">
                최소 자산 규모 기준이 있나요?
              </h3>
              <div itemScope itemType="https://schema.org/Answer" itemProp="acceptedAnswer">
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm md:text-base" itemProp="text">
                  FamilyOffice S는 10억원 이상의 금융자산을 보유하신 고객분들을 대상으로 서비스를 제공합니다. 
                  단, 개별 상황에 따라 유연하게 검토하므로 상담을 통해 확인해보시기 바랍니다.
                </p>
              </div>
            </div>

            <div className="glass-card p-4 md:p-6 hover:scale-[1.01] transition-fo" itemScope itemType="https://schema.org/Question">
              <h3 className="text-base md:text-lg font-semibold mb-2 md:mb-3 text-navy-primary dark:text-white" itemProp="name">
                수수료 구조는 어떻게 되나요?
              </h3>
              <div itemScope itemType="https://schema.org/Answer" itemProp="acceptedAnswer">
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm md:text-base" itemProp="text">
                  투명한 수수료 구조로 자산 규모와 서비스 범위에 따라 차등 적용됩니다. 
                  첫 상담에서 귀하의 상황에 맞는 맞춤형 수수료 체계를 상세히 안내해드립니다.
                </p>
              </div>
            </div>

            <div className="glass-card p-4 md:p-6 hover:scale-[1.01] transition-fo" itemScope itemType="https://schema.org/Question">
              <h3 className="text-base md:text-lg font-semibold mb-2 md:mb-3 text-navy-primary dark:text-white" itemProp="name">
                상속·증여 설계 서비스가 포함되나요?
              </h3>
              <div itemScope itemType="https://schema.org/Answer" itemProp="acceptedAnswer">
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm md:text-base" itemProp="text">
                  네, 상속·증여 설계는 패밀리오피스의 핵심 서비스 중 하나입니다. 
                  세무 전문가, 변호사 등과 협업하여 최적의 승계 전략을 수립해드립니다.
                </p>
              </div>
            </div>

            <div className="glass-card p-4 md:p-6 hover:scale-[1.01] transition-fo" itemScope itemType="https://schema.org/Question">
              <h3 className="text-base md:text-lg font-semibold mb-2 md:mb-3 text-navy-primary dark:text-white" itemProp="name">
                해외 자산 관리도 가능한가요?
              </h3>
              <div itemScope itemType="https://schema.org/Answer" itemProp="acceptedAnswer">
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm md:text-base" itemProp="text">
                  글로벌 네트워크를 통해 해외 부동산, 해외 금융상품 등 다양한 해외 자산의 관리와 
                  국제 세무 자문 서비스를 제공합니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 고객 증언 섹션 */}
      <section className="py-16 md:py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50/30 to-white dark:from-navy-primary dark:via-navy-dark/30 dark:to-navy-primary" />
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-block glass-card px-4 md:px-6 py-2 md:py-3 rounded-full mb-4 md:mb-6">
              <span className="text-gradient-brand font-semibold text-sm md:text-base">Success Stories</span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold mb-6 md:mb-8 text-navy-primary dark:text-white">
              중소중견기업 법인 대표들이 직접 들려주는 <span className="text-bronze-primary">성공 스토리</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16">
            {/* 고객 증언 1 - 제조업 */}
            <div className="glass-card p-6 md:p-8 hover:scale-105 transition-fo">
              <div className="mb-4 md:mb-6">
                <div className="flex items-center mb-3 md:mb-4">
                  <div className="flex text-bronze-primary text-lg">
                    ★★★★★
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm md:text-base italic">
                  "매출 180억 규모 제조업체를 운영하면서 <strong className="text-navy-primary dark:text-white">산업재해 리스크와 경영진 보험설계</strong>를 체계적으로 관리했습니다. 
                  개인 자산관리부터 법인 단체보험까지 통합 솔루션이 정말 만족스럽습니다."
                </p>
              </div>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-navy-primary to-forest-primary rounded-full flex items-center justify-center text-white font-bold mr-4">
                  김
                </div>
                <div>
                  <div className="font-semibold text-navy-primary dark:text-white">김○○ 대표</div>
                  <div className="text-gray-500 dark:text-gray-400 text-sm">제조업체 (매출 180억)</div>
                </div>
              </div>
            </div>

            {/* 고객 증언 2 - 기술기업 */}
            <div className="glass-card p-6 md:p-8 hover:scale-105 transition-fo">
              <div className="mb-4 md:mb-6">
                <div className="flex items-center mb-3 md:mb-4">
                  <div className="flex text-bronze-primary text-lg">
                    ★★★★★
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm md:text-base italic">
                  "벤처기업 인증을 받은 IT 기업으로 <strong className="text-navy-primary dark:text-white">정책자금 활용과 핵심인재 보험설계</strong>를 
                  동시에 진행했습니다. 경영진 정기보험부터 개인 자산관리까지 원스톱으로 해결됐습니다."
                </p>
              </div>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-forest-primary to-bronze-primary rounded-full flex items-center justify-center text-white font-bold mr-4">
                  박
                </div>
                <div>
                  <div className="font-semibold text-navy-primary dark:text-white">박○○ 대표</div>
                  <div className="text-gray-500 dark:text-gray-400 text-sm">벤처기업 IT 기업 (매출 85억)</div>
                </div>
              </div>
            </div>

            {/* 고객 증언 3 - 건설업 */}
            <div className="glass-card p-6 md:p-8 hover:scale-105 transition-fo">
              <div className="mb-4 md:mb-6">
                <div className="flex items-center mb-3 md:mb-4">
                  <div className="flex text-bronze-primary text-lg">
                    ★★★★★
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm md:text-base italic">
                  "건설업 매출 280억 달성 후 <strong className="text-navy-primary dark:text-white">위험업종 특화 단체보험과 경영인정기보험</strong>을 
                  맞춤 설계했습니다. 업종별 리스크를 정확히 이해하고 최적의 솔루션을 제공해주십니다."
                </p>
              </div>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-bronze-primary to-navy-primary rounded-full flex items-center justify-center text-white font-bold mr-4">
                  이
                </div>
                <div>
                  <div className="font-semibold text-navy-primary dark:text-white">이○○ 대표</div>
                  <div className="text-gray-500 dark:text-gray-400 text-sm">건설업체 (매출 280억)</div>
                </div>
              </div>
            </div>
          </div>

          {/* 성과 통계 */}
          <div className="text-center">
            <div className="inline-block glass-card px-6 md:px-8 py-4 md:py-6">
              <div className="grid grid-cols-3 gap-6 md:gap-8">
                <div>
                  <div className="text-2xl md:text-3xl font-bold text-bronze-primary mb-1">300+</div>
                  <div className="text-gray-600 dark:text-gray-300 text-xs md:text-sm">중소중견기업 법인 고객</div>
                </div>
                <div>
                  <div className="text-2xl md:text-3xl font-bold text-bronze-primary mb-1">평균 12년</div>
                  <div className="text-gray-600 dark:text-gray-300 text-xs md:text-sm">통합 파트너십</div>
                </div>
                <div>
                  <div className="text-2xl md:text-3xl font-bold text-bronze-primary mb-1">99%</div>
                  <div className="text-gray-600 dark:text-gray-300 text-xs md:text-sm">법인 대표 만족도</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA 섹션 - 급박감과 희소성 */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-navy-primary via-forest-primary to-navy-primary text-white overflow-hidden" itemScope itemType="https://schema.org/Offer">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            {/* 희소성 강조 */}
            <div className="inline-block bg-bronze-primary/20 backdrop-blur-sm border border-bronze-primary/30 rounded-full px-4 md:px-6 py-2 md:py-3 mb-6 md:mb-8">
              <span className="text-bronze-200 font-semibold text-sm md:text-base" itemProp="availability">⚡ 매월 기술기업 대표 5분만 신규 파트너십 가능</span>
            </div>
            
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold mb-6 md:mb-8 text-white leading-tight">
              중소중견기업 대표님만을 위한 <span className="text-bronze-primary">특별 혜택</span>
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-white/95 mb-8 md:mb-12 leading-relaxed">
                              자산관리부터 <span className="text-bronze-200 font-semibold">중대재해처벌법 대응</span>까지 
                <br className="hidden sm:block" />
                통합 솔루션을 <span className="text-bronze-200 font-semibold">무료 컨설팅</span>으로 만나보세요
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16">
              {/* 혜택 1 */}
              <div className="text-center glass-card p-6 md:p-8 hover:scale-105 transition-fo">
                <div className="text-3xl md:text-4xl font-bold text-bronze-primary mb-3 md:mb-4">5억원</div>
                <h3 className="text-lg md:text-xl font-semibold mb-2 text-white">경영인정기보험</h3>
                <p className="text-white/90 text-sm md:text-base">맞춤형 CEO 보장설계<br />임원진 생명보험 최적화</p>
              </div>

              {/* 혜택 2 */}
              <div className="text-center glass-card p-6 md:p-8 hover:scale-105 transition-fo">
                <div className="text-3xl md:text-4xl font-bold text-bronze-primary mb-3 md:mb-4">3억원</div>
                <h3 className="text-lg md:text-xl font-semibold mb-2 text-white">중대재해처벌법 대응</h3>
                <p className="text-white/90 text-sm md:text-base">기업재해보장보험 설계<br />안전관리체계 구축</p>
              </div>

              {/* 혜택 3 */}
              <div className="text-center glass-card p-6 md:p-8 hover:scale-105 transition-fo">
                <div className="text-3xl md:text-4xl font-bold text-bronze-primary mb-3 md:mb-4">10억원</div>
                <h3 className="text-lg md:text-xl font-semibold mb-2 text-white">통합 자산관리</h3>
                <p className="text-white/90 text-sm md:text-base">개인·법인 자산 분리<br />세무최적화·승계 설계</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

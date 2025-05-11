import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import Image from "next/image"

export default function ServicePage() {
  return (
    <div className="min-h-screen font-body text-navy-primary dark:text-white">
      <Header />

      {/* 페이지 헤더 */}
      <section className="relative py-24 bg-navy-primary overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <Image
            src="/placeholder.svg?height=600&width=1920"
            alt="럭셔리 오피스 인테리어"
            className="w-full h-full object-cover"
            width={1920}
            height={600}
          />
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <h1 className="font-heading text-4xl md:text-5xl font-bold mb-6 text-white">통합적인 자산관리 서비스</h1>
            <p className="text-xl text-white/80 mb-8">
              자산 가치의 보존과 성장, 세대를 넘어선 자산 이전까지
              <br />
              대한민국 상위 1% 자산가를 위한 맞춤형 솔루션
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="#wealth-management"
                className="px-5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-sm transition-all"
              >
                통합 자산관리
              </Link>
              <Link
                href="#inheritance"
                className="px-5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-sm transition-all"
              >
                상속·증여 설계
              </Link>
              <Link
                href="#tax-legal"
                className="px-5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-sm transition-all"
              >
                세무·법률 자문
              </Link>
              <Link
                href="#real-estate"
                className="px-5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-sm transition-all"
              >
                부동산 포트폴리오
              </Link>
              <Link
                href="#business-succession"
                className="px-5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-sm transition-all"
              >
                가업승계
              </Link>
              <Link
                href="#global-assets"
                className="px-5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-sm transition-all"
              >
                해외 자산 관리
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 서비스 개요 */}
      <section className="py-20 bg-light-bg-primary dark:bg-dark-bg-primary">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-heading text-3xl font-bold mb-8 text-center">패밀리오피스 VIP 서비스</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-12 text-center">
              자산가와 기업 오너를 위한 통합적인 자산관리 솔루션을 제공합니다.
              <br />각 분야 최고 전문가들이 맞춤형 서비스로 귀하의 자산과 가문의 번영을 지원합니다.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-gold-primary/10 flex items-center justify-center mb-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                      stroke="#C9B037"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path d="M12 8V16" stroke="#C9B037" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M8 12H16" stroke="#C9B037" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3 className="font-heading text-xl font-semibold mb-2">통합적 접근</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  자산 전체를 아우르는 종합적인 관점에서 자산관리 전략을 수립합니다.
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-gold-primary/10 flex items-center justify-center mb-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M22 12H18L15 21L9 3L6 12H2"
                      stroke="#C9B037"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h3 className="font-heading text-xl font-semibold mb-2">맞춤형 솔루션</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  고객의 자산 구조와 니즈에 따른 맞춤형 전략과 서비스를 제공합니다.
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-gold-primary/10 flex items-center justify-center mb-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M9 5H7C6.46957 5 5.96086 5.21071 5.58579 5.58579C5.21071 5.96086 5 6.46957 5 7V19C5 19.5304 5.21071 20.0391 5.58579 20.4142C5.96086 20.7893 6.46957 21 7 21H17C17.5304 21 18.0391 20.7893 18.4142 20.4142C18.7893 20.0391 19 19.5304 19 19V7C19 6.46957 18.7893 5.96086 18.4142 5.58579C18.0391 5.21071 17.5304 5 17 5H15M9 5C9 5.53043 9.21071 6.03914 9.58579 6.41421C9.96086 6.78929 10.4696 7 11 7H13C13.5304 7 14.0391 6.78929 14.4142 6.41421C14.7893 6.03914 15 5.53043 15 5M9 5C9 4.46957 9.21071 3.96086 9.58579 3.58579C9.96086 3.21071 10.4696 3 11 3H13C13.5304 3 14.0391 3.21071 14.4142 3.58579C14.7893 3.96086 15 4.46957 15 5"
                      stroke="#C9B037"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h3 className="font-heading text-xl font-semibold mb-2">전문가 네트워크</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  각 분야 최고 전문가들이 협업하여 최적의 자산관리 솔루션을 제공합니다.
                </p>
              </div>
            </div>

            <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary p-8 rounded-md border-l-4 border-gold-primary">
              <h3 className="font-heading text-xl font-semibold mb-4">패밀리오피스 VIP만의 차별점</h3>
              <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                <li className="flex items-start">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-gold-primary mr-3 flex-shrink-0"
                  >
                    <path
                      d="M7.5 12L10.5 15L16.5 9"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                  </svg>
                  <span>단순 자산관리를 넘어 세대를 아우르는 자산의 지속가능한 성장 전략</span>
                </li>
                <li className="flex items-start">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-gold-primary mr-3 flex-shrink-0"
                  >
                    <path
                      d="M7.5 12L10.5 15L16.5 9"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                  </svg>
                  <span>자산관리·세무·법률·부동산 전문가들이 ONE-TEAM으로 종합 서비스 제공</span>
                </li>
                <li className="flex items-start">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-gold-primary mr-3 flex-shrink-0"
                  >
                    <path
                      d="M7.5 12L10.5 15L16.5 9"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                  </svg>
                  <span>금융 기관의 이해관계 없는 독립적 관점에서 최적의 솔루션 제공</span>
                </li>
                <li className="flex items-start">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-gold-primary mr-3 flex-shrink-0"
                  >
                    <path
                      d="M7.5 12L10.5 15L16.5 9"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                  </svg>
                  <span>정기적인 자산 리포트와 전담 어드바이저의 지속적인 관리</span>
                </li>
                <li className="flex items-start">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-gold-primary mr-3 flex-shrink-0"
                  >
                    <path
                      d="M7.5 12L10.5 15L16.5 9"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                  </svg>
                  <span>철저한 비밀 유지와 프라이버시 보호</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 통합 자산관리 */}
      <section id="wealth-management" className="py-20 bg-light-bg-secondary dark:bg-dark-bg-secondary">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-sm font-medium text-burgundy-primary bg-burgundy-primary/10 px-3 py-1 rounded-sm mb-4 inline-block">
                핵심 서비스
              </span>
              <h2 className="font-heading text-3xl font-bold mb-6">통합 자산관리</h2>
              <p className="text-lg mb-6 text-gray-600 dark:text-gray-300">
                자산 전체를 아우르는 통합적 관점에서 효율적인 자산관리 전략을 수립하고 실행합니다. 부동산, 금융자산,
                비상장주식, 해외자산 등 모든 자산 유형을 포괄하는 맞춤형 포트폴리오를 구성합니다.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-md bg-gold-primary/10 flex items-center justify-center mr-4 flex-shrink-0">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M16 6L21 11M21 11L16 16M21 11H9M12 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H12"
                        stroke="#C9B037"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-heading text-xl font-semibold mb-2">자산 진단 및 포트폴리오 구성</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      고객의 현재 자산 상태를 철저히 분석하고, 위험성향과 목표에 맞는 최적의 자산 포트폴리오를
                      구성합니다.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-md bg-gold-primary/10 flex items-center justify-center mr-4 flex-shrink-0">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M16 8V16M12 11V16M8 14V16M6 20H18C18.5304 20 19.0391 19.7893 19.4142 19.4142C19.7893 19.0391 20 18.5304 20 18V6C20 5.46957 19.7893 4.96086 19.4142 4.58579C19.0391 4.21071 18.5304 4 18 4H6C5.46957 4 4.96086 4.21071 4.58579 4.58579C4.21071 4.96086 4 5.46957 4 6V18C4 18.5304 4.21071 19.0391 4.58579 19.4142C4.96086 19.7893 5.46957 20 6 20Z"
                        stroke="#C9B037"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-heading text-xl font-semibold mb-2">성과 모니터링 및 리밸런싱</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      정기적인 성과 분석 및 리포팅을 통해 자산 포트폴리오를 지속적으로 모니터링하고 시장 상황에 맞게
                      리밸런싱합니다.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-md bg-gold-primary/10 flex items-center justify-center mr-4 flex-shrink-0">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M12 15C12.5523 15 13 14.5523 13 14C13 13.4477 12.5523 13 12 13C11.4477 13 11 13.4477 11 14C11 14.5523 11.4477 15 12 15Z"
                        stroke="#C9B037"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M19 15C19.5523 15 20 14.5523 20 14C20 13.4477 19.5523 13 19 13C18.4477 13 18 13.4477 18 14C18 14.5523 18.4477 15 19 15Z"
                        stroke="#C9B037"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M5 15C5.55228 15 6 14.5523 6 14C6 13.4477 5.55228 13 5 13C4.44772 13 4 13.4477 4 14C4 14.5523 4.44772 15 5 15Z"
                        stroke="#C9B037"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 8C12.5523 8 13 7.55228 13 7C13 6.44772 12.5523 6 12 6C11.4477 6 11 6.44772 11 7C11 7.55228 11.4477 8 12 8Z"
                        stroke="#C9B037"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M19 8C19.5523 8 20 7.55228 20 7C20 6.44772 19.5523 6 19 6C18.4477 6 18 6.44772 18 7C18 7.55228 18.4477 8 19 8Z"
                        stroke="#C9B037"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M5 8C5.55228 8 6 7.55228 6 7C6 6.44772 5.55228 6 5 6C4.44772 6 4 6.44772 4 7C4 7.55228 4.44772 8 5 8Z"
                        stroke="#C9B037"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 22C12.5523 22 13 21.5523 13 21C13 20.4477 12.5523 20 12 20C11.4477 20 11 20.4477 11 21C11 21.5523 11.4477 22 12 22Z"
                        stroke="#C9B037"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M19 22C19.5523 22 20 21.5523 20 21C20 20.4477 19.5523 20 19 20C18.4477 20 18 20.4477 18 21C18 21.5523 18.4477 22 19 22Z"
                        stroke="#C9B037"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M5 22C5.55228 22 6 21.5523 6 21C6 20.4477 5.55228 20 5 20C4.44772 20 4 20.4477 4 21C4 21.5523 4.44772 22 5 22Z"
                        stroke="#C9B037"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-heading text-xl font-semibold mb-2">다양한 자산군 관리</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      전통적인 금융자산부터 대체투자, 비상장주식, 해외자산까지 다양한 자산군을 전문적으로 관리합니다.
                    </p>
                  </div>
                </div>
              </div>

              <Link
                href="/contact"
                className="inline-block bg-burgundy-primary hover:bg-burgundy-light text-white px-6 py-3 rounded-sm shadow-medium hover:shadow-heavy transition-all"
              >
                상담 신청하기
              </Link>
            </div>

            <div className="relative">
              <div className="relative h-96 md:h-[500px] rounded-md overflow-hidden shadow-heavy z-10">
                <Image
                  src="/placeholder.svg?height=500&width=600"
                  alt="통합 자산관리 서비스"
                  className="w-full h-full object-cover"
                  width={600}
                  height={500}
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-64 h-64 bg-gold-primary/10 rounded-md -z-10"></div>
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-burgundy-primary/10 rounded-md -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* 상속·증여 설계 */}
      <section id="inheritance" className="py-20 bg-light-bg-primary dark:bg-dark-bg-primary">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="relative h-96 md:h-[500px] rounded-md overflow-hidden shadow-heavy z-10">
                <Image
                  src="/placeholder.svg?height=500&width=600"
                  alt="상속·증여 설계"
                  className="w-full h-full object-cover"
                  width={600}
                  height={500}
                />
              </div>
              <div className="absolute -bottom-6 -left-6 w-64 h-64 bg-gold-primary/10 rounded-md -z-10"></div>
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-burgundy-primary/10 rounded-md -z-10"></div>
            </div>

            <div className="order-1 lg:order-2">
              <span className="text-sm font-medium text-burgundy-primary bg-burgundy-primary/10 px-3 py-1 rounded-sm mb-4 inline-block">
                핵심 서비스
              </span>
              <h2 className="font-heading text-3xl font-bold mb-6">상속·증여 설계</h2>
              <p className="text-lg mb-6 text-gray-600 dark:text-gray-300">
                가족의 미래와 다음 세대를 위한 체계적인 자산 이전 전략을 설계합니다. 세금 부담을 최소화하면서 가족
                구성원 간 원활한 자산 이전이 이루어지도록 지원합니다.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-md bg-gold-primary/10 flex items-center justify-center mr-4 flex-shrink-0">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M9 5H7C6.46957 5 5.96086 5.21071 5.58579 5.58579C5.21071 5.96086 5 6.46957 5 7V19C5 19.5304 5.21071 20.0391 5.58579 20.4142C5.96086 20.7893 6.46957 21 7 21H17C17.5304 21 18.0391 20.7893 18.4142 20.4142C18.7893 20.0391 19 19.5304 19 19V7C19 6.46957 18.7893 5.96086 18.4142 5.58579C18.0391 5.21071 17.5304 5 17 5H15M9 5C9 5.53043 9.21071 6.03914 9.58579 6.41421C9.96086 6.78929 10.4696 7 11 7H13C13.5304 7 14.0391 6.78929 14.4142 6.41421C14.7893 6.03914 15 5.53043 15 5M9 5C9 4.46957 9.21071 3.96086 9.58579 3.58579C9.96086 3.21071 10.4696 3 11 3H13C13.5304 3 14.0391 3.21071 14.4142 3.58579C14.7893 3.96086 15 4.46957 15 5M12 12H15M12 16H15M9 12H9.01M9 16H9.01"
                        stroke="#C9B037"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-heading text-xl font-semibold mb-2">맞춤형 상속·증여 계획</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      가족 구성, 자산 구조, 세금 이슈 등을 종합적으로 고려한 맞춤형 상속·증여 계획을 수립합니다.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-md bg-gold-primary/10 flex items-center justify-center mr-4 flex-shrink-0">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M10 8C10 7.46957 10.2107 6.96086 10.5858 6.58579C10.9609 6.21071 11.4696 6 12 6C12.5304 6 13.0391 6.21071 13.4142 6.58579C13.7893 6.96086 14 7.46957 14 8C14 8.53043 13.7893 9.03914 13.4142 9.41421C13.0391 9.78929 12.5304 10 12 10C11.4696 10 10.9609 9.78929 10.5858 9.41421C10.2107 9.03914 10 8.53043 10 8Z"
                        stroke="#C9B037"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M10 8V7M14 8V7M8 14C8 12.9391 8.42143 11.9217 9.17157 11.1716C9.92172 10.4214 10.9391 10 12 10C13.0609 10 14.0783 10.4214 14.8284 11.1716C15.5786 11.9217 16 12.9391 16 14M8 14V12M16 14V12M8 14V21H16V14M16 14H18V21H16M8 14H6V21H8M14 10L17 7M10 10L7 7"
                        stroke="#C9B037"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-heading text-xl font-semibold mb-2">가족 구성원 간 자산 분배</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      가족 구성원의 특성과 니즈를 고려하여 공정하고 효율적인 자산 분배 방안을 제시합니다.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-md bg-gold-primary/10 flex items-center justify-center mr-4 flex-shrink-0">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M9 14L15 8M10.5 8.5H14.5V12.5M4 21V5C4 4.46957 4.21071 3.96086 4.58579 3.58579C4.96086 3.21071 5.46957 3 6 3H18C18.5304 3 19.0391 3.21071 19.4142 3.58579C19.7893 3.96086 20 4.46957 20 5V15C20 15.5304 19.7893 16.0391 19.4142 16.4142C19.0391 16.7893 18.5304 17 18 17H8L4 21Z"
                        stroke="#C9B037"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-heading text-xl font-semibold mb-2">상속 분쟁 예방</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      명확한 상속 계획과 가족 커뮤니케이션을 통해 잠재적인 상속 분쟁을 예방하고 가족 화합을 도모합니다.
                    </p>
                  </div>
                </div>
              </div>

              <Link
                href="/contact"
                className="inline-block bg-burgundy-primary hover:bg-burgundy-light text-white px-6 py-3 rounded-sm shadow-medium hover:shadow-heavy transition-all"
              >
                상담 신청하기
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 세무·법률 자문 */}
      <section id="tax-legal" className="py-20 bg-light-bg-secondary dark:bg-dark-bg-secondary">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-sm font-medium text-burgundy-primary bg-burgundy-primary/10 px-3 py-1 rounded-sm mb-4 inline-block">
                핵심 서비스
              </span>
              <h2 className="font-heading text-3xl font-bold mb-6">세무·법률 자문</h2>
              <p className="text-lg mb-6 text-gray-600 dark:text-gray-300">
                복잡한 세무 및 법률 이슈를 효과적으로 해결하고, 자산의 안전한 보존과 세대 간 이전을 위한 최적의 구조를
                설계합니다. 국내외 세무 환경 변화에 선제적으로 대응합니다.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-md bg-gold-primary/10 flex items-center justify-center mr-4 flex-shrink-0">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M9 7H6C5.46957 7 4.96086 7.21071 4.58579 7.58579C4.21071 7.96086 4 8.46957 4 9V18C4 18.5304 4.21071 19.0391 4.58579 19.4142C4.96086 19.7893 5.46957 20 6 20H18C18.5304 20 19.0391 19.7893 19.4142 19.4142C19.7893 19.0391 20 18.5304 20 18V9C20 8.46957 19.7893 7.96086 19.4142 7.58579C19.0391 7.21071 18.5304 7 18 7H15M9 7V5C9 4.46957 9.21071 3.96086 9.58579 3.58579C9.96086 3.21071 10.4696 3 11 3H13C13.5304 3 14.0391 3.21071 14.4142 3.58579C14.7893 3.96086 15 4.46957 15 5V7M9 7H15M12 12H12.01M12 16H12.01"
                        stroke="#C9B037"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-heading text-xl font-semibold mb-2">절세 전략 수립</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      개인 및 가족 자산에 대한 종합적인 세무 진단을 통해 법적 테두리 안에서 세금 부담을 최소화하는
                      맞춤형 절세 전략을 수립합니다.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-md bg-gold-primary/10 flex items-center justify-center mr-4 flex-shrink-0">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M20 7L12 3L4 7M20 7L12 11M20 7V17L12 21M12 11L4 7M12 11V21M4 7V17L12 21"
                        stroke="#C9B037"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-heading text-xl font-semibold mb-2">자산 구조화</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      신탁, 재단, 법인 등 다양한 법적 구조를 활용하여 자산을 효율적으로 관리하고 보호하는 방안을
                      제시합니다.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-md bg-gold-primary/10 flex items-center justify-center mr-4 flex-shrink-0">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M12 14C12.5523 14 13 13.5523 13 13C13 12.4477 12.5523 12 12 12C11.4477 12 11 12.4477 11 13C11 13.5523 11.4477 14 12 14Z"
                        stroke="#C9B037"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M19 14C19.5523 14 20 13.5523 20 13C20 12.4477 19.5523 12 19 12C18.4477 12 18 12.4477 18 13C18 13.5523 18.4477 14 19 14Z"
                        stroke="#C9B037"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M5 14C5.55228 14 6 13.5523 6 13C6 12.4477 5.55228 12 5 12C4.44772 12 4 12.4477 4 13C4 13.5523 4.44772 14 5 14Z"
                        stroke="#C9B037"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z"
                        stroke="#C9B037"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-heading text-xl font-semibold mb-2">국제 세무 자문</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      해외 자산 및 글로벌 사업에 대한 국제 세무 전략을 수립하고, 이중과세 방지 등 세무 효율성을
                      극대화합니다.
                    </p>
                  </div>
                </div>
              </div>

              <Link
                href="/contact"
                className="inline-block bg-burgundy-primary hover:bg-burgundy-light text-white px-6 py-3 rounded-sm shadow-medium hover:shadow-heavy transition-all"
              >
                상담 신청하기
              </Link>
            </div>

            <div className="relative">
              <div className="relative h-96 md:h-[500px] rounded-md overflow-hidden shadow-heavy z-10">
                <Image
                  src="/placeholder.svg?height=500&width=600"
                  alt="세무·법률 자문 서비스"
                  className="w-full h-full object-cover"
                  width={600}
                  height={500}
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-64 h-64 bg-gold-primary/10 rounded-md -z-10"></div>
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-burgundy-primary/10 rounded-md -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="py-20 bg-navy-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <Image
            src="/placeholder.svg?height=600&width=1920"
            alt="럭셔리 배경"
            className="w-full h-full object-cover"
            width={1920}
            height={600}
          />
        </div>
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6 text-white">
            자산관리의 새로운 패러다임을 경험하세요
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-3xl mx-auto">
            패밀리오피스 VIP의 전문가들이 귀하의 자산과 가문의 번영을 위한 맞춤형 솔루션을 제공합니다.
          </p>
          <Link
            href="/contact"
            className="inline-block bg-gold-primary hover:bg-gold-light text-navy-primary px-8 py-4 rounded-sm shadow-heavy hover:shadow-heavy transition-all font-medium text-lg"
          >
            무료 상담 신청하기
          </Link>
          <p className="text-white/60 mt-6">
            * 첫 상담은 무료로 진행되며, 고객의 니즈에 맞는 맞춤형 서비스 제안서를 제공해 드립니다.
          </p>
        </div>
      </section>

      {/* 추가 서비스 섹션 */}
      <section className="py-20 bg-light-bg-primary dark:bg-dark-bg-primary">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl font-bold mb-6">추가 서비스</h2>
            <p className="text-xl max-w-3xl mx-auto text-gray-600 dark:text-gray-300">
              패밀리오피스 VIP가 제공하는 다양한 특화 서비스
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* 부동산 포트폴리오 */}
            <div
              id="real-estate"
              className="bg-light-bg-secondary dark:bg-dark-bg-secondary p-8 rounded-md border-t-4 border-gold-primary"
            >
              <div className="w-16 h-16 rounded-full bg-gold-primary/10 flex items-center justify-center mb-6">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
                    stroke="#C9B037"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9 22V12H15V22"
                    stroke="#C9B037"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="font-heading text-xl font-semibold mb-4">부동산 포트폴리오</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                국내외 부동산 자산의 전략적 관리, 투자 기회 발굴, 부동산 시장 분석 및 개발 자문 등 종합적인 부동산
                서비스를 제공합니다.
              </p>
              <ul className="space-y-2 mb-6 text-gray-600 dark:text-gray-300">
                <li className="flex items-start">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-gold-primary mr-2 mt-1 flex-shrink-0"
                  >
                    <path
                      d="M5 13L9 17L19 7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>부동산 포트폴리오 분석 및 최적화</span>
                </li>
                <li className="flex items-start">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-gold-primary mr-2 mt-1 flex-shrink-0"
                  >
                    <path
                      d="M5 13L9 17L19 7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>프라임 부동산 투자 기회 발굴</span>
                </li>
                <li className="flex items-start">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-gold-primary mr-2 mt-1 flex-shrink-0"
                  >
                    <path
                      d="M5 13L9 17L19 7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>부동산 개발 및 관리 자문</span>
                </li>
              </ul>
              <Link
                href="/services/real-estate"
                className="text-burgundy-primary hover:text-burgundy-light flex items-center font-medium"
              >
                자세히 보기
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="ml-2"
                >
                  <path
                    d="M5 12H19M19 12L12 5M19 12L12 19"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </div>

            {/* 가업승계 */}
            <div
              id="business-succession"
              className="bg-light-bg-secondary dark:bg-dark-bg-secondary p-8 rounded-md border-t-4 border-gold-primary"
            >
              <div className="w-16 h-16 rounded-full bg-gold-primary/10 flex items-center justify-center mb-6">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M16 21V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V21M4 7H20M12 7V21M12 21H16M12 21H8"
                    stroke="#C9B037"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="font-heading text-xl font-semibold mb-4">가업승계</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                기업 오너의 가업승계를 위한 전략적 계획 수립부터 실행까지 통합적인 가업승계 솔루션을 제공합니다.
              </p>
              <ul className="space-y-2 mb-6 text-gray-600 dark:text-gray-300">
                <li className="flex items-start">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-gold-primary mr-2 mt-1 flex-shrink-0"
                  >
                    <path
                      d="M5 13L9 17L19 7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>가업승계 로드맵 설계</span>
                </li>
                <li className="flex items-start">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-gold-primary mr-2 mt-1 flex-shrink-0"
                  >
                    <path
                      d="M5 13L9 17L19 7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>지분구조 최적화</span>
                </li>
                <li className="flex items-start">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-gold-primary mr-2 mt-1 flex-shrink-0"
                  >
                    <path
                      d="M5 13L9 17L19 7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>차세대 경영자 교육 및 지원</span>
                </li>
              </ul>
              <Link
                href="/services/business-succession"
                className="text-burgundy-primary hover:text-burgundy-light flex items-center font-medium"
              >
                자세히 보기
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="ml-2"
                >
                  <path
                    d="M5 12H19M19 12L12 5M19 12L12 19"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </div>

            {/* 해외 자산 관리 */}
            <div
              id="global-assets"
              className="bg-light-bg-secondary dark:bg-dark-bg-secondary p-8 rounded-md border-t-4 border-gold-primary"
            >
              <div className="w-16 h-16 rounded-full bg-gold-primary/10 flex items-center justify-center mb-6">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                    stroke="#C9B037"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path d="M2 12H22" stroke="#C9B037" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path
                    d="M12 2C14.5013 4.73835 15.9228 8.29203 16 12C15.9228 15.708 14.5013 19.2616 12 22C9.49872 19.2616 8.07725 15.708 8 12C8.07725 8.29203 9.49872 4.73835 12 2V2Z"
                    stroke="#C9B037"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="font-heading text-xl font-semibold mb-4">해외 자산 관리</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                글로벌 네트워크를 활용한 해외 자산의 효율적 관리 및 투자 전략을 제공합니다.
              </p>
              <ul className="space-y-2 mb-6 text-gray-600 dark:text-gray-300">
                <li className="flex items-start">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-gold-primary mr-2 mt-1 flex-shrink-0"
                  >
                    <path
                      d="M5 13L9 17L19 7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>글로벌 투자 포트폴리오 구성</span>
                </li>
                <li className="flex items-start">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-gold-primary mr-2 mt-1 flex-shrink-0"
                  >
                    <path
                      d="M5 13L9 17L19 7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>해외 법인 및 신탁 설립</span>
                </li>
                <li className="flex items-start">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-gold-primary mr-2 mt-1 flex-shrink-0"
                  >
                    <path
                      d="M5 13L9 17L19 7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>글로벌 세무 최적화</span>
                </li>
              </ul>
              <Link
                href="/services/global-assets"
                className="text-burgundy-primary hover:text-burgundy-light flex items-center font-medium"
              >
                자세히 보기
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="ml-2"
                >
                  <path
                    d="M5 12H19M19 12L12 5M19 12L12 19"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 서비스 프로세스 */}
      <section className="py-20 bg-light-bg-secondary dark:bg-dark-bg-secondary">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl font-bold mb-6">서비스 진행 프로세스</h2>
            <p className="text-xl max-w-3xl mx-auto text-gray-600 dark:text-gray-300">
              체계적이고 전문적인 프로세스로 귀하의 자산을 관리합니다
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* 프로세스 타임라인 */}
              <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-1 bg-gold-primary/20"></div>

              {/* 프로세스 1 */}
              <div className="flex flex-col md:flex-row mb-12 md:mb-24 relative">
                <div className="md:w-1/2 md:pr-12 md:text-right mb-8 md:mb-0">
                  <div className="bg-light-bg-primary dark:bg-dark-bg-primary p-6 rounded-md shadow-medium md:ml-auto md:mr-0 max-w-md">
                    <span className="font-heading text-gold-primary font-semibold text-lg mb-2 block">STEP 01</span>
                    <h3 className="font-heading text-xl font-semibold mb-4">초기 상담 및 니즈 파악</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      고객의 자산 현황, 가족 구성, 재무 목표, 위험 성향 등을 종합적으로 파악하는 단계입니다. 전담
                      어드바이저가 직접 고객과 만나 자세한 상담을 진행합니다.
                    </p>
                  </div>
                </div>
                <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-6 w-8 h-8 rounded-full bg-gold-primary z-10"></div>
                <div className="md:w-1/2 md:pl-12"></div>
              </div>

              {/* 프로세스 2 */}
              <div className="flex flex-col md:flex-row mb-12 md:mb-24 relative">
                <div className="md:w-1/2 md:pr-12 mb-8 md:mb-0"></div>
                <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-6 w-8 h-8 rounded-full bg-gold-primary z-10"></div>
                <div className="md:w-1/2 md:pl-12">
                  <div className="bg-light-bg-primary dark:bg-dark-bg-primary p-6 rounded-md shadow-medium max-w-md">
                    <span className="font-heading text-gold-primary font-semibold text-lg mb-2 block">STEP 02</span>
                    <h3 className="font-heading text-xl font-semibold mb-4">종합 자산 진단</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      고객의 자산 및 부채 구조, 현금 흐름, 세무 상황 등을 철저히 분석하여 종합 자산 진단 보고서를
                      작성합니다. 다양한 전문가들이 참여하여 다각적인 분석을 진행합니다.
                    </p>
                  </div>
                </div>
              </div>

              {/* 프로세스 3 */}
              <div className="flex flex-col md:flex-row mb-12 md:mb-24 relative">
                <div className="md:w-1/2 md:pr-12 md:text-right mb-8 md:mb-0">
                  <div className="bg-light-bg-primary dark:bg-dark-bg-primary p-6 rounded-md shadow-medium md:ml-auto md:mr-0 max-w-md">
                    <span className="font-heading text-gold-primary font-semibold text-lg mb-2 block">STEP 03</span>
                    <h3 className="font-heading text-xl font-semibold mb-4">맞춤형 솔루션 제안</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      진단 결과를 바탕으로 고객의 니즈와 목표에 맞는 맞춤형 자산관리 솔루션을 제안합니다. 자산
                      포트폴리오 재구성, 절세 전략, 상속·증여 계획 등 통합적인 제안서를 제공합니다.
                    </p>
                  </div>
                </div>
                <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-6 w-8 h-8 rounded-full bg-gold-primary z-10"></div>
                <div className="md:w-1/2 md:pl-12"></div>
              </div>

              {/* 프로세스 4 */}
              <div className="flex flex-col md:flex-row mb-12 md:mb-24 relative">
                <div className="md:w-1/2 md:pr-12 mb-8 md:mb-0"></div>
                <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-6 w-8 h-8 rounded-full bg-gold-primary z-10"></div>
                <div className="md:w-1/2 md:pl-12">
                  <div className="bg-light-bg-primary dark:bg-dark-bg-primary p-6 rounded-md shadow-medium max-w-md">
                    <span className="font-heading text-gold-primary font-semibold text-lg mb-2 block">STEP 04</span>
                    <h3 className="font-heading text-xl font-semibold mb-4">실행 및 모니터링</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      고객이 최종 승인한 솔루션을 실행하고, 지속적인 모니터링을 통해 성과를 관리합니다. 전담
                      어드바이저가 정기적인 리포트와 미팅을 통해 진행 상황을 공유합니다.
                    </p>
                  </div>
                </div>
              </div>

              {/* 프로세스 5 */}
              <div className="flex flex-col md:flex-row relative">
                <div className="md:w-1/2 md:pr-12 md:text-right mb-8 md:mb-0">
                  <div className="bg-light-bg-primary dark:bg-dark-bg-primary p-6 rounded-md shadow-medium md:ml-auto md:mr-0 max-w-md">
                    <span className="font-heading text-gold-primary font-semibold text-lg mb-2 block">STEP 05</span>
                    <h3 className="font-heading text-xl font-semibold mb-4">정기 검토 및 조정</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      시장 환경 변화, 법제도 변경, 고객의 상황 변화 등을 고려하여 정기적으로 전략을 검토하고 필요시
                      조정합니다. 연 2회 이상의 정기 검토 미팅을 통해 최적의 상태를 유지합니다.
                    </p>
                  </div>
                </div>
                <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-6 w-8 h-8 rounded-full bg-gold-primary z-10"></div>
                <div className="md:w-1/2 md:pl-12"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 상담 신청 */}
      <section className="py-20 bg-light-bg-primary dark:bg-dark-bg-primary">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto bg-navy-primary rounded-md overflow-hidden shadow-heavy">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-10 lg:p-12">
                <h2 className="font-heading text-2xl md:text-3xl font-bold mb-6 text-white">무료 상담 신청</h2>
                <p className="text-white/80 mb-8">
                  패밀리오피스 VIP의 전문가들이 귀하의 자산과 가문의 번영을 위한 맞춤형 솔루션을 제안해 드립니다. 지금
                  무료 상담을 신청하세요.
                </p>
                <form className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="name" className="block text-white/80 mb-2 text-sm">
                        성함 *
                      </label>
                      <input
                        type="text"
                        id="name"
                        className="w-full p-3 rounded-sm bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-gold-primary"
                        placeholder="성함을 입력해주세요"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-white/80 mb-2 text-sm">
                        연락처 *
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        className="w-full p-3 rounded-sm bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-gold-primary"
                        placeholder="연락 가능한 번호를 입력해주세요"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-white/80 mb-2 text-sm">
                      이메일 *
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="w-full p-3 rounded-sm bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-gold-primary"
                      placeholder="이메일 주소를 입력해주세요"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="service" className="block text-white/80 mb-2 text-sm">
                      관심 서비스
                    </label>
                    <select
                      id="service"
                      className="w-full p-3 rounded-sm bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-gold-primary"
                    >
                      <option value="">관심 있는 서비스를 선택해주세요</option>
                      <option value="wealth-management">통합 자산관리</option>
                      <option value="inheritance">상속·증여 설계</option>
                      <option value="tax-legal">세무·법률 자문</option>
                      <option value="real-estate">부동산 포트폴리오</option>
                      <option value="business-succession">가업승계</option>
                      <option value="global-assets">해외 자산 관리</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-white/80 mb-2 text-sm">
                      문의사항
                    </label>
                    <textarea
                      id="message"
                      rows={5}
                      className="w-full p-3 rounded-sm bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-gold-primary resize-none"
                      placeholder="문의하실 내용을 자유롭게 작성해주세요"
                    ></textarea>
                  </div>
                  <div className="flex items-start">
                    <input type="checkbox" id="privacy" className="mt-1 mr-2" required />
                    <label htmlFor="privacy" className="text-sm text-white/70">
                      개인정보 수집 및 이용에 동의합니다. 수집된 정보는 상담 목적으로만 사용되며, 관련 법령에 따라
                      보호됩니다.
                    </label>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-gold-primary hover:bg-gold-light text-navy-primary font-medium py-3 rounded-sm transition-all"
                  >
                    상담 신청하기
                  </button>
                </form>
              </div>
              <div className="hidden lg:block relative">
                <Image
                  src="/placeholder.svg?height=800&width=600"
                  alt="럭셔리 오피스 인테리어"
                  className="w-full h-full object-cover"
                  width={600}
                  height={800}
                />
                <div className="absolute inset-0 bg-navy-primary/50 flex flex-col items-center justify-center p-10">
                  <div className="text-center">
                    <h3 className="font-heading text-2xl font-bold mb-6 text-white">연락처</h3>
                    <div className="space-y-4 text-white/80">
                      <p className="flex items-center">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="mr-3 text-gold-primary"
                        >
                          <path
                            d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        서울특별시 강남구 테헤란로 123
                        <br />
                        패밀리오피스 타워 15층
                      </p>
                      <p className="flex items-center">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="mr-3 text-gold-primary"
                        >
                          <path
                            d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4742 21.8325 20.7293C21.7209 20.9845 21.5573 21.2136 21.3521 21.4019C21.1469 21.5902 20.9046 21.7335 20.6407 21.8227C20.3769 21.9119 20.0974 21.9451 19.82 21.92C16.7428 21.5856 13.787 20.5341 11.19 18.85C8.77383 17.3147 6.72534 15.2662 5.19 12.85C3.49998 10.2412 2.44824 7.271 2.12 4.18C2.09501 3.90347 2.12788 3.62476 2.2165 3.36163C2.30513 3.09849 2.44757 2.85669 2.63477 2.65162C2.82196 2.44655 3.04981 2.28271 3.30379 2.17052C3.55778 2.05833 3.83234 2.00026 4.11 2H7.11C7.59531 1.99523 8.06579 2.16708 8.43376 2.48353C8.80173 2.79999 9.04207 3.23945 9.11 3.72C9.23662 4.68007 9.47145 5.62273 9.81 6.53C9.94455 6.88792 9.97366 7.27691 9.89391 7.65088C9.81415 8.02485 9.62886 8.36811 9.36 8.64L8.09 9.91C9.51356 12.4135 11.5865 14.4864 14.09 15.91L15.36 14.64C15.6319 14.3711 15.9752 14.1858 16.3491 14.1061C16.7231 14.0263 17.1121 14.0554 17.47 14.19C18.3773 14.5286 19.3199 14.7634 20.28 14.89C20.7658 14.9585 21.2094 15.2032 21.5265 15.5775C21.8437 15.9518 22.0122 16.4296 22 16.92Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        02-1234-5678
                      </p>
                      <p className="flex items-center">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="mr-3 text-gold-primary"
                        >
                          <path
                            d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M22 6L12 13L2 6"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        info@familyoffices.vip
                      </p>
                      <p className="flex items-center">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="mr-3 text-gold-primary"
                        >
                          <path
                            d="M12 8V12L15 15M3 12C3 13.1819 3.23279 14.3522 3.68508 15.4442C4.13738 16.5361 4.80031 17.5282 5.63604 18.364C6.47177 19.1997 7.46392 19.8626 8.55585 20.3149C9.64778 20.7672 10.8181 21 12 21C13.1819 21 14.3522 20.7672 15.4442 20.3149C16.5361 19.8626 17.5282 19.1997 18.364 18.364C19.1997 17.5282 19.8626 16.5361 20.3149 15.4442C20.7672 14.3522 21 13.1819 21 12C21 10.8181 20.7672 9.64778 20.3149 8.55585C19.8626 7.46392 19.1997 6.47177 18.364 5.63604C17.5282 4.80031 16.5361 4.13738 15.4442 3.68508C14.3522 3.23279 13.1819 3 12 3C10.8181 3 9.64778 3.23279 8.55585 3.68508C7.46392 4.13738 6.47177 4.80031 5.63604 5.63604C4.80031 6.47177 4.13738 7.46392 3.68508 8.55585C3.23279 9.64778 3 10.8181 3 12Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        평일 09:00 - 18:00
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

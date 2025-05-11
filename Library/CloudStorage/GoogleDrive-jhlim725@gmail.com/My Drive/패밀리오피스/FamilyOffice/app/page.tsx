import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import Image from "next/image"

export default function HomePage() {
  return (
    <div className="min-h-screen font-body text-navy-primary dark:text-white">
      <Header />

      {/* Hero Section */}
      <section className="relative py-32 bg-navy-primary overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <Image
            src="/placeholder.svg?height=800&width=1920"
            alt="럭셔리 배경"
            className="w-full h-full object-cover"
            width={1920}
            height={800}
          />
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <h1 className="font-heading text-4xl md:text-6xl font-bold mb-6 text-white">
              자산과 가문의 번영을 위한
              <br />
              <span className="text-gold-primary">패밀리오피스</span>
            </h1>
            <p className="text-xl text-white/80 mb-10">
              대한민국 상위 1% 자산가를 위한 맞춤형 자산관리 솔루션
              <br />
              자산 가치의 보존과 성장, 세대를 넘어선 자산 이전까지
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/services"
                className="bg-burgundy-primary hover:bg-burgundy-light text-white px-8 py-4 rounded-sm shadow-heavy hover:shadow-heavy transition-all font-medium text-lg"
              >
                서비스 알아보기
              </Link>
              <Link
                href="/contact"
                className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-sm shadow-medium hover:shadow-heavy transition-all font-medium text-lg"
              >
                무료 상담 신청
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 서비스 소개 */}
      <section className="py-20 bg-light-bg-primary dark:bg-dark-bg-primary">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6">패밀리오피스 VIP 서비스</h2>
            <p className="text-xl max-w-3xl mx-auto text-gray-600 dark:text-gray-300">
              자산가와 기업 오너를 위한 통합적인 자산관리 솔루션
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary p-8 rounded-md border-t-4 border-gold-primary hover:shadow-heavy transition-all">
              <div className="w-16 h-16 rounded-full bg-gold-primary/10 flex items-center justify-center mb-6">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M16 6L21 11M21 11L16 16M21 11H9M12 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H12"
                    stroke="#C9B037"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="font-heading text-xl font-semibold mb-4">통합 자산관리</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                자산 전체를 아우르는 통합적 관점에서 효율적인 자산관리 전략을 수립하고 실행합니다.
              </p>
              <Link
                href="/services#wealth-management"
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

            <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary p-8 rounded-md border-t-4 border-gold-primary hover:shadow-heavy transition-all">
              <div className="w-16 h-16 rounded-full bg-gold-primary/10 flex items-center justify-center mb-6">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M9 5H7C6.46957 5 5.96086 5.21071 5.58579 5.58579C5.21071 5.96086 5 6.46957 5 7V19C5 19.5304 5.21071 20.0391 5.58579 20.4142C5.96086 20.7893 6.46957 21 7 21H17C17.5304 21 18.0391 20.7893 18.4142 20.4142C18.7893 20.0391 19 19.5304 19 19V7C19 6.46957 18.7893 5.96086 18.4142 5.58579C18.0391 5.21071 17.5304 5 17 5H15M9 5C9 5.53043 9.21071 6.03914 9.58579 6.41421C9.96086 6.78929 10.4696 7 11 7H13C13.5304 7 14.0391 6.78929 14.4142 6.41421C14.7893 6.03914 15 5.53043 15 5M9 5C9 4.46957 9.21071 3.96086 9.58579 3.58579C9.96086 3.21071 10.4696 3 11 3H13C13.5304 3 14.0391 3.21071 14.4142 3.58579C14.7893 3.96086 15 4.46957 15 5"
                    stroke="#C9B037"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="font-heading text-xl font-semibold mb-4">상속·증여 설계</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                가족의 미래와 다음 세대를 위한 체계적인 자산 이전 전략을 설계합니다.
              </p>
              <Link
                href="/services#inheritance"
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

            <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary p-8 rounded-md border-t-4 border-gold-primary hover:shadow-heavy transition-all">
              <div className="w-16 h-16 rounded-full bg-gold-primary/10 flex items-center justify-center mb-6">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M9 7H6C5.46957 7 4.96086 7.21071 4.58579 7.58579C4.21071 7.96086 4 8.46957 4 9V18C4 18.5304 4.21071 19.0391 4.58579 19.4142C4.96086 19.7893 5.46957 20 6 20H18C18.5304 20 19.0391 19.7893 19.4142 19.4142C19.7893 19.0391 20 18.5304 20 18V9C20 8.46957 19.7893 7.96086 19.4142 7.58579C19.0391 7.21071 18.5304 7 18 7H15M9 7V5C9 4.46957 9.21071 3.96086 9.58579 3.58579C9.96086 3.21071 10.4696 3 11 3H13C13.5304 3 14.0391 3.21071 14.4142 3.58579C14.7893 3.96086 15 4.46957 15 5V7M9 7H15"
                    stroke="#C9B037"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="font-heading text-xl font-semibold mb-4">세무·법률 자문</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                복잡한 세무 및 법률 이슈를 효과적으로 해결하고, 최적의 구조를 설계합니다.
              </p>
              <Link
                href="/services#tax-legal"
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

          <div className="text-center mt-12">
            <Link
              href="/services"
              className="inline-block bg-burgundy-primary hover:bg-burgundy-light text-white px-6 py-3 rounded-sm shadow-medium hover:shadow-heavy transition-all"
            >
              모든 서비스 보기
            </Link>
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

      <Footer />
    </div>
  )
}

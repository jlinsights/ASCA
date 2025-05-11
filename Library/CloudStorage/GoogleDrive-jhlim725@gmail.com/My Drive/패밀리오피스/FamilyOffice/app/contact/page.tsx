import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ConsultationForm } from "@/components/forms/consultation-form"
import Image from "next/image"

export default function ContactPage() {
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
            <h1 className="font-heading text-4xl md:text-5xl font-bold mb-6 text-white">상담 신청</h1>
            <p className="text-xl text-white/80 mb-8">
              패밀리오피스 VIP의 전문가들이 귀하의 자산과 가문의 번영을 위한 맞춤형 솔루션을 제안해 드립니다.
            </p>
          </div>
        </div>
      </section>

      {/* 상담 신청 폼 */}
      <section className="py-20 bg-light-bg-primary dark:bg-dark-bg-primary">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto bg-white dark:bg-dark-bg-secondary rounded-md overflow-hidden shadow-medium">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-10 lg:p-12">
                <h2 className="font-heading text-2xl md:text-3xl font-bold mb-6">무료 상담 신청</h2>
                <p className="text-light-text-secondary dark:text-dark-text-secondary mb-8">
                  패밀리오피스 VIP의 전문가들이 귀하의 자산과 가문의 번영을 위한 맞춤형 솔루션을 제안해 드립니다. 지금
                  무료 상담을 신청하세요.
                </p>
                <ConsultationForm />
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

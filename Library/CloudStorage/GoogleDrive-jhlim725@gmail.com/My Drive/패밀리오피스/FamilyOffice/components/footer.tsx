import Link from "next/link"
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-navy-primary text-white py-16">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <h3 className="font-heading text-xl font-semibold mb-6">
              패밀리오피스<span className="text-gold-primary">VIP</span>
            </h3>
            <p className="text-white/70 mb-6">
              자산 가치의 보존과 성장, 세대를 넘어선 자산 이전까지 대한민국 상위 1% 자산가를 위한 맞춤형 솔루션을
              제공합니다.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-white/70 hover:text-gold-primary transition-colors">
                <Facebook size={20} />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-white/70 hover:text-gold-primary transition-colors">
                <Instagram size={20} />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" className="text-white/70 hover:text-gold-primary transition-colors">
                <Linkedin size={20} />
                <span className="sr-only">LinkedIn</span>
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-heading text-lg font-semibold mb-6">서비스</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/services#wealth-management"
                  className="text-white/70 hover:text-gold-primary transition-colors"
                >
                  통합 자산관리
                </Link>
              </li>
              <li>
                <Link href="/services#inheritance" className="text-white/70 hover:text-gold-primary transition-colors">
                  상속·증여 설계
                </Link>
              </li>
              <li>
                <Link href="/services#tax-legal" className="text-white/70 hover:text-gold-primary transition-colors">
                  세무·법률 자문
                </Link>
              </li>
              <li>
                <Link href="/services#real-estate" className="text-white/70 hover:text-gold-primary transition-colors">
                  부동산 포트폴리오
                </Link>
              </li>
              <li>
                <Link
                  href="/services#business-succession"
                  className="text-white/70 hover:text-gold-primary transition-colors"
                >
                  가업승계
                </Link>
              </li>
              <li>
                <Link
                  href="/services#global-assets"
                  className="text-white/70 hover:text-gold-primary transition-colors"
                >
                  해외 자산 관리
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-heading text-lg font-semibold mb-6">회사 소개</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-white/70 hover:text-gold-primary transition-colors">
                  회사 소개
                </Link>
              </li>
              <li>
                <Link href="/team" className="text-white/70 hover:text-gold-primary transition-colors">
                  전문가 팀
                </Link>
              </li>
              <li>
                <Link href="/case-studies" className="text-white/70 hover:text-gold-primary transition-colors">
                  성공 사례
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-white/70 hover:text-gold-primary transition-colors">
                  블로그
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-white/70 hover:text-gold-primary transition-colors">
                  채용 정보
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-heading text-lg font-semibold mb-6">연락처</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin size={20} className="text-gold-primary mr-3 mt-1 flex-shrink-0" />
                <span className="text-white/70">
                  서울특별시 강남구 테헤란로 123
                  <br />
                  패밀리오피스 타워 15층
                </span>
              </li>
              <li className="flex items-center">
                <Phone size={20} className="text-gold-primary mr-3 flex-shrink-0" />
                <span className="text-white/70">02-1234-5678</span>
              </li>
              <li className="flex items-center">
                <Mail size={20} className="text-gold-primary mr-3 flex-shrink-0" />
                <span className="text-white/70">info@familyoffices.vip</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 text-center text-white/50 text-sm">
          <p>&copy; {new Date().getFullYear()} 패밀리오피스 VIP. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

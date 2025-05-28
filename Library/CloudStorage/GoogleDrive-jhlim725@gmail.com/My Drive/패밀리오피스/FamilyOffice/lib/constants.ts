import { ServiceItem, NavigationItem } from "@/types/globals"
import { WealthManagementIcon, InheritanceIcon, TaxLegalIcon } from "@/components/icons/service-icons"

// 네비게이션 메뉴 데이터
export const NAVIGATION_ITEMS: NavigationItem[] = [
  { href: "/services", label: "서비스" },
  { href: "/about", label: "소개" },
  { href: "/brand-guidelines", label: "브랜드" },
  { href: "https://familyoffices.beehiiv.com/", label: "인사이트" },
  { href: "https://seminar.familyoffices.vip/", label: "세미나" },
  { href: "https://recruit.familyoffices.vip/", label: "채용" }
] as const

// 서비스 데이터
export const SERVICES_DATA: ServiceItem[] = [
  {
    id: "wealth-management",
    icon: WealthManagementIcon({}),
    title: "통합 자산관리",
    description: "자산 전체를 아우르는 통합적 관점에서 효율적인 자산관리 전략을 수립하고 실행합니다.",
    href: "/services#wealth-management"
  },
  {
    id: "inheritance",
    icon: InheritanceIcon({}),
    title: "상속·증여 설계",
    description: "가족의 미래와 다음 세대를 위한 체계적인 자산 이전 전략을 설계합니다.",
    href: "/services#inheritance"
  },
  {
    id: "tax-legal",
    icon: TaxLegalIcon({}),
    title: "세무·법률 자문",
    description: "복잡한 세무 및 법률 이슈를 효과적으로 해결하고, 최적의 구조를 설계합니다.",
    href: "/services#tax-legal"
  }
] as const

// 애플리케이션 메타데이터
export const APP_CONFIG = {
  name: "패밀리오피스 VIP",
  description: "대한민국 상위 1% 자산가를 위한 맞춤형 자산관리 솔루션",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://familyoffice-vip.com",
  keywords: "패밀리오피스, 자산관리, 상속, 증여, 세무, 법률, 부동산, 가업승계"
} as const

// 애니메이션 설정
export const ANIMATION_CONFIG = {
  duration: {
    fast: 200,
    normal: 300,
    slow: 500
  },
  easing: "cubic-bezier(0.4, 0, 0.2, 1)"
} as const 
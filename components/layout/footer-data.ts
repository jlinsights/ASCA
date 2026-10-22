import { footerMenu } from './site-menu'

export type FooterLink = {
  /** lib/i18n/translations/site-chrome.ts 의 번역 키 */
  labelKey: string
  href: string
  external?: boolean
  logo?: { src: string; width: number; height: number }
}

type FooterLinkSection = 'legal' | 'sponsors'

// 메뉴 링크는 site-menu.ts 한 곳에서 관리한다. 여기에는 푸터에만 있는 법적 고지·후원 기관을 둔다.
export const footerLinks: Record<FooterLinkSection, FooterLink[]> = {
  legal: [
    { labelKey: 'siteLegalTerms', href: '/terms-of-service' },
    { labelKey: 'siteLegalPrivacy', href: '/privacy-policy' },
    { labelKey: 'siteLegalCopyright', href: '/copyright-policy' },
    { labelKey: 'siteLegalEmail', href: '/email-refuse' },
  ],
  sponsors: [
    {
      labelKey: 'siteSponsorHanja',
      href: 'https://www.hanja.ne.kr/index_original.asp',
      external: true,
      logo: { src: '/sponsor/footer-kta.avif', width: 138, height: 101 },
    },
    {
      labelKey: 'siteSponsorSac',
      href: 'https://www.sac.or.kr/site/main/home',
      external: true,
      logo: { src: '/sponsor/footer-seoul-arts-center.avif', width: 1080, height: 339 },
    },
    {
      labelKey: 'siteSponsorSeoul',
      href: 'https://www.seoul.go.kr/main/index.jsp',
      external: true,
      logo: { src: '/sponsor/footer-seoul.png', width: 174, height: 48 },
    },
    {
      labelKey: 'siteSponsorMcst',
      href: 'https://www.mcst.go.kr/kor/main.jsp',
      external: true,
      logo: { src: '/sponsor/footer-mcst.png', width: 1175, height: 737 },
    },
  ],
}

export const footerSections: { titleKey: string; items: FooterLink[] }[] = footerMenu

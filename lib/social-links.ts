// 협회 공식 소셜 채널·링크 모음 — 푸터 아이콘과 Organization JSON-LD(sameAs)가 함께 쓰는 단일 출처.
// LinkedIn 은 관리자 대시보드 주소(/admin/dashboard/)가 아니라 방문자가 여는 공개 페이지 주소를 쓴다.
export type SocialNetwork = 'instagram' | 'facebook' | 'linkedin' | 'youtube' | 'littly'

export interface SocialLink {
  id: SocialNetwork
  name: string
  href: string
}

export const SOCIAL_LINKS: readonly SocialLink[] = [
  { id: 'instagram', name: 'Instagram', href: 'https://www.instagram.com/oriental_calligraphy/' },
  { id: 'facebook', name: 'Facebook', href: 'https://www.facebook.com/orientalcalligraphy/' },
  { id: 'linkedin', name: 'LinkedIn', href: 'https://www.linkedin.com/company/105905953/' },
  { id: 'youtube', name: 'YouTube', href: 'https://www.youtube.com/@orientalcalligraphy' },
  // 링크 모음(link-in-bio) — 공모 안내·연락처 등 협회 링크를 한곳에 모은 페이지
  { id: 'littly', name: 'Litt.ly', href: 'https://litt.ly/oriental_calligraphy' },
]

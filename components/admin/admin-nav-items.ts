import { Link2, Users, type LucideIcon } from 'lucide-react'

export interface AdminNavItem {
  key: string
  href: string
  icon: LucideIcon
  label: { ko: string; en: string }
}

// 실제로 동작하는 관리 페이지만 싣는다. 테스트가 href 마다 app/admin/**/page.tsx 가 있는지 확인한다.
// 2026-10-24: 공지·전시·행사·파일·작품·마이그레이션·동기화는 페이지가 없어 404 였다.
// 공모전(/admin/contests)은 관리자 확인이 DB 에 없는 user_profiles 를 봐서 항상 튕기고,
// 회원(/admin/membership)은 예시 데이터라 고칠 때까지 싣지 않는다.
export const ADMIN_NAV_ITEMS: readonly AdminNavItem[] = [
  {
    key: 'artists',
    href: '/admin/artists',
    icon: Users,
    label: { ko: '작가 회비 관리', en: 'Artist dues' },
  },
  {
    key: 'artist-claims',
    href: '/admin/artist-claims',
    icon: Link2,
    label: { ko: '작가 페이지 연결', en: 'Artist page links' },
  },
]

/** /admin 으로 들어오면 보낼 곳 */
export const ADMIN_HOME = ADMIN_NAV_ITEMS[0]?.href ?? '/'

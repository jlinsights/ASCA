import { redirect } from 'next/navigation'
import { ADMIN_HOME } from '@/components/admin/admin-nav-items'

// /admin 첫 화면이 없어 404 였다 — 동작하는 첫 관리 페이지로 보낸다
export default function AdminIndexPage() {
  redirect(ADMIN_HOME)
}

import React from 'react'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { AdminNavigation } from '@/components/admin/admin-navigation'
import AdminProtectedRoute from '@/components/admin/admin-protected-route'
import { getAccount } from '@/lib/auth/server'
import { redirect } from 'next/navigation'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const account = await getAccount()
  if (!account) redirect('/sign-in?next=/admin')
  if (account.role !== 'admin') redirect('/profile')
  if (account.assuranceLevel !== 'aal2') redirect('/auth/mfa?next=/admin')
  return (
    <AdminProtectedRoute>
      <div className='min-h-screen bg-transparent'>
        <AdminNavigation />
        <main className='container mx-auto px-4 py-8'>{children}</main>
        <LayoutFooter />
      </div>
    </AdminProtectedRoute>
  )
}

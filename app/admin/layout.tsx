import React from 'react'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { AdminNavigation } from '@/components/admin/admin-navigation'
import AdminProtectedRoute from '@/components/admin/admin-protected-route'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AdminProtectedRoute>
      <div className='min-h-screen bg-transparent'>
        <AdminNavigation />
        <main className='container py-8'>{children}</main>
        <LayoutFooter />
      </div>
    </AdminProtectedRoute>
  )
}

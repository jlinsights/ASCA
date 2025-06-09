import React from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { AdminNavigation } from '@/components/AdminNavigation'
import AdminProtectedRoute from '@/components/AdminProtectedRoute'

interface AdminLayoutProps {
  children: React.ReactNode
  currentPage: 'notices' | 'exhibitions' | 'events' | 'files' | 'artists' | 'artworks' | 'migration'
}

export const AdminLayout = React.memo(({ children, currentPage }: AdminLayoutProps) => {
  return (
    <AdminProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />
        <AdminNavigation currentPage={currentPage} />
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
        <Footer />
      </div>
    </AdminProtectedRoute>
  )
})

AdminLayout.displayName = 'AdminLayout' 

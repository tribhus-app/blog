'use client'

import { AdminAuthProvider, useAdminAuth } from '@/contexts/AdminAuthContext'
import AdminSidebar from '@/components/admin/layout/AdminSidebar'
import AdminHeader from '@/components/admin/layout/AdminHeader'
import { usePathname } from 'next/navigation'

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useAdminAuth()
  const pathname = usePathname()
  const isLoginPage = pathname === '/admin/login'

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-text-secondary">Carregando...</p>
        </div>
      </div>
    )
  }

  if (isLoginPage) {
    return <>{children}</>
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-dark">
      <AdminSidebar />
      <div className="ml-64">
        <AdminHeader />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-dark">
        <AdminAuthProvider>
          <AdminLayoutContent>{children}</AdminLayoutContent>
        </AdminAuthProvider>
      </body>
    </html>
  )
}

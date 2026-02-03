'use client'

import { usePathname } from 'next/navigation'
import Header from './Header'
import LinkBar from './LinkBar'
import Footer from './Footer'

interface LayoutWrapperProps {
  children: React.ReactNode
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith('/admin')

  if (isAdminRoute) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <LinkBar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

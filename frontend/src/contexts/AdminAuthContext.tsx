'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Cookies from 'js-cookie'
import { login as apiLogin, getCurrentUser, AdminUser } from '@/services/adminApi'

interface AdminAuthContextType {
  user: AdminUser | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null)

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    const token = Cookies.get('admin_token')

    if (!token) {
      setIsLoading(false)
      if (pathname?.startsWith('/admin') && pathname !== '/admin/login') {
        router.push('/admin/login')
      }
      return
    }

    try {
      const { user } = await getCurrentUser()
      if (!user.isAdmin) {
        throw new Error('Acesso negado')
      }
      setUser(user)
    } catch (error) {
      console.error('Auth check failed:', error)
      Cookies.remove('admin_token')
      if (pathname?.startsWith('/admin') && pathname !== '/admin/login') {
        router.push('/admin/login')
      }
    } finally {
      setIsLoading(false)
    }
  }

  async function login(email: string, password: string) {
    const response = await apiLogin(email, password)

    if (!response.user.isAdmin) {
      throw new Error('Acesso negado. Apenas administradores.')
    }

    Cookies.set('admin_token', response.token, { expires: 7 })
    setUser(response.user)
    router.push('/admin')
  }

  function logout() {
    Cookies.remove('admin_token')
    setUser(null)
    router.push('/admin/login')
  }

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider')
  }
  return context
}

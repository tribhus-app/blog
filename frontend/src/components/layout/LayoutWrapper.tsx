'use client'

import { usePathname } from 'next/navigation'
import { CabecalhoDoBlog } from '@/components/blog/CabecalhoDoBlog'
import { RodapeDoBlog } from '@/components/blog/RodapeDoBlog'

interface LayoutWrapperProps {
  children: React.ReactNode
}

// O blog com a casca da casa (pacote do redesenho de 30/10/2026): o cabecalho de
// vidro e o rodape do blog. O painel (/admin) tem a casca propria e nao leva os
// dois. Cada pagina do pacote ja traz o seu <main id="conteudo">.
export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith('/admin')

  if (isAdminRoute) {
    return <>{children}</>
  }

  return (
    <>
      <CabecalhoDoBlog />
      {children}
      <RodapeDoBlog />
    </>
  )
}

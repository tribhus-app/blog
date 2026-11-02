import type { Metadata } from 'next'
import type { ReactNode } from 'react'

// O painel do blog (pacote do redesenho de 30/10/2026). O CSS do painel
// (36-blog-admin.css) ja vem do layout raiz. A sessao e conferida em
// (painel)/layout.tsx; o login fica fora do grupo, sem a casca.
export const metadata: Metadata = {
  title: 'Painel | Tribhus Blog',
  robots: { index: false, follow: false },
}

export default function LayoutDoAdmin({ children }: { children: ReactNode }) {
  return children
}

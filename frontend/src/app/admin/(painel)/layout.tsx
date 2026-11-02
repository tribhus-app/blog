import type { ReactNode } from 'react'
import { CascaDoPainel } from '@/components/blog-admin/Casca'
import { usuarioDoPainel } from '@/lib/painel-servidor'

// A casca do painel com quem esta logado. Sem sessao valida (/auth/me falha
// ou nao e admin), usuarioDoPainel() manda para /admin/sair, que apaga o
// cookie e leva ao login, como o painel antigo fazia no navegador.
export default async function LayoutDoPainel({ children }: { children: ReactNode }) {
  const u = await usuarioDoPainel()
  return <CascaDoPainel usuario={{ name: u.name, email: u.email, avatar: u.avatar ?? null }}>{children}</CascaDoPainel>
}

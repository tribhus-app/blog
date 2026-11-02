import { Entrar } from '@/components/blog-admin/Entrar'

export const metadata = { title: 'Entrar | Painel | Tribhus Blog' }

// POST /auth/login fica no navegador (acoes.ts > entrar). Quem ja tem o
// cookie nem chega aqui: o middleware manda para /admin.
export default function Pagina() {
  return <Entrar />
}

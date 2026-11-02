import { Autores } from '@/components/blog-admin/Autores'
import type { AutorDoPainel } from '@/components/blog-admin/tipos'
import { ler } from '@/lib/painel-servidor'

export const metadata = { title: 'Autores | Painel | Tribhus Blog' }

// /authors. O e-mail e o isAdmin so vem com o token de admin (desde 31/10/2026,
// pedidoDeAdmin no backend); por isso a leitura vai com o Bearer.
export default async function Pagina() {
  const r = await ler<{ data: AutorDoPainel[] }>('/authors')
  return <Autores autores={r.data.map((a) => ({ ...a, email: a.email ?? '', isAdmin: !!a.isAdmin, isAi: !!a.isAi, postCount: a.postCount ?? 0 }))} />
}

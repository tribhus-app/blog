import { Categorias } from '@/components/blog-admin/Categorias'
import type { CategoriaDoPainel } from '@/components/blog-admin/tipos'
import { paraCategoria } from '@/lib/painel'
import { ler } from '@/lib/painel-servidor'

export const metadata = { title: 'Categorias | Painel | Tribhus Blog' }

// /categories (o postCount conta posts de todos os status).
export default async function Pagina() {
  const r = await ler<{ data: CategoriaDoPainel[] }>('/categories')
  return <Categorias categorias={r.data.map(paraCategoria)} />
}

import { Posts } from '@/components/blog-admin/Posts'
import type { CategoriaDoPainel, PostDoPainel } from '@/components/blog-admin/tipos'
import { paraCategoria, paraListaDePosts, type PaginaDaApi } from '@/lib/painel'
import { ler } from '@/lib/painel-servidor'

export const metadata = { title: 'Posts | Painel | Tribhus Blog' }

type Busca = Record<string, string | string[] | undefined>
const um = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? ''

// /admin/posts?page=&limit=20&status=&categoryId=&search= e /categories.
// Na tela o filtro de categoria se chama ?category= (o id); na API, categoryId.
export default async function Pagina({ searchParams }: { searchParams: Busca }) {
  const filtros = { status: um(searchParams.status), category: um(searchParams.category), search: um(searchParams.search) }
  const page = Math.max(1, Number(um(searchParams.page)) || 1)
  const q = new URLSearchParams({ page: String(page), limit: '20' })
  if (filtros.status) q.set('status', filtros.status)
  if (filtros.category) q.set('categoryId', filtros.category)
  if (filtros.search.trim()) q.set('search', filtros.search.trim())
  const [lista, categorias] = await Promise.all([
    ler<PaginaDaApi<PostDoPainel>>(`/admin/posts?${q}`),
    ler<{ data: CategoriaDoPainel[] }>('/categories'),
  ])
  return (
    <Posts key={JSON.stringify(searchParams)} lista={paraListaDePosts(lista)} categorias={categorias.data.map(paraCategoria)} filtros={filtros} />
  )
}

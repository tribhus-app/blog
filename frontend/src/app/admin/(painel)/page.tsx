import { Dashboard } from '@/components/blog-admin/Dashboard'
import type { PostDoPainel } from '@/components/blog-admin/tipos'
import { paraEstatisticas, paraPost, type PaginaDaApi, type StatsDaApi } from '@/lib/painel'
import { ler } from '@/lib/painel-servidor'

export const metadata = { title: 'Dashboard | Painel | Tribhus Blog' }

// Os numeros de /admin/stats. Os recentes vem de /admin/posts?limit=5 (a mesma
// ordem do recentPosts do stats, mas com capa e datas, que o stats nao manda).
export default async function Pagina() {
  const [stats, recentes] = await Promise.all([
    ler<StatsDaApi>('/admin/stats'),
    ler<PaginaDaApi<PostDoPainel>>('/admin/posts?page=1&limit=5'),
  ])
  return <Dashboard numeros={paraEstatisticas(stats)} recentes={recentes.data.map(paraPost)} />
}

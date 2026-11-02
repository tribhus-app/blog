import { AnalyticsDoPostTela } from '@/components/blog-admin/Analytics'
import { lerPeriodo, paraAnalyticsDoPost, periodoDaApi, type DetalheDoPostDaApi } from '@/lib/painel'
import { ler } from '@/lib/painel-servidor'

export const metadata = { title: 'Analytics do post | Painel | Tribhus Blog' }

// /admin/analytics/posts/:id?period=.
export default async function Pagina({ params, searchParams }: {
  params: { id: string }
  searchParams: Record<string, string | string[] | undefined>
}) {
  const periodo = lerPeriodo(searchParams.periodo)
  const id = encodeURIComponent(params.id)
  const r = await ler<DetalheDoPostDaApi>(`/admin/analytics/posts/${id}?period=${periodoDaApi(periodo)}`, { naoEncontrado: true })
  return <AnalyticsDoPostTela dados={paraAnalyticsDoPost(r)} periodo={periodo} />
}

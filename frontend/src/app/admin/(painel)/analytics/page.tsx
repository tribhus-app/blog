import { Analytics } from '@/components/blog-admin/Analytics'
import {
  lerPeriodo, paraAnalytics, periodoDaApi,
  type DevicesDaApi, type FonteDaApi, type GeoDaApi, type OverviewDaApi, type PontoDaApi, type TopPostDaApi,
} from '@/lib/painel'
import { ler } from '@/lib/painel-servidor'

export const metadata = { title: 'Analytics | Painel | Tribhus Blog' }

// /admin/analytics/{overview,timeseries,top-posts,sources,devices,geo}?period=.
// Na tela o periodo mora em ?periodo= e "1 ano" e 1y; na API, 365d.
export default async function Pagina({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const periodo = lerPeriodo(searchParams.periodo)
  const p = `period=${periodoDaApi(periodo)}`
  const [overview, timeseries, topPosts, sources, devices, geo] = await Promise.all([
    ler<OverviewDaApi>(`/admin/analytics/overview?${p}`),
    ler<PontoDaApi[]>(`/admin/analytics/timeseries?${p}`),
    ler<TopPostDaApi[]>(`/admin/analytics/top-posts?${p}&limit=20`),
    ler<FonteDaApi[]>(`/admin/analytics/sources?${p}`),
    ler<DevicesDaApi>(`/admin/analytics/devices?${p}`),
    ler<GeoDaApi>(`/admin/analytics/geo?${p}`),
  ])
  return <Analytics dados={paraAnalytics({ overview, timeseries, topPosts, sources, devices, geo })} periodo={periodo} />
}

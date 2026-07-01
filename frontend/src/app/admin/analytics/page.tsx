'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  getAnalyticsOverview,
  getAnalyticsTimeseries,
  getAnalyticsSources,
  getAnalyticsDevices,
  getAnalyticsTopPosts,
  getAnalyticsGeo,
  AnalyticsPeriod,
  AnalyticsOverview,
  TimeseriesPoint,
  SourceBreakdown,
  DevicesBreakdown,
  AnalyticsTopPost,
  GeoBreakdown,
} from '@/services/adminApi'
import {
  PeriodSelector,
  KpiCard,
  LineChart,
  BarList,
  formatDuration,
  sourceLabel,
} from '@/components/admin/analytics/AnalyticsCharts'

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<AnalyticsPeriod>('30d')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const [overview, setOverview] = useState<AnalyticsOverview | null>(null)
  const [series, setSeries] = useState<TimeseriesPoint[]>([])
  const [sources, setSources] = useState<SourceBreakdown[]>([])
  const [devices, setDevices] = useState<DevicesBreakdown | null>(null)
  const [geo, setGeo] = useState<GeoBreakdown | null>(null)
  const [topPosts, setTopPosts] = useState<AnalyticsTopPost[]>([])

  const load = useCallback(async (p: AnalyticsPeriod) => {
    setIsLoading(true)
    setError('')
    try {
      const [ov, ts, src, dev, geoData, top] = await Promise.all([
        getAnalyticsOverview(p),
        getAnalyticsTimeseries(p),
        getAnalyticsSources(p),
        getAnalyticsDevices(p),
        getAnalyticsGeo(p),
        getAnalyticsTopPosts(p, 20),
      ])
      setOverview(ov)
      setSeries(ts)
      setSources(src)
      setDevices(dev)
      setGeo(geoData)
      setTopPosts(top)
    } catch (err) {
      console.error(err)
      setError('Erro ao carregar analytics')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    load(period)
  }, [period, load])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-text-muted text-sm mt-1">
            Audiência real do blog — tráfego, fontes e engajamento (bots excluídos)
          </p>
        </div>
        <PeriodSelector value={period} onChange={setPeriod} />
      </div>

      {error && (
        <div className="bg-accent-red/10 border border-accent-red/20 text-accent-red px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title="Visualizações"
              value={(overview?.views ?? 0).toLocaleString('pt-BR')}
              delta={overview?.deltas?.views ?? null}
            />
            <KpiCard
              title="Visitantes únicos"
              value={(overview?.uniqueVisitors ?? 0).toLocaleString('pt-BR')}
              delta={overview?.deltas?.uniqueVisitors ?? null}
            />
            <KpiCard
              title="Tempo médio de leitura"
              value={formatDuration(overview?.avgTimeOnPage ?? 0)}
              delta={overview?.deltas?.avgTimeOnPage ?? null}
            />
            <KpiCard
              title="Scroll médio"
              value={`${overview?.avgScrollDepth ?? 0}%`}
              delta={overview?.deltas?.avgScrollDepth ?? null}
              hint={overview?.botViews ? `${overview.botViews.toLocaleString('pt-BR')} acessos de bots filtrados` : undefined}
            />
          </div>

          {/* Série temporal */}
          <div className="bg-dark-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Tráfego ao longo do tempo</h2>
            <LineChart data={series} />
          </div>

          {/* Fontes + Dispositivos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-dark-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-1">Fontes de tráfego</h2>
              <p className="text-text-muted text-xs mb-4">De onde vêm os leitores (SEO, social, direto)</p>
              <BarList items={sources.map((s) => ({ label: s.source, views: s.views }))} labelFn={sourceLabel} />
            </div>

            <div className="bg-dark-card border border-border rounded-xl p-6 space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-white mb-3">Dispositivos</h2>
                <BarList items={devices?.devices ?? []} labelFn={(l) => ({ mobile: 'Celular', desktop: 'Desktop', tablet: 'Tablet' } as Record<string, string>)[l] || l} />
              </div>
              <div className="border-t border-border pt-4">
                <h3 className="text-sm font-semibold text-text-secondary mb-3">Navegadores</h3>
                <BarList items={(devices?.browsers ?? []).slice(0, 5)} />
              </div>
            </div>
          </div>

          {/* Regiões / Geolocalização */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-dark-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-1">Estados / Regiões</h2>
              <p className="text-text-muted text-xs mb-4">De onde os leitores acessam</p>
              <BarList
                items={geo?.regions ?? []}
                emptyLabel={
                  geo?.pendingGeo
                    ? 'Resolvendo localização dos acessos recentes…'
                    : 'Sem dados de região no período'
                }
              />
            </div>
            <div className="bg-dark-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-1">Cidades</h2>
              <p className="text-text-muted text-xs mb-4">Top cidades por visualizações</p>
              <BarList items={geo?.cities ?? []} emptyLabel="Sem dados de cidade no período" />
              {geo?.countries && geo.countries.length > 1 && (
                <div className="border-t border-border pt-4 mt-4">
                  <h3 className="text-sm font-semibold text-text-secondary mb-3">Países</h3>
                  <BarList items={geo.countries} />
                </div>
              )}
            </div>
          </div>

          {/* Top posts */}
          <div className="bg-dark-card border border-border rounded-xl overflow-hidden">
            <div className="p-6 pb-3">
              <h2 className="text-lg font-semibold text-white">Posts mais lidos</h2>
              <p className="text-text-muted text-xs mt-1">Clique em um post para ver o detalhe</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-y border-border">
                    <th className="text-left px-6 py-3 text-text-secondary font-medium text-sm">Post</th>
                    <th className="text-right px-4 py-3 text-text-secondary font-medium text-sm">Views</th>
                    <th className="text-right px-4 py-3 text-text-secondary font-medium text-sm">Únicos</th>
                    <th className="text-right px-4 py-3 text-text-secondary font-medium text-sm">Tempo méd.</th>
                    <th className="text-right px-6 py-3 text-text-secondary font-medium text-sm">Scroll méd.</th>
                  </tr>
                </thead>
                <tbody>
                  {topPosts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center text-text-muted py-10">
                        Ainda não há visitas registradas neste período
                      </td>
                    </tr>
                  ) : (
                    topPosts.map((p) => (
                      <tr key={p.id} className="border-b border-border last:border-0 hover:bg-dark transition-colors">
                        <td className="px-6 py-3">
                          <Link href={`/admin/analytics/${p.id}`} className="text-white hover:text-primary transition-colors block truncate max-w-md">
                            {p.title}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-right text-white">{p.views.toLocaleString('pt-BR')}</td>
                        <td className="px-4 py-3 text-right text-text-secondary">{p.uniques.toLocaleString('pt-BR')}</td>
                        <td className="px-4 py-3 text-right text-text-secondary">{formatDuration(p.avgTimeOnPage)}</td>
                        <td className="px-6 py-3 text-right text-text-secondary">{p.avgScrollDepth}%</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

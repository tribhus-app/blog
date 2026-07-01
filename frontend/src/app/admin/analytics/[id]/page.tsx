'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  getPostAnalytics,
  AnalyticsPeriod,
  PostAnalyticsDetail,
} from '@/services/adminApi'
import {
  PeriodSelector,
  KpiCard,
  LineChart,
  BarList,
  formatDuration,
  sourceLabel,
} from '@/components/admin/analytics/AnalyticsCharts'

export default function PostAnalyticsPage() {
  const params = useParams()
  const id = params?.id as string

  const [period, setPeriod] = useState<AnalyticsPeriod>('30d')
  const [data, setData] = useState<PostAnalyticsDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(
    async (p: AnalyticsPeriod) => {
      setIsLoading(true)
      setError('')
      try {
        setData(await getPostAnalytics(id, p))
      } catch (err) {
        console.error(err)
        setError('Erro ao carregar analytics do post')
      } finally {
        setIsLoading(false)
      }
    },
    [id]
  )

  useEffect(() => {
    if (id) load(period)
  }, [id, period, load])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="min-w-0">
          <Link href="/admin/analytics" className="text-primary hover:text-primary-hover text-sm flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Voltar
          </Link>
          <h1 className="text-2xl font-bold text-white mt-1 truncate">{data?.post.title || 'Analytics do post'}</h1>
          {data?.post.slug && (
            <Link href={`/${data.post.slug}`} target="_blank" className="text-text-muted text-sm hover:text-primary">
              /{data.post.slug} ↗
            </Link>
          )}
        </div>
        <PeriodSelector value={period} onChange={setPeriod} />
      </div>

      {error && (
        <div className="bg-accent-red/10 border border-accent-red/20 text-accent-red px-4 py-3 rounded-lg">{error}</div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : data ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard title="Visualizações (período)" value={data.kpis.views.toLocaleString('pt-BR')} hint={`Total histórico: ${data.post.totalViews.toLocaleString('pt-BR')}`} />
            <KpiCard title="Visitantes únicos" value={data.kpis.uniqueVisitors.toLocaleString('pt-BR')} />
            <KpiCard title="Tempo médio de leitura" value={formatDuration(data.kpis.avgTimeOnPage)} />
            <KpiCard title="Scroll médio" value={`${data.kpis.avgScrollDepth}%`} />
          </div>

          <div className="bg-dark-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Views ao longo do tempo</h2>
            <LineChart data={data.timeseries.map((t) => ({ day: t.day, views: t.views }))} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-dark-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Fontes de tráfego</h2>
              <BarList items={data.sources.map((s) => ({ label: s.source, views: s.views }))} labelFn={sourceLabel} />
            </div>
            <div className="bg-dark-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Dispositivos</h2>
              <BarList items={data.devices} labelFn={(l) => ({ mobile: 'Celular', desktop: 'Desktop', tablet: 'Tablet' } as Record<string, string>)[l] || l} />
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}

'use client'

import type { AnalyticsPeriod } from '@/services/adminApi'

// ---------- Helpers ----------

export function formatDuration(seconds: number): string {
  if (!seconds || seconds < 1) return '0s'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (m <= 0) return `${s}s`
  return `${m}m ${s.toString().padStart(2, '0')}s`
}

const SOURCE_LABELS: Record<string, string> = {
  organic_google: 'Busca Google',
  google_discover: 'Google Discover',
  organic_bing: 'Busca Bing',
  organic_duckduckgo: 'DuckDuckGo',
  organic_other: 'Outras buscas',
  direct: 'Direto',
  internal: 'Interno (blog)',
  referral: 'Referencia (links)',
  email: 'E-mail / Newsletter',
  paid: 'Anuncios (pago)',
  social_instagram: 'Instagram',
  social_facebook: 'Facebook',
  social_x: 'X / Twitter',
  social_tiktok: 'TikTok',
  social_youtube: 'YouTube',
  social_linkedin: 'LinkedIn',
  social_whatsapp: 'WhatsApp',
  social_reddit: 'Reddit',
  social_telegram: 'Telegram',
}

export function sourceLabel(source: string): string {
  if (SOURCE_LABELS[source]) return SOURCE_LABELS[source]
  if (source.startsWith('social_')) return source.replace('social_', '').replace(/^./, (c) => c.toUpperCase())
  return source
}

// ---------- Period selector ----------

const PERIODS: { value: AnalyticsPeriod; label: string }[] = [
  { value: '24h', label: '24h' },
  { value: '7d', label: '7 dias' },
  { value: '30d', label: '30 dias' },
  { value: '90d', label: '90 dias' },
  { value: '365d', label: '1 ano' },
  { value: 'all', label: 'Tudo' },
]

export function PeriodSelector({
  value,
  onChange,
}: {
  value: AnalyticsPeriod
  onChange: (p: AnalyticsPeriod) => void
}) {
  return (
    <div className="inline-flex bg-dark-card border border-border rounded-lg p-1">
      {PERIODS.map((p) => (
        <button
          key={p.value}
          onClick={() => onChange(p.value)}
          className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
            value === p.value ? 'bg-primary text-white' : 'text-text-secondary hover:text-white'
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  )
}

// ---------- KPI card ----------

export function KpiCard({
  title,
  value,
  delta,
  hint,
}: {
  title: string
  value: string | number
  delta?: number | null
  hint?: string
}) {
  const showDelta = delta !== undefined && delta !== null
  const up = (delta ?? 0) >= 0
  return (
    <div className="bg-dark-card border border-border rounded-xl p-5">
      <p className="text-text-muted text-sm">{title}</p>
      <div className="flex items-end gap-2 mt-2">
        <span className="text-2xl font-bold text-white">{value}</span>
        {showDelta && (
          <span
            className={`text-xs font-medium mb-1 ${up ? 'text-accent-green' : 'text-accent-red'}`}
          >
            {up ? '▲' : '▼'} {Math.abs(delta as number)}%
          </span>
        )}
      </div>
      {hint && <p className="text-text-muted text-xs mt-1">{hint}</p>}
    </div>
  )
}

// ---------- Line chart (views + uniques) ----------

interface SeriesPoint {
  day: string
  views: number
  uniques?: number
}

export function LineChart({ data }: { data: SeriesPoint[] }) {
  const W = 1000
  const H = 280
  const pad = { top: 20, right: 16, bottom: 28, left: 40 }
  const innerW = W - pad.left - pad.right
  const innerH = H - pad.top - pad.bottom

  if (!data.length) {
    return <div className="text-text-muted text-center py-16">Sem dados no periodo</div>
  }

  const maxV = Math.max(1, ...data.map((d) => Math.max(d.views, d.uniques ?? 0)))
  const stepX = data.length > 1 ? innerW / (data.length - 1) : 0
  const x = (i: number) => pad.left + i * stepX
  const y = (v: number) => pad.top + innerH - (v / maxV) * innerH

  const pathFor = (key: 'views' | 'uniques') =>
    data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y((d as any)[key] ?? 0).toFixed(1)}`).join(' ')

  const areaPath =
    `M ${x(0).toFixed(1)} ${y(data[0].views).toFixed(1)} ` +
    data.map((d, i) => `L ${x(i).toFixed(1)} ${y(d.views).toFixed(1)}`).join(' ') +
    ` L ${x(data.length - 1).toFixed(1)} ${(pad.top + innerH).toFixed(1)} L ${x(0).toFixed(1)} ${(pad.top + innerH).toFixed(1)} Z`

  const gridYs = [0, 0.25, 0.5, 0.75, 1].map((f) => ({
    val: Math.round(maxV * (1 - f)),
    py: pad.top + innerH * f,
  }))

  // Mostra ~6 labels de data no eixo X
  const labelEvery = Math.max(1, Math.ceil(data.length / 6))
  const fmtDay = (s: string) => {
    const [, m, d] = s.split('-')
    return `${d}/${m}`
  }

  return (
    <div className="w-full overflow-hidden">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" className="block" preserveAspectRatio="xMidYMid meet">
        {gridYs.map((g, i) => (
          <g key={i}>
            <line x1={pad.left} x2={W - pad.right} y1={g.py} y2={g.py} className="text-border" stroke="currentColor" strokeWidth={1} />
            <text x={pad.left - 8} y={g.py + 4} textAnchor="end" className="fill-current text-text-muted" fontSize={11}>
              {g.val}
            </text>
          </g>
        ))}

        <path d={areaPath} className="text-primary" fill="currentColor" fillOpacity={0.12} stroke="none" />
        <path d={pathFor('views')} className="text-primary" fill="none" stroke="currentColor" strokeWidth={2.5} vectorEffect="non-scaling-stroke" />
        {data.some((d) => d.uniques !== undefined) && (
          <path d={pathFor('uniques')} className="text-accent-blue" fill="none" stroke="currentColor" strokeWidth={2} strokeDasharray="5 4" vectorEffect="non-scaling-stroke" />
        )}

        {data.map((d, i) =>
          i % labelEvery === 0 || i === data.length - 1 ? (
            <text key={i} x={x(i)} y={H - 8} textAnchor="middle" className="fill-current text-text-muted" fontSize={11}>
              {fmtDay(d.day)}
            </text>
          ) : null
        )}
      </svg>
      <div className="flex gap-4 justify-center mt-2 text-xs">
        <span className="flex items-center gap-1.5 text-text-secondary">
          <span className="w-3 h-0.5 bg-primary inline-block" /> Views
        </span>
        {data.some((d) => d.uniques !== undefined) && (
          <span className="flex items-center gap-1.5 text-text-secondary">
            <span className="w-3 h-0.5 bg-accent-blue inline-block" /> Visitantes unicos
          </span>
        )}
      </div>
    </div>
  )
}

// ---------- Bar list (sources, devices, etc) ----------

export function BarList({
  items,
  emptyLabel = 'Sem dados no periodo',
  labelFn,
}: {
  items: { label: string; views: number }[]
  emptyLabel?: string
  labelFn?: (label: string) => string
}) {
  if (!items.length) {
    return <p className="text-text-muted text-center py-8 text-sm">{emptyLabel}</p>
  }
  const total = items.reduce((a, b) => a + b.views, 0) || 1
  const max = Math.max(...items.map((i) => i.views), 1)

  return (
    <div className="space-y-2.5">
      {items.map((it) => {
        const pct = Math.round((it.views / total) * 100)
        const w = Math.round((it.views / max) * 100)
        return (
          <div key={it.label}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-text-secondary truncate pr-2">{labelFn ? labelFn(it.label) : it.label}</span>
              <span className="text-white font-medium whitespace-nowrap">
                {it.views.toLocaleString('pt-BR')} <span className="text-text-muted">({pct}%)</span>
              </span>
            </div>
            <div className="h-2 bg-dark rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: `${w}%` }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

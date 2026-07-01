import { Request, Response } from 'express'
import { Prisma } from '@prisma/client'
import { prisma } from '../utils/prisma'
import { periodToSince } from '../utils/analytics'

// Prisma retorna COUNT/SUM como BigInt; helper para numero seguro.
const n = (v: any): number => (v === null || v === undefined ? 0 : Number(v))

const PERIOD_DAYS: Record<string, number> = {
  '24h': 1,
  '7d': 7,
  '30d': 30,
  '90d': 90,
  '365d': 365,
}

function sinceClause(since: Date | null): Prisma.Sql {
  return since ? Prisma.sql`AND viewed_at >= ${since}` : Prisma.empty
}

/** KPIs gerais + comparacao com o periodo anterior. */
export async function getOverview(req: Request, res: Response) {
  try {
    const period = (req.query.period as string) || '30d'
    const since = periodToSince(period)

    const kpiFor = async (from: Date | null, to: Date | null) => {
      const fromC = from ? Prisma.sql`AND viewed_at >= ${from}` : Prisma.empty
      const toC = to ? Prisma.sql`AND viewed_at < ${to}` : Prisma.empty
      const rows = await prisma.$queryRaw<any[]>`
        SELECT
          COUNT(*)::int                                              AS views,
          COUNT(DISTINCT COALESCE(session_id, ip))::int             AS uniques,
          COALESCE(ROUND(AVG(time_on_page))::int, 0)                AS avg_time,
          COALESCE(ROUND(AVG(scroll_depth))::int, 0)                AS avg_scroll
        FROM blog_post_views
        WHERE is_bot = false ${fromC} ${toC}`
      return rows[0]
    }

    const current = await kpiFor(since, null)

    // Periodo anterior (mesma duracao imediatamente antes)
    let previous: any = null
    if (since && PERIOD_DAYS[period]) {
      const prevFrom = new Date(since.getTime() - PERIOD_DAYS[period] * 86400000)
      previous = await kpiFor(prevFrom, since)
    }

    // Bots no periodo (informativo)
    const botRows = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*)::int AS bots FROM blog_post_views
      WHERE is_bot = true ${sinceClause(since)}`

    const pubRows = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*)::int AS total FROM blog_posts WHERE status = 'published'`

    const delta = (cur: number, prev: number) =>
      prev > 0 ? Math.round(((cur - prev) / prev) * 1000) / 10 : null

    res.json({
      period,
      views: n(current.views),
      uniqueVisitors: n(current.uniques),
      avgTimeOnPage: n(current.avg_time),
      avgScrollDepth: n(current.avg_scroll),
      botViews: n(botRows[0]?.bots),
      publishedPosts: n(pubRows[0]?.total),
      deltas: previous
        ? {
            views: delta(n(current.views), n(previous.views)),
            uniqueVisitors: delta(n(current.uniques), n(previous.uniques)),
            avgTimeOnPage: delta(n(current.avg_time), n(previous.avg_time)),
            avgScrollDepth: delta(n(current.avg_scroll), n(previous.avg_scroll)),
          }
        : null,
    })
  } catch (error) {
    console.error('Erro overview analytics:', error)
    res.status(500).json({ error: 'Erro ao carregar overview' })
  }
}

/** Serie temporal de views/uniques por dia (com dias vazios preenchidos). */
export async function getTimeseries(req: Request, res: Response) {
  try {
    const period = (req.query.period as string) || '30d'
    let since = periodToSince(period)

    // Para "all", comeca no primeiro evento (ou 30 dias atras se vazio).
    if (!since) {
      const minRows = await prisma.$queryRaw<any[]>`
        SELECT MIN(viewed_at)::date AS min_day FROM blog_post_views WHERE is_bot = false`
      since = minRows[0]?.min_day
        ? new Date(minRows[0].min_day)
        : new Date(Date.now() - 30 * 86400000)
    }

    const rows = await prisma.$queryRaw<any[]>`
      SELECT
        d::date AS day,
        COALESCE(v.views, 0)::int   AS views,
        COALESCE(v.uniques, 0)::int AS uniques
      FROM generate_series(${since}::date, CURRENT_DATE, '1 day') d
      LEFT JOIN (
        SELECT viewed_at::date AS day,
               COUNT(*) AS views,
               COUNT(DISTINCT COALESCE(session_id, ip)) AS uniques
        FROM blog_post_views
        WHERE is_bot = false AND viewed_at >= ${since}
        GROUP BY 1
      ) v ON v.day = d::date
      ORDER BY day`

    res.json(
      rows.map((r) => ({
        day: r.day instanceof Date ? r.day.toISOString().slice(0, 10) : String(r.day).slice(0, 10),
        views: n(r.views),
        uniques: n(r.uniques),
      }))
    )
  } catch (error) {
    console.error('Erro timeseries analytics:', error)
    res.status(500).json({ error: 'Erro ao carregar serie temporal' })
  }
}

/** Posts mais vistos no periodo. */
export async function getTopPosts(req: Request, res: Response) {
  try {
    const since = periodToSince((req.query.period as string) || '30d')
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20))

    const rows = await prisma.$queryRaw<any[]>`
      SELECT
        p.id, p.title, p.slug,
        COUNT(*)::int                                  AS views,
        COUNT(DISTINCT COALESCE(v.session_id, v.ip))::int AS uniques,
        COALESCE(ROUND(AVG(v.time_on_page))::int, 0)   AS avg_time,
        COALESCE(ROUND(AVG(v.scroll_depth))::int, 0)   AS avg_scroll
      FROM blog_post_views v
      JOIN blog_posts p ON p.id = v.post_id
      WHERE v.is_bot = false ${sinceClause(since)}
      GROUP BY p.id, p.title, p.slug
      ORDER BY views DESC
      LIMIT ${limit}`

    res.json(
      rows.map((r) => ({
        id: r.id,
        title: r.title,
        slug: r.slug,
        views: n(r.views),
        uniques: n(r.uniques),
        avgTimeOnPage: n(r.avg_time),
        avgScrollDepth: n(r.avg_scroll),
      }))
    )
  } catch (error) {
    console.error('Erro top posts analytics:', error)
    res.status(500).json({ error: 'Erro ao carregar top posts' })
  }
}

/** Distribuicao por fonte de trafego (SEO: organico, discover, social, etc). */
export async function getSources(req: Request, res: Response) {
  try {
    const since = periodToSince((req.query.period as string) || '30d')
    const rows = await prisma.$queryRaw<any[]>`
      SELECT COALESCE(source, 'direct') AS source, COUNT(*)::int AS views
      FROM blog_post_views
      WHERE is_bot = false ${sinceClause(since)}
      GROUP BY 1
      ORDER BY views DESC`
    res.json(rows.map((r) => ({ source: r.source, views: n(r.views) })))
  } catch (error) {
    console.error('Erro sources analytics:', error)
    res.status(500).json({ error: 'Erro ao carregar fontes' })
  }
}

/** Distribuicao por device / browser / OS. */
export async function getDevices(req: Request, res: Response) {
  try {
    const since = periodToSince((req.query.period as string) || '30d')
    const sc = sinceClause(since)

    const group = (col: Prisma.Sql) =>
      prisma.$queryRaw<any[]>`
        SELECT COALESCE(${col}, 'Outro') AS label, COUNT(*)::int AS views
        FROM blog_post_views
        WHERE is_bot = false ${sc}
        GROUP BY 1 ORDER BY views DESC`

    const [devices, browsers, os] = await Promise.all([
      group(Prisma.sql`device_type`),
      group(Prisma.sql`browser`),
      group(Prisma.sql`os`),
    ])

    const map = (rows: any[]) => rows.map((r) => ({ label: r.label, views: n(r.views) }))
    res.json({ devices: map(devices), browsers: map(browsers), os: map(os) })
  } catch (error) {
    console.error('Erro devices analytics:', error)
    res.status(500).json({ error: 'Erro ao carregar dispositivos' })
  }
}

/** Distribuicao geografica: estados, cidades e paises (via ip-api.com). */
export async function getGeo(req: Request, res: Response) {
  try {
    const since = periodToSince((req.query.period as string) || '30d')
    const sc = sinceClause(since)

    const regions = await prisma.$queryRaw<any[]>`
      SELECT region AS label, COUNT(*)::int AS views
      FROM blog_post_views
      WHERE is_bot = false AND region IS NOT NULL ${sc}
      GROUP BY region ORDER BY views DESC LIMIT 20`

    const cities = await prisma.$queryRaw<any[]>`
      SELECT city AS label, region, COUNT(*)::int AS views
      FROM blog_post_views
      WHERE is_bot = false AND city IS NOT NULL ${sc}
      GROUP BY city, region ORDER BY views DESC LIMIT 20`

    const countries = await prisma.$queryRaw<any[]>`
      SELECT country AS label, COUNT(*)::int AS views
      FROM blog_post_views
      WHERE is_bot = false AND country IS NOT NULL ${sc}
      GROUP BY country ORDER BY views DESC LIMIT 20`

    // Quantos eventos ainda nao tem geo resolvida (informativo)
    const pendingRows = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*)::int AS pending FROM blog_post_views
      WHERE is_bot = false AND country IS NULL ${sc}`

    res.json({
      regions: regions.map((r) => ({ label: r.label, views: n(r.views) })),
      cities: cities.map((r) => ({
        label: r.region ? `${r.label} (${r.region})` : r.label,
        views: n(r.views),
      })),
      countries: countries.map((r) => ({ label: r.label, views: n(r.views) })),
      pendingGeo: n(pendingRows[0]?.pending),
    })
  } catch (error) {
    console.error('Erro geo analytics:', error)
    res.status(500).json({ error: 'Erro ao carregar geo' })
  }
}

/** Detalhe de um post: KPIs + serie + fontes + devices. */
export async function getPostDetail(req: Request, res: Response) {
  try {
    const { id } = req.params
    const period = (req.query.period as string) || '30d'
    let since = periodToSince(period)

    const post = await prisma.blogPost.findUnique({
      where: { id },
      select: { id: true, title: true, slug: true, views: true, publishedAt: true },
    })
    if (!post) return res.status(404).json({ error: 'Post nao encontrado' })

    const sc = since ? Prisma.sql`AND viewed_at >= ${since}` : Prisma.empty

    const kpiRows = await prisma.$queryRaw<any[]>`
      SELECT
        COUNT(*)::int                                  AS views,
        COUNT(DISTINCT COALESCE(session_id, ip))::int  AS uniques,
        COALESCE(ROUND(AVG(time_on_page))::int, 0)     AS avg_time,
        COALESCE(ROUND(AVG(scroll_depth))::int, 0)     AS avg_scroll
      FROM blog_post_views
      WHERE is_bot = false AND post_id = ${id}::uuid ${sc}`

    const sources = await prisma.$queryRaw<any[]>`
      SELECT COALESCE(source, 'direct') AS source, COUNT(*)::int AS views
      FROM blog_post_views
      WHERE is_bot = false AND post_id = ${id}::uuid ${sc}
      GROUP BY 1 ORDER BY views DESC`

    const devices = await prisma.$queryRaw<any[]>`
      SELECT COALESCE(device_type, 'Outro') AS label, COUNT(*)::int AS views
      FROM blog_post_views
      WHERE is_bot = false AND post_id = ${id}::uuid ${sc}
      GROUP BY 1 ORDER BY views DESC`

    if (!since) {
      const minRows = await prisma.$queryRaw<any[]>`
        SELECT MIN(viewed_at)::date AS min_day FROM blog_post_views
        WHERE is_bot = false AND post_id = ${id}::uuid`
      since = minRows[0]?.min_day ? new Date(minRows[0].min_day) : new Date(Date.now() - 30 * 86400000)
    }

    const series = await prisma.$queryRaw<any[]>`
      SELECT d::date AS day, COALESCE(v.views, 0)::int AS views
      FROM generate_series(${since}::date, CURRENT_DATE, '1 day') d
      LEFT JOIN (
        SELECT viewed_at::date AS day, COUNT(*) AS views
        FROM blog_post_views
        WHERE is_bot = false AND post_id = ${id}::uuid AND viewed_at >= ${since}
        GROUP BY 1
      ) v ON v.day = d::date
      ORDER BY day`

    res.json({
      post: { id: post.id, title: post.title, slug: post.slug, totalViews: post.views ?? 0 },
      kpis: {
        views: n(kpiRows[0]?.views),
        uniqueVisitors: n(kpiRows[0]?.uniques),
        avgTimeOnPage: n(kpiRows[0]?.avg_time),
        avgScrollDepth: n(kpiRows[0]?.avg_scroll),
      },
      sources: sources.map((r) => ({ source: r.source, views: n(r.views) })),
      devices: devices.map((r) => ({ label: r.label, views: n(r.views) })),
      timeseries: series.map((r) => ({
        day: r.day instanceof Date ? r.day.toISOString().slice(0, 10) : String(r.day).slice(0, 10),
        views: n(r.views),
      })),
    })
  } catch (error) {
    console.error('Erro detalhe post analytics:', error)
    res.status(500).json({ error: 'Erro ao carregar detalhe do post' })
  }
}

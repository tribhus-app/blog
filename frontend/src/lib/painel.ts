import type {
  AnalyticsDoBlog,
  AnalyticsDoPost,
  CategoriaDoPainel,
  EstadoDaIA,
  Estatisticas,
  Fatia,
  ListaDePosts,
  NoticiaDisponivel,
  Periodo,
  PostDoPainel,
} from '@/components/blog-admin/tipos'

/* =========================================================================
   OS DADOS DO PAINEL DO BLOG (pacote do redesenho de 30/10/2026)

   As telas de components/blog-admin recebem os tipos de tipos.ts. Aqui
   ficam os formatos que a API do blog (/blog/api) devolve DE VERDADE e a
   conversao de um para o outro. Conferido no backend
   (/opt/tribhus_blog/backend/src/routes e controllers) em 31/10/2026.

   Este arquivo NAO importa nada do servidor: serve as paginas (via
   painel-servidor.ts) e as acoes do navegador (acoes.ts), que precisam das
   mesmas conversoes depois de ligar o scheduler, atualizar as noticias etc.
   ========================================================================= */

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

/* ---------------------------------------------------------------- chamada */

export type Resposta<T> = { ok: true; valor: T; status: number } | { ok: false; erro: string; status: number }

/* Nome legivel dos campos que o zod do backend recusa ("Dados invalidos"). */
const NOME_DO_CAMPO: Record<string, string> = {
  title: 'Título', slug: 'Slug', excerpt: 'Resumo', content: 'Conteúdo', coverImage: 'Imagem de capa',
  imageCredit: 'Crédito da imagem', imageCreditUrl: 'Link do crédito', categoryId: 'Categoria', authorId: 'Autor',
  tagIds: 'Tags', status: 'Status', scheduledAt: 'Data de publicação', metaTitle: 'Meta Title (máx. 70)',
  metaDescription: 'Meta Description (máx. 170)', focusKeyword: 'Palavra-chave (máx. 100)',
}

/** A mensagem que a API mandou. "Dados invalidos" ganha os campos recusados. */
export async function mensagemDaApi(res: Response, padrao: string): Promise<string> {
  const corpo = (await res.json().catch(() => null)) as
    | { error?: string; message?: string; details?: { path?: (string | number)[] }[] }
    | null
  if (res.status === 401) return 'Sua sessão expirou. Entre de novo no painel.'
  const msg = corpo?.error || corpo?.message || padrao
  const campos = Array.isArray(corpo?.details)
    ? [...new Set(corpo!.details.map((d) => String(d.path?.[0] ?? '')).filter(Boolean))].map((c) => NOME_DO_CAMPO[c] ?? c)
    : []
  return campos.length ? `${msg}: ${campos.join(', ')}` : msg
}

/** Chama a API do blog com o token do painel. Nunca lança: devolve ok/erro. */
export async function chamarApi<T>(
  token: string | undefined,
  caminho: string,
  init: RequestInit & { erroPadrao?: string } = {},
): Promise<Resposta<T>> {
  const { erroPadrao = 'Não deu certo. Tente de novo.', headers, ...resto } = init
  try {
    const res = await fetch(`${API_URL}/api${caminho}`, {
      ...resto,
      headers: {
        ...(resto.body && !(resto.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    })
    if (!res.ok) return { ok: false, erro: await mensagemDaApi(res, erroPadrao), status: res.status }
    return { ok: true, valor: (await res.json()) as T, status: res.status }
  } catch {
    return { ok: false, erro: 'Sem conexão com a API do blog. Tente de novo.', status: 0 }
  }
}

/* ---------------------------------------------------------------- formatos da API */

export interface UsuarioDaApi { id: string; name: string; email: string; isAdmin: boolean; avatar?: string | null }

/** /admin/stats */
export interface StatsDaApi {
  totalPosts: number; publishedPosts: number; draftPosts: number; scheduledPosts: number; totalViews: number
}

/** /admin/posts */
export interface PaginaDaApi<T> { data: T[]; pagination: { page: number; limit: number; total: number; totalPages: number } }

export type PeriodoDaApi = '24h' | '7d' | '30d' | '90d' | '365d' | 'all'

export interface OverviewDaApi {
  views: number; uniqueVisitors: number; readers: number; avgTimeOnPage: number; avgScrollDepth: number; botViews: number
  deltas: { views: number | null; uniqueVisitors: number | null; readers: number | null; avgTimeOnPage: number | null; avgScrollDepth: number | null } | null
}
export interface PontoDaApi { day: string; views: number; uniques?: number }
export interface TopPostDaApi { id: string; title: string; slug: string; views: number; uniques: number; avgTimeOnPage: number; avgScrollDepth: number }
export interface FonteDaApi { source: string; views: number }
export interface RotuloDaApi { label: string; views: number }
export interface DevicesDaApi { devices: RotuloDaApi[]; browsers: RotuloDaApi[]; os: RotuloDaApi[] }
export interface GeoDaApi { regions: RotuloDaApi[]; cities: RotuloDaApi[]; countries: RotuloDaApi[]; pendingGeo: number }
export interface DetalheDoPostDaApi {
  post: { id: string; title: string; slug: string; totalViews: number }
  kpis: { views: number; uniqueVisitors: number; avgTimeOnPage: number; avgScrollDepth: number }
  sources: FonteDaApi[]
  devices: RotuloDaApi[]
  timeseries: PontoDaApi[]
}

/** /ai/scheduler/status */
export interface SchedulerDaApi {
  scheduler: { enabled: boolean; nextRun: string | null; lastRun: string | null; isJobRunning: boolean }
  config: { claudeConfigured: boolean; tavilyConfigured: boolean; searchMode: 'tavily' | 'rss'; schedule: string; maxArticlesPerRun: number }
  todayCategory: { slug: string; name: string }
  editorialCalendar: { day: string; category: string }[]
  alerts: { type: string; message: string }[]
}

/** /ai/news/preview */
export interface PreviewDaApi { count: number; news: { title: string; source: string; pubDate: string; link: string; hasImage: boolean }[] }

/* ---------------------------------------------------------------- conversoes */

export const paraEstatisticas = (s: StatsDaApi): Estatisticas => ({
  totalPosts: s.totalPosts, publishedPosts: s.publishedPosts, draftPosts: s.draftPosts, totalViews: s.totalViews,
})

/* O post da API ja usa os nomes de PostDoPainel (title, slug, coverImage...).
   So garante os campos obrigatorios. */
export const paraPost = (p: PostDoPainel): PostDoPainel => ({ ...p, views: p.views ?? 0, featured: !!p.featured, tags: p.tags ?? [] })

export const paraListaDePosts = (r: PaginaDaApi<PostDoPainel>): ListaDePosts => ({
  posts: r.data.map(paraPost),
  total: r.pagination.total,
  page: r.pagination.page,
  totalPages: Math.max(1, r.pagination.totalPages),
})

export const paraCategoria = (c: CategoriaDoPainel): CategoriaDoPainel => ({
  id: c.id, name: c.name, slug: c.slug, description: c.description ?? null, color: c.color ?? null, postCount: c.postCount ?? 0,
})

/* O periodo da tela ("1y") e o da API ("365d"). */
export function periodoDaApi(p: Periodo): PeriodoDaApi {
  return p === '1y' ? '365d' : p
}
const PERIODOS_DA_TELA: Periodo[] = ['24h', '7d', '30d', '90d', '1y', 'all']
export function lerPeriodo(v?: string | string[]): Periodo {
  const s = Array.isArray(v) ? v[0] : v
  return PERIODOS_DA_TELA.includes(s as Periodo) ? (s as Periodo) : '30d'
}

/* As mesmas etiquetas do painel antigo (AnalyticsCharts.tsx), com acento. */
const NOME_DA_FONTE: Record<string, string> = {
  organic_google: 'Busca Google', google_discover: 'Google Discover', organic_bing: 'Busca Bing',
  organic_duckduckgo: 'DuckDuckGo', organic_other: 'Outras buscas', direct: 'Direto', internal: 'Interno (blog)',
  referral: 'Referência (links)', email: 'E-mail / Newsletter', paid: 'Anúncios (pago)',
  social_instagram: 'Instagram', social_facebook: 'Facebook', social_x: 'X / Twitter', social_tiktok: 'TikTok',
  social_youtube: 'YouTube', social_linkedin: 'LinkedIn', social_whatsapp: 'WhatsApp', social_reddit: 'Reddit',
  social_telegram: 'Telegram',
}
export function nomeDaFonte(f: string) {
  if (NOME_DA_FONTE[f]) return NOME_DA_FONTE[f]
  if (f.startsWith('social_')) return f.replace('social_', '').replace(/^./, (c) => c.toUpperCase())
  return f
}
const NOME_DO_APARELHO: Record<string, string> = { mobile: 'Celular', desktop: 'Desktop', tablet: 'Tablet' }

function fatias(itens: { nome: string; total: number }[]): Fatia[] {
  const soma = itens.reduce((s, f) => s + f.total, 0) || 1
  return itens.map((f) => ({ ...f, pct: Math.round((f.total / soma) * 100) }))
}
const deRotulos = (l: RotuloDaApi[], nome: (s: string) => string = (s) => s) => fatias(l.map((x) => ({ nome: nome(x.label), total: x.views })))
const deFontes = (l: FonteDaApi[]) => fatias(l.map((x) => ({ nome: nomeDaFonte(x.source), total: x.views })))
const aparelho = (s: string) => NOME_DO_APARELHO[s] ?? s

export function paraAnalytics(a: {
  overview: OverviewDaApi; timeseries: PontoDaApi[]; topPosts: TopPostDaApi[]; sources: FonteDaApi[]; devices: DevicesDaApi; geo: GeoDaApi
}): AnalyticsDoBlog {
  const o = a.overview
  const d = o.deltas
  return {
    geral: {
      views: { valor: o.views, variacao: d?.views ?? null },
      leitores: { valor: o.readers, variacao: d?.readers ?? null },
      unicos: { valor: o.uniqueVisitors, variacao: d?.uniqueVisitors ?? null },
      tempoMedio: { valor: o.avgTimeOnPage, variacao: d?.avgTimeOnPage ?? null },
      scrollMedio: { valor: o.avgScrollDepth, variacao: d?.avgScrollDepth ?? null },
      bots: o.botViews,
    },
    tempo: a.timeseries.map((p) => ({ dia: p.day, views: p.views, unicos: p.uniques ?? 0 })),
    fontes: deFontes(a.sources),
    aparelhos: deRotulos(a.devices.devices, aparelho),
    // o painel antigo mostrava os cinco primeiros navegadores
    navegadores: deRotulos(a.devices.browsers.slice(0, 5)),
    estados: deRotulos(a.geo.regions),
    cidades: deRotulos(a.geo.cities),
    paises: deRotulos(a.geo.countries),
    maisLidos: a.topPosts.map((p) => ({
      id: p.id, title: p.title, views: p.views, unicos: p.uniques, tempoMedio: p.avgTimeOnPage, scrollMedio: p.avgScrollDepth,
    })),
  }
}

/* A serie de um post so tem views por dia (a API nao manda unicos por dia). */
export function paraAnalyticsDoPost(r: DetalheDoPostDaApi): AnalyticsDoPost {
  return {
    id: r.post.id,
    title: r.post.title,
    slug: r.post.slug,
    views: r.kpis.views,
    totalHistorico: r.post.totalViews,
    unicos: r.kpis.uniqueVisitors,
    tempoMedio: r.kpis.avgTimeOnPage,
    scrollMedio: r.kpis.avgScrollDepth,
    tempo: r.timeseries.map((p) => ({ dia: p.day, views: p.views, unicos: p.uniques ?? 0 })),
    fontes: deFontes(r.sources),
    aparelhos: deRotulos(r.devices, aparelho),
  }
}

/* ---------------------------------------------------------------- a IA */

/* O backend escreve sem acento ("Noticias", "Terca"). Na tela vai com. */
const COM_ACENTO: Record<string, string> = {
  Noticias: 'Notícias', Lancamentos: 'Lançamentos', Terca: 'Terça', Sabado: 'Sábado',
}
const acento = (s: string) => COM_ACENTO[s] ?? s
const DIA_CURTO: Record<string, string> = {
  Domingo: 'Dom', Segunda: 'Seg', Terca: 'Ter', Quarta: 'Qua', Quinta: 'Qui', Sexta: 'Sex', Sabado: 'Sáb',
}

const quando = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo',
      })
    : null

export function paraEstadoDaIA(s: SchedulerDaApi): EstadoDaIA {
  return {
    ligado: s.scheduler.enabled,
    // config.schedule vem como "Todo dia as 06:00"
    horario: s.config.schedule.match(/\d{1,2}:\d{2}/)?.[0] ?? s.config.schedule,
    proxima: quando(s.scheduler.nextRun),
    ultima: quando(s.scheduler.lastRun),
    porExecucao: s.config.maxArticlesPerRun,
    hoje: acento(s.todayCategory.name),
    modo: s.config.searchMode,
    claudeConfigurado: s.config.claudeConfigured,
    alertas: s.alerts.map((a) => a.message),
  }
}

export function paraCalendario(s: SchedulerDaApi): { dia: string; tema: string }[] {
  return s.editorialCalendar.map((d) => ({ dia: DIA_CURTO[d.day] ?? d.day.slice(0, 3), tema: acento(d.category) }))
}

/** O dia da semana em Sao Paulo (0 = domingo), o mesmo relogio do scheduler. */
export function diaDaSemanaEmSaoPaulo(agora = new Date()): number {
  const d = agora.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'America/Sao_Paulo' })
  return Math.max(0, ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(d))
}

/* As categorias da geracao manual sao as do gerador (CATEGORY_CONFIGS do
   backend), nao as categorias do blog. Mesma lista do painel antigo. */
export const CATEGORIAS_DA_IA: CategoriaDoPainel[] = [
  { id: 'noticias', slug: 'noticias', name: 'Notícias' },
  { id: 'lancamentos', slug: 'lancamentos', name: 'Lançamentos' },
  { id: 'novidades', slug: 'novidades', name: 'Novidades' },
  { id: 'tecnologia', slug: 'tecnologia', name: 'Tecnologia' },
  { id: 'eventos', slug: 'eventos', name: 'Eventos' },
  { id: 'curiosidades', slug: 'curiosidades', name: 'Curiosidades' },
  { id: 'internacional', slug: 'internacional', name: 'Internacional' },
]

function dataCurta(v: string) {
  const d = v ? new Date(v) : null
  if (!d || Number.isNaN(d.getTime())) return v || ''
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'America/Sao_Paulo' })
}

export function paraNoticias(r: PreviewDaApi): NoticiaDisponivel[] {
  return r.news.map((n) => ({
    titulo: n.title,
    fonte: n.source,
    data: dataCurta(n.pubDate),
    comImagem: n.hasImage,
  }))
}

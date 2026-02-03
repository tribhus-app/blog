import cron from 'node-cron'
import { getNewsForToday, getEnrichedNewsForToday } from '../news/newsAggregator'
import { generateAndSaveNewsArticle, generateAndSaveEnrichedArticle } from '../ai/articleGenerator'
import { isClaudeConfigured } from '../ai/claude'
import { isTavilyConfigured } from '../news/tavilyService'
import { JobStatus, MAX_ARTICLES_PER_RUN, CRON_TIMEZONE, getTodayCategory, EDITORIAL_CALENDAR, CATEGORY_CONFIGS, DayOfWeek } from '../../types/ai'

// Estado dos jobs
const jobsState: Record<string, JobStatus> = {
  newsGeneration: {
    name: 'Geracao de Artigos de Noticias',
    lastRun: null,
    nextRun: null,
    isRunning: false,
  },
}

// Alertas pendentes (para notificar admin)
const pendingAlerts: Array<{ type: string; message: string; timestamp: Date }> = []

/**
 * Adiciona um alerta para o admin
 */
function addAlert(type: string, message: string): void {
  pendingAlerts.push({ type, message, timestamp: new Date() })
  // Mantem apenas os ultimos 10 alertas
  if (pendingAlerts.length > 10) {
    pendingAlerts.shift()
  }
}

/**
 * Retorna alertas pendentes
 */
export function getPendingAlerts(): Array<{ type: string; message: string; timestamp: Date }> {
  return [...pendingAlerts]
}

/**
 * Limpa alertas
 */
export function clearAlerts(): void {
  pendingAlerts.length = 0
}

// Referencia ao job agendado
let newsGenerationJob: cron.ScheduledTask | null = null

// Flag para controle do scheduler
let schedulerEnabled = false

/**
 * Job de geracao de artigos de noticias - usa calendario editorial
 * Usa Tavily para busca enriquecida quando disponivel
 */
async function runNewsGenerationJob(): Promise<void> {
  const jobState = jobsState.newsGeneration

  if (jobState.isRunning) {
    console.log('Job de noticias ja esta em execucao, pulando...')
    return
  }

  if (!isClaudeConfigured()) {
    console.log('Claude API nao configurada, pulando job de noticias')
    return
  }

  console.log('=== Iniciando job de geracao de artigos ===')
  console.log(`Tavily configurado: ${isTavilyConfigured() ? 'SIM' : 'NAO (usando RSS fallback)'}`)

  jobState.isRunning = true
  jobState.lastRun = new Date()

  const errors: string[] = []
  let articlesGenerated = 0

  try {
    // Usa sistema Tavily (novo) quando disponivel, senao usa RSS (legado)
    if (isTavilyConfigured()) {
      // === NOVO SISTEMA COM TAVILY ===
      console.log('\n>>> Usando sistema Tavily com fontes enriquecidas <<<\n')
      console.log('>>> Regras anti-alucinacao ATIVAS <<<\n')

      const { category, enrichedNews } = await getEnrichedNewsForToday(MAX_ARTICLES_PER_RUN)
      console.log(`Categoria do dia: ${category.name}`)
      console.log(`${enrichedNews.length} noticias enriquecidas para geracao`)

      if (enrichedNews.length === 0) {
        console.log('Nenhuma noticia encontrada para a categoria do dia')
        errors.push(`Nenhuma noticia encontrada para categoria: ${category.name}`)
      }

      // Gera artigos para cada noticia enriquecida
      for (const enrichedItem of enrichedNews) {
        try {
          console.log(`\nProcessando: ${enrichedItem.news.title}`)

          const result = await generateAndSaveEnrichedArticle(enrichedItem, category)

          if (result.success) {
            articlesGenerated++
            console.log(`Artigo gerado com sucesso: ${result.articleId}`)
          } else {
            console.log(`Falha ao gerar artigo: ${result.error}`)
            if (result.error && !result.error.includes('ja existe')) {
              errors.push(`${enrichedItem.news.title}: ${result.error}`)
            }
          }

          // Pequeno delay entre geracoes para nao sobrecarregar a API
          await new Promise((resolve) => setTimeout(resolve, 2000))
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido'
          console.error(`Erro ao processar noticia ${enrichedItem.news.title}:`, error)
          errors.push(`${enrichedItem.news.title}: ${errorMsg}`)
        }
      }
    } else {
      // === SISTEMA LEGADO COM RSS ===
      console.log('\n!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
      console.log('!!! ALERTA: Tavily NAO configurado - usando RSS !!!')
      console.log('!!! Configure TAVILY_API_KEY para busca enriquecida')
      console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n')

      // Adiciona alerta para o admin
      addAlert(
        'TAVILY_FALLBACK',
        'Sistema usando RSS como fallback. TAVILY_API_KEY nao configurada ou invalida. Configure para ter busca enriquecida com multiplas fontes e regras anti-alucinacao.'
      )

      const { category, news } = await getNewsForToday(MAX_ARTICLES_PER_RUN)
      console.log(`Categoria do dia: ${category.name}`)
      console.log(`${news.length} noticias selecionadas para geracao`)

      if (news.length === 0) {
        console.log('Nenhuma noticia encontrada para a categoria do dia')
        errors.push(`Nenhuma noticia encontrada para categoria: ${category.name}`)
      }

      // Gera artigos para cada noticia (sistema legado)
      for (const newsItem of news) {
        try {
          console.log(`\nProcessando: ${newsItem.title}`)

          const result = await generateAndSaveNewsArticle(newsItem, category)

          if (result.success) {
            articlesGenerated++
            console.log(`Artigo gerado com sucesso: ${result.articleId}`)
          } else {
            console.log(`Falha ao gerar artigo: ${result.error}`)
            if (result.error && !result.error.includes('ja existe')) {
              errors.push(`${newsItem.title}: ${result.error}`)
            }
          }

          // Pequeno delay entre geracoes para nao sobrecarregar a API
          await new Promise((resolve) => setTimeout(resolve, 2000))
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido'
          console.error(`Erro ao processar noticia ${newsItem.title}:`, error)
          errors.push(`${newsItem.title}: ${errorMsg}`)
        }
      }
    }
  } catch (error) {
    console.error('Erro no job de noticias:', error)
    errors.push(`Erro geral: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
  } finally {
    jobState.isRunning = false
    jobState.lastResult = {
      success: errors.length === 0,
      articlesGenerated,
      errors: errors.length > 0 ? errors : undefined,
    }

    console.log(`=== Job finalizado: ${articlesGenerated} artigos gerados ===`)
    if (errors.length > 0) {
      console.log('Erros encontrados:', errors)
    }
  }
}

/**
 * Calcula a proxima execucao do job (06:00)
 */
function calculateNextRun(): Date {
  const now = new Date()
  const nextRun = new Date()
  nextRun.setHours(6, 0, 0, 0)
  if (nextRun <= now) {
    nextRun.setDate(nextRun.getDate() + 1)
  }
  return nextRun
}

/**
 * Inicializa os jobs agendados
 */
export function initializeScheduler(): void {
  if (schedulerEnabled && newsGenerationJob) {
    console.log('Scheduler ja esta ativo')
    return
  }

  console.log('Inicializando scheduler de jobs...')

  // Job diario as 06:00 (horario de Sao Paulo)
  // Formato: segundo minuto hora dia mes dia-da-semana
  newsGenerationJob = cron.schedule(
    '0 6 * * *', // Todo dia as 06:00
    () => {
      console.log('Executando job agendado de noticias')
      runNewsGenerationJob()
    },
    {
      scheduled: true,
      timezone: CRON_TIMEZONE,
    }
  )

  schedulerEnabled = true
  jobsState.newsGeneration.nextRun = calculateNextRun()

  console.log(`Job de noticias agendado para ${CRON_TIMEZONE}`)
  console.log(`Proxima execucao: ${jobsState.newsGeneration.nextRun.toISOString()}`)
}

/**
 * Inicia o scheduler manualmente
 */
export function startScheduler(): { success: boolean; message: string } {
  if (!isClaudeConfigured()) {
    return {
      success: false,
      message: 'CLAUDE_API_KEY nao configurada. Configure a chave para ativar o scheduler.',
    }
  }

  if (schedulerEnabled && newsGenerationJob) {
    return {
      success: false,
      message: 'Scheduler ja esta ativo',
    }
  }

  initializeScheduler()

  return {
    success: true,
    message: `Scheduler iniciado. Proxima execucao: ${jobsState.newsGeneration.nextRun?.toISOString()}`,
  }
}

/**
 * Para todos os jobs agendados
 */
export function stopScheduler(): { success: boolean; message: string } {
  if (!schedulerEnabled || !newsGenerationJob) {
    return {
      success: false,
      message: 'Scheduler ja esta parado',
    }
  }

  newsGenerationJob.stop()
  newsGenerationJob = null
  schedulerEnabled = false
  jobsState.newsGeneration.nextRun = null

  console.log('Scheduler parado')

  return {
    success: true,
    message: 'Scheduler parado com sucesso. Nenhum artigo sera gerado automaticamente.',
  }
}

/**
 * Executa o job de noticias manualmente
 */
export async function runNewsJobManually(): Promise<{
  success: boolean
  articlesGenerated: number
  errors?: string[]
}> {
  await runNewsGenerationJob()
  return jobsState.newsGeneration.lastResult || {
    success: false,
    articlesGenerated: 0,
    errors: ['Job nao executado'],
  }
}

/**
 * Retorna o status de todos os jobs
 */
export function getJobsStatus(): Record<string, JobStatus> {
  return { ...jobsState }
}

/**
 * Verifica se o scheduler esta ativo
 */
export function isSchedulerRunning(): boolean {
  return schedulerEnabled && newsGenerationJob !== null
}

/**
 * Retorna status detalhado do scheduler
 */
export function getSchedulerStatus(): {
  enabled: boolean
  nextRun: Date | null
  lastRun: Date | null
  isJobRunning: boolean
  claudeConfigured: boolean
  tavilyConfigured: boolean
  searchMode: 'tavily' | 'rss'
  todayCategory: { slug: string; name: string }
  editorialCalendar: { day: string; category: string }[]
  alerts: Array<{ type: string; message: string; timestamp: Date }>
} {
  const todayCategory = getTodayCategory()
  const tavilyConfigured = isTavilyConfigured()

  // Monta o calendario para exibicao
  const dayNames = ['Domingo', 'Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta', 'Sabado']
  const editorialCalendar = dayNames.map((dayName, index) => {
    const categorySlug = EDITORIAL_CALENDAR[index as DayOfWeek]
    const categoryConfig = CATEGORY_CONFIGS[categorySlug]
    return {
      day: dayName,
      category: categoryConfig.name,
    }
  })

  // Se Tavily nao esta configurado, adiciona alerta preventivo
  if (!tavilyConfigured && pendingAlerts.every(a => a.type !== 'TAVILY_NOT_CONFIGURED')) {
    addAlert(
      'TAVILY_NOT_CONFIGURED',
      'TAVILY_API_KEY nao esta configurada. O sistema usara RSS como fallback, que tem menos fontes e maior risco de alucinacao.'
    )
  }

  return {
    enabled: schedulerEnabled,
    nextRun: jobsState.newsGeneration.nextRun,
    lastRun: jobsState.newsGeneration.lastRun,
    isJobRunning: jobsState.newsGeneration.isRunning,
    claudeConfigured: isClaudeConfigured(),
    tavilyConfigured,
    searchMode: tavilyConfigured ? 'tavily' : 'rss',
    todayCategory: {
      slug: todayCategory.slug,
      name: todayCategory.name,
    },
    editorialCalendar,
    alerts: getPendingAlerts(),
  }
}

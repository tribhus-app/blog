import { Request, Response } from 'express'
import {
  generateAndSaveWelcomeArticle,
  generateAndSaveNewsArticle,
  generateAndSaveEnrichedArticle,
  getBandDataById,
} from '../services/ai/articleGenerator'
import { isClaudeConfigured } from '../services/ai/claude'
import {
  runNewsJobManually,
  getJobsStatus,
  startScheduler,
  stopScheduler,
  getSchedulerStatus,
} from '../services/cron/scheduler'
import {
  getTopNewsForArticles,
  getNewsForCategory,
  getNewsForToday,
  getEnrichedNewsForToday,
  getEnrichedNewsForCategory,
} from '../services/news/newsAggregator'
import { isTavilyConfigured } from '../services/news/tavilyService'
import { WebhookPayload, BandData, CATEGORY_CONFIGS, CategoryConfig } from '../types/ai'

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'tribhus-webhook-secret-2025'

/**
 * Verifica se o webhook secret e valido
 */
function validateWebhookSecret(req: Request): boolean {
  const secret = req.headers['x-webhook-secret'] || req.headers['authorization']?.replace('Bearer ', '')
  return secret === WEBHOOK_SECRET
}

/**
 * Webhook para nova banda cadastrada
 * POST /api/ai/webhook/new-band
 */
export async function webhookNewBand(req: Request, res: Response) {
  try {
    // Valida o secret
    if (!validateWebhookSecret(req)) {
      return res.status(401).json({ error: 'Webhook secret invalido' })
    }

    // Valida se Claude esta configurado
    if (!isClaudeConfigured()) {
      return res.status(503).json({ error: 'Servico de IA nao configurado' })
    }

    const payload = req.body as WebhookPayload

    // Valida payload
    if (!payload.data || !payload.data.name) {
      return res.status(400).json({ error: 'Payload invalido: dados da banda ausentes' })
    }

    console.log(`Webhook recebido: nova banda ${payload.data.name}`)

    // Gera artigo de boas-vindas
    const result = await generateAndSaveWelcomeArticle(payload.data)

    if (result.success) {
      res.status(201).json({
        success: true,
        message: 'Artigo de boas-vindas gerado com sucesso',
        articleId: result.articleId,
      })
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
      })
    }
  } catch (error) {
    console.error('Erro no webhook new-band:', error)
    res.status(500).json({ error: 'Erro interno ao processar webhook' })
  }
}

/**
 * Gera artigos de noticias manualmente (admin)
 * POST /api/ai/generate/news
 * Body: { category?: string } - slug da categoria (opcional, usa categoria do dia se nao informado)
 *
 * Usa Tavily quando disponivel para busca enriquecida com multiplas fontes
 */
export async function generateNewsArticles(req: Request, res: Response) {
  try {
    // Valida se Claude esta configurado
    if (!isClaudeConfigured()) {
      return res.status(503).json({ error: 'Servico de IA nao configurado' })
    }

    const { category: categorySlug } = req.body
    const useTavily = isTavilyConfigured()

    console.log(`Modo de busca: ${useTavily ? 'Tavily (enriquecido)' : 'RSS (legado)'}`)

    // Se categoria foi especificada, usa ela, senao usa a do dia
    let category: CategoryConfig
    if (categorySlug && CATEGORY_CONFIGS[categorySlug]) {
      category = CATEGORY_CONFIGS[categorySlug]
      console.log(`Geracao manual para categoria especifica: ${category.name}`)
    } else {
      const todayData = await getNewsForToday(3)
      category = todayData.category
      console.log(`Geracao manual para categoria do dia: ${category.name}`)
    }

    let articlesGenerated = 0
    let articlesSkipped = 0
    const errors: string[] = []

    if (useTavily) {
      // === NOVO SISTEMA COM TAVILY ===
      const enrichedNews = await getEnrichedNewsForCategory(category, 3)
      console.log(`${enrichedNews.length} noticias enriquecidas encontradas para ${category.name}`)

      if (enrichedNews.length === 0) {
        return res.json({
          success: false,
          articlesGenerated: 0,
          category: category.name,
          searchMode: 'tavily',
          error: `Nenhuma noticia encontrada para categoria: ${category.name}`,
        })
      }

      // Gera artigos com fontes enriquecidas
      for (const enrichedItem of enrichedNews) {
        try {
          const result = await generateAndSaveEnrichedArticle(enrichedItem, category)
          if (result.success) {
            articlesGenerated++
          } else if (result.error && result.error.includes('ja existe')) {
            articlesSkipped++
          } else if (result.error) {
            errors.push(result.error)
          }
        } catch (error) {
          errors.push(error instanceof Error ? error.message : 'Erro desconhecido')
        }
      }
    } else {
      // === SISTEMA LEGADO COM RSS ===
      const news = await getNewsForCategory(category, 3)
      console.log(`${news.length} noticias encontradas para ${category.name}`)

      if (news.length === 0) {
        return res.json({
          success: false,
          articlesGenerated: 0,
          category: category.name,
          searchMode: 'rss',
          error: `Nenhuma noticia encontrada para categoria: ${category.name}`,
        })
      }

      // Gera artigos (sistema legado)
      for (const newsItem of news) {
        try {
          const result = await generateAndSaveNewsArticle(newsItem, category)
          if (result.success) {
            articlesGenerated++
          } else if (result.error && result.error.includes('ja existe')) {
            articlesSkipped++
          } else if (result.error) {
            errors.push(result.error)
          }
        } catch (error) {
          errors.push(error instanceof Error ? error.message : 'Erro desconhecido')
        }
      }
    }

    // Se todos foram pulados por ja existirem, retorna mensagem informativa
    if (articlesGenerated === 0 && articlesSkipped > 0 && errors.length === 0) {
      return res.json({
        success: true,
        articlesGenerated: 0,
        articlesSkipped,
        category: category.name,
        searchMode: useTavily ? 'tavily' : 'rss',
        message: `Todas as ${articlesSkipped} noticias encontradas ja possuem artigos gerados. Aguarde novas noticias ou tente outra categoria.`,
      })
    }

    res.json({
      success: articlesGenerated > 0 || (articlesSkipped > 0 && errors.length === 0),
      articlesGenerated,
      articlesSkipped,
      category: category.name,
      searchMode: useTavily ? 'tavily' : 'rss',
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error('Erro na geracao manual de noticias:', error)
    res.status(500).json({ error: 'Erro interno ao gerar artigos' })
  }
}

/**
 * Gera artigo de boas-vindas para uma banda (admin)
 * POST /api/ai/generate/welcome/:bandId
 */
export async function generateWelcomeArticle(req: Request, res: Response) {
  try {
    const bandId = parseInt(req.params.bandId)

    if (isNaN(bandId)) {
      return res.status(400).json({ error: 'ID da banda invalido' })
    }

    // Valida se Claude esta configurado
    if (!isClaudeConfigured()) {
      return res.status(503).json({ error: 'Servico de IA nao configurado' })
    }

    // Busca dados da banda
    const bandData = await getBandDataById(bandId)

    if (!bandData) {
      return res.status(404).json({ error: 'Banda nao encontrada' })
    }

    console.log(`Geracao manual de artigo de boas-vindas para banda: ${bandData.name}`)

    // Gera o artigo
    const result = await generateAndSaveWelcomeArticle(bandData)

    if (result.success) {
      res.status(201).json({
        success: true,
        message: 'Artigo de boas-vindas gerado com sucesso',
        articleId: result.articleId,
        band: bandData.name,
      })
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
      })
    }
  } catch (error) {
    console.error('Erro na geracao de boas-vindas:', error)
    res.status(500).json({ error: 'Erro interno ao gerar artigo' })
  }
}

/**
 * Retorna status dos jobs de IA
 * GET /api/ai/jobs/status
 */
export async function getAiJobsStatus(req: Request, res: Response) {
  try {
    const status = getJobsStatus()

    res.json({
      claudeConfigured: isClaudeConfigured(),
      jobs: status,
    })
  } catch (error) {
    console.error('Erro ao buscar status dos jobs:', error)
    res.status(500).json({ error: 'Erro interno ao buscar status' })
  }
}

/**
 * Preview de noticias agregadas (admin)
 * GET /api/ai/news/preview
 */
export async function previewAggregatedNews(req: Request, res: Response) {
  try {
    const limit = parseInt(req.query.limit as string) || 10

    const news = await getTopNewsForArticles(limit)

    res.json({
      count: news.length,
      news: news.map((item) => ({
        title: item.title,
        source: item.source,
        pubDate: item.pubDate,
        link: item.link,
        hasImage: !!item.imageUrl,
      })),
    })
  } catch (error) {
    console.error('Erro ao buscar preview de noticias:', error)
    res.status(500).json({ error: 'Erro interno ao buscar noticias' })
  }
}

/**
 * Inicia o scheduler automatico (admin)
 * POST /api/ai/scheduler/start
 */
export async function startAiScheduler(req: Request, res: Response) {
  try {
    const result = startScheduler()

    if (result.success) {
      res.json(result)
    } else {
      res.status(400).json(result)
    }
  } catch (error) {
    console.error('Erro ao iniciar scheduler:', error)
    res.status(500).json({ error: 'Erro interno ao iniciar scheduler' })
  }
}

/**
 * Para o scheduler automatico (admin)
 * POST /api/ai/scheduler/stop
 */
export async function stopAiScheduler(req: Request, res: Response) {
  try {
    const result = stopScheduler()

    if (result.success) {
      res.json(result)
    } else {
      res.status(400).json(result)
    }
  } catch (error) {
    console.error('Erro ao parar scheduler:', error)
    res.status(500).json({ error: 'Erro interno ao parar scheduler' })
  }
}

/**
 * Retorna status detalhado do scheduler (admin)
 * GET /api/ai/scheduler/status
 */
export async function getAiSchedulerStatus(req: Request, res: Response) {
  try {
    const status = getSchedulerStatus()

    res.json({
      scheduler: {
        enabled: status.enabled,
        nextRun: status.nextRun,
        lastRun: status.lastRun,
        isJobRunning: status.isJobRunning,
      },
      config: {
        claudeConfigured: status.claudeConfigured,
        tavilyConfigured: status.tavilyConfigured,
        searchMode: status.searchMode,
        timezone: 'America/Sao_Paulo',
        schedule: 'Todo dia as 06:00',
        maxArticlesPerRun: 3,
      },
      searchInfo: {
        mode: status.searchMode,
        description: status.searchMode === 'tavily'
          ? 'Busca enriquecida com multiplas fontes (Tavily) - anti-alucinacao ativo'
          : 'ALERTA: Busca basica via RSS - configure TAVILY_API_KEY para busca enriquecida!',
      },
      todayCategory: status.todayCategory,
      editorialCalendar: status.editorialCalendar,
      // Alertas importantes para o admin
      alerts: status.alerts,
      hasAlerts: status.alerts.length > 0,
    })
  } catch (error) {
    console.error('Erro ao buscar status do scheduler:', error)
    res.status(500).json({ error: 'Erro interno ao buscar status' })
  }
}

import { Router } from 'express'
import {
  webhookNewBand,
  generateNewsArticles,
  generateWelcomeArticle,
  getAiJobsStatus,
  previewAggregatedNews,
  startAiScheduler,
  stopAiScheduler,
  getAiSchedulerStatus,
} from '../controllers/aiController'
import { authMiddleware, adminOnly } from '../middlewares/auth'

const router = Router()

// ========================================
// WEBHOOK (autenticado por secret header)
// ========================================

/**
 * POST /api/ai/webhook/new-band
 * Webhook para nova banda cadastrada
 * Autenticacao: x-webhook-secret ou Authorization: Bearer <secret>
 */
router.post('/webhook/new-band', webhookNewBand)

// ========================================
// ROTAS ADMIN (requerem autenticacao admin)
// ========================================

/**
 * POST /api/ai/generate/news
 * Gera artigos de noticias manualmente
 * Body: { limit?: number } (default: 3)
 */
router.post('/generate/news', authMiddleware, adminOnly, generateNewsArticles)

/**
 * POST /api/ai/generate/welcome/:bandId
 * Gera artigo de boas-vindas para uma banda especifica
 */
router.post('/generate/welcome/:bandId', authMiddleware, adminOnly, generateWelcomeArticle)

/**
 * GET /api/ai/jobs/status
 * Retorna status dos jobs de IA
 */
router.get('/jobs/status', authMiddleware, adminOnly, getAiJobsStatus)

/**
 * GET /api/ai/news/preview
 * Preview das noticias agregadas
 * Query: limit (default: 10)
 */
router.get('/news/preview', authMiddleware, adminOnly, previewAggregatedNews)

// ========================================
// CONTROLE DO SCHEDULER (admin)
// ========================================

/**
 * POST /api/ai/scheduler/start
 * Liga o scheduler automatico de geracao de artigos
 */
router.post('/scheduler/start', authMiddleware, adminOnly, startAiScheduler)

/**
 * POST /api/ai/scheduler/stop
 * Desliga o scheduler automatico
 */
router.post('/scheduler/stop', authMiddleware, adminOnly, stopAiScheduler)

/**
 * GET /api/ai/scheduler/status
 * Retorna status detalhado do scheduler
 */
router.get('/scheduler/status', authMiddleware, adminOnly, getAiSchedulerStatus)

export default router

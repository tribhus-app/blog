import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import * as postsController from '../controllers/postsController'
import { authMiddleware, adminMiddleware } from '../middlewares/auth'

const router = Router()

// BAIXO-004: rate limit em /posts/:id/view para evitar inflation artificial
// de contagem de views. Key por IP+postId permite registros legitimos distribuidos.
const viewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 30, // 30 views/hora do mesmo IP no mesmo post
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || 'unknown'
    return `${ip}:${req.params.id}`
  },
  message: { error: 'Muitas visualizacoes deste post do mesmo IP.' },
})

// Rotas publicas
router.get('/', postsController.listPosts)
router.get('/featured', postsController.getFeaturedPosts)
router.get('/recent', postsController.getRecentPosts)
router.get('/popular', postsController.getPopularPosts)
router.get('/slug/:slug', postsController.getPostBySlug)
router.get('/category/:categorySlug', postsController.getPostsByCategory)

// Rotas protegidas (admin)
router.post('/', authMiddleware, adminMiddleware, postsController.createPost)
router.put('/:id', authMiddleware, adminMiddleware, postsController.updatePost)
router.delete('/:id', authMiddleware, adminMiddleware, postsController.deletePost)
router.patch('/:id/publish', authMiddleware, adminMiddleware, postsController.publishPost)
router.patch('/:id/unpublish', authMiddleware, adminMiddleware, postsController.unpublishPost)

// Registrar view (publico, rate-limited)
router.post('/:id/view', viewLimiter, postsController.incrementViews)

// Atualizar engajamento (tempo/scroll) ao sair do post — via sendBeacon, sem rate limit estrito
router.post('/view/:viewId/engagement', postsController.recordEngagement)

export default router

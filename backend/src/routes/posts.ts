import { Router } from 'express'
import * as postsController from '../controllers/postsController'
import { authMiddleware, adminMiddleware } from '../middlewares/auth'

const router = Router()

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

// Incrementar views (publico)
router.post('/:id/view', postsController.incrementViews)

export default router

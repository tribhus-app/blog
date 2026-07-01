import { Router } from 'express'
import * as analytics from '../controllers/analyticsController'
import { authMiddleware, adminMiddleware } from '../middlewares/auth'

const router = Router()

// Todas as rotas de analytics sao restritas a administradores.
router.use(authMiddleware, adminMiddleware)

router.get('/overview', analytics.getOverview)
router.get('/timeseries', analytics.getTimeseries)
router.get('/top-posts', analytics.getTopPosts)
router.get('/sources', analytics.getSources)
router.get('/devices', analytics.getDevices)
router.get('/geo', analytics.getGeo)
router.get('/posts/:id', analytics.getPostDetail)

export default router

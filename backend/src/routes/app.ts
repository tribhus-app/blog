import { Router } from 'express'
import { getAppVersion } from '../controllers/appVersionController'

const router = Router()

// GET /api/app/version?platform=android&current_version=1.2.3
router.get('/version', getAppVersion)

export default router

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'

import postsRoutes from './routes/posts'
import categoriesRoutes from './routes/categories'
import authorsRoutes from './routes/authors'
import tagsRoutes from './routes/tags'
import authRoutes from './routes/auth'
import searchRoutes from './routes/search'
import adminRoutes from './routes/admin'
import uploadRoutes from './routes/upload'
import aiRoutes from './routes/ai'
import { initializeScheduler } from './services/cron/scheduler'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Trust proxy for rate limiting behind nginx
app.set('trust proxy', 1)

// Security middlewares
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://blog.tribhus.com.br',
  credentials: true,
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // limite de 1000 requests por IP
  message: { error: 'Muitas requisicoes, tente novamente mais tarde.' },
})
app.use('/api/', limiter)

// Body parser
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API Routes
app.use('/api/posts', postsRoutes)
app.use('/api/categories', categoriesRoutes)
app.use('/api/authors', authorsRoutes)
app.use('/api/tags', tagsRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/search', searchRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/ai', aiRoutes)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Rota nao encontrada' })
})

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Erro:', err)
  res.status(500).json({ error: 'Erro interno do servidor' })
})

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/health`)

  // Scheduler de IA - desligado por padrao
  // Use POST /api/ai/scheduler/start para ativar
  if (process.env.CLAUDE_API_KEY) {
    console.log('CLAUDE_API_KEY configurada - scheduler de IA disponivel')
    console.log('Para ativar: POST /api/ai/scheduler/start')
  } else {
    console.log('CLAUDE_API_KEY nao configurada - scheduler de IA indisponivel')
  }
})

export default app

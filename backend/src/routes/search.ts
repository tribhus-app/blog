import { Router } from 'express'
import { prisma } from '../utils/prisma'

const router = Router()

// Busca por termo
router.get('/', async (req, res) => {
  try {
    const query = req.query.q as string
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10

    if (!query || query.length < 2) {
      return res.status(400).json({ error: 'Termo de busca deve ter pelo menos 2 caracteres' })
    }

    const where = {
      status: 'published' as const,
      publishedAt: { lte: new Date() },
      OR: [
        { title: { contains: query, mode: 'insensitive' as const } },
        { excerpt: { contains: query, mode: 'insensitive' as const } },
        { content: { contains: query, mode: 'insensitive' as const } },
      ],
    }

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        include: {
          category: true,
          author: { select: { id: true, name: true, slug: true, avatar: true, isAi: true } },
        },
        orderBy: { publishedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.blogPost.count({ where }),
    ])

    res.json({
      data: posts,
      query,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Erro na busca:', error)
    res.status(500).json({ error: 'Erro na busca' })
  }
})

export default router

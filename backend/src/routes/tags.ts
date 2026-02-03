import { Router } from 'express'
import { prisma } from '../utils/prisma'

const router = Router()

// Listar tags
router.get('/', async (req, res) => {
  try {
    const tags = await prisma.blogTag.findMany({
      include: { _count: { select: { posts: true } } },
      orderBy: { name: 'asc' },
    })

    const data = tags.map(tag => ({
      ...tag,
      postCount: tag._count.posts,
      _count: undefined,
    }))

    res.json({ data })
  } catch (error) {
    console.error('Erro ao listar tags:', error)
    res.status(500).json({ error: 'Erro ao listar tags' })
  }
})

// Posts por tag
router.get('/:slug/posts', async (req, res) => {
  try {
    const { slug } = req.params
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10

    const tag = await prisma.blogTag.findUnique({ where: { slug } })
    if (!tag) {
      return res.status(404).json({ error: 'Tag nao encontrada' })
    }

    const posts = await prisma.blogPost.findMany({
      where: {
        status: 'published',
        publishedAt: { lte: new Date() },
        tags: { some: { tagId: tag.id } },
      },
      include: {
        category: true,
        author: { select: { id: true, name: true, slug: true, avatar: true, isAi: true } },
      },
      orderBy: { publishedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    })

    res.json({ data: posts, tag })
  } catch (error) {
    console.error('Erro ao buscar posts por tag:', error)
    res.status(500).json({ error: 'Erro ao buscar posts por tag' })
  }
})

export default router

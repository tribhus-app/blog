import { Router } from 'express'
import { prisma } from '../utils/prisma'
import { authMiddleware, adminMiddleware } from '../middlewares/auth'
import slugify from 'slugify'

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

// Criar tag (admin). Se ja existe uma com o mesmo slug, devolve ela
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : ''
    if (!name) {
      return res.status(400).json({ error: 'Nome da tag e obrigatorio' })
    }
    if (name.length > 50) {
      return res.status(400).json({ error: 'Nome da tag com no maximo 50 caracteres' })
    }

    const slug = slugify(name, { lower: true, strict: true })
    if (!slug) {
      return res.status(400).json({ error: 'Nome da tag invalido' })
    }

    const existing = await prisma.blogTag.findUnique({ where: { slug } })
    if (existing) {
      return res.json({ data: existing })
    }

    const tag = await prisma.blogTag.create({ data: { name, slug } })
    res.status(201).json({ data: tag })
  } catch (error) {
    console.error('Erro ao criar tag:', error)
    res.status(500).json({ error: 'Erro ao criar tag' })
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

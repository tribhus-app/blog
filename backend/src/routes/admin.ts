import { Router } from 'express'
import { prisma } from '../utils/prisma'
import { authMiddleware, adminMiddleware } from '../middlewares/auth'

const router = Router()

// Todas as rotas de admin requerem autenticacao
router.use(authMiddleware, adminMiddleware)

// Dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const [
      totalPosts,
      publishedPosts,
      draftPosts,
      scheduledPosts,
      totalViews,
      totalCategories,
      totalAuthors,
      recentPosts,
    ] = await Promise.all([
      prisma.blogPost.count(),
      prisma.blogPost.count({ where: { status: 'published' } }),
      prisma.blogPost.count({ where: { status: 'draft' } }),
      prisma.blogPost.count({ where: { status: 'scheduled' } }),
      prisma.blogPost.aggregate({ _sum: { views: true } }),
      prisma.blogCategory.count(),
      prisma.blogAuthor.count(),
      prisma.blogPost.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          createdAt: true,
        },
      }),
    ])

    res.json({
      totalPosts,
      publishedPosts,
      draftPosts,
      scheduledPosts,
      totalViews: totalViews._sum.views || 0,
      totalCategories,
      totalAuthors,
      recentPosts,
    })
  } catch (error) {
    console.error('Erro ao buscar stats:', error)
    res.status(500).json({ error: 'Erro ao buscar estatisticas' })
  }
})

// Listar todos os posts (incluindo drafts)
router.get('/posts', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const status = req.query.status as string
    const categoryId = req.query.categoryId as string
    const search = req.query.search as string

    const where: any = {}

    if (status) {
      where.status = status as 'draft' | 'published' | 'scheduled'
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        include: {
          category: true,
          author: { select: { id: true, name: true, slug: true, avatar: true, isAi: true } },
          tags: { include: { tag: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.blogPost.count({ where }),
    ])

    const formattedPosts = posts.map(post => ({
      ...post,
      tags: post.tags.map(pt => pt.tag),
    }))

    res.json({
      data: formattedPosts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Erro ao listar posts:', error)
    res.status(500).json({ error: 'Erro ao listar posts' })
  }
})

// Posts pendentes de aprovacao (rascunhos criados por IA)
router.get('/posts/pending', async (req, res) => {
  try {
    const posts = await prisma.blogPost.findMany({
      where: {
        status: 'draft',
        author: { isAi: true },
      },
      include: {
        category: true,
        author: { select: { id: true, name: true, slug: true, avatar: true, isAi: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    res.json({ data: posts })
  } catch (error) {
    console.error('Erro ao buscar posts pendentes:', error)
    res.status(500).json({ error: 'Erro ao buscar posts pendentes' })
  }
})

// Buscar post por ID (admin)
router.get('/posts/:id', async (req, res) => {
  try {
    const { id } = req.params

    const post = await prisma.blogPost.findUnique({
      where: { id },
      include: {
        category: true,
        author: { select: { id: true, name: true, slug: true, avatar: true, isAi: true } },
        tags: { include: { tag: true } },
      },
    })

    if (!post) {
      return res.status(404).json({ error: 'Post nao encontrado' })
    }

    res.json({
      data: {
        ...post,
        tags: post.tags.map(pt => pt.tag),
      },
    })
  } catch (error) {
    console.error('Erro ao buscar post:', error)
    res.status(500).json({ error: 'Erro ao buscar post' })
  }
})

export default router

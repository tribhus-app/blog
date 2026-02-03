import { Router } from 'express'
import { prisma } from '../utils/prisma'
import { authMiddleware, adminMiddleware } from '../middlewares/auth'
import slugify from 'slugify'

const router = Router()

// Listar todas as categorias
router.get('/', async (req, res) => {
  try {
    const categories = await prisma.blogCategory.findMany({
      include: {
        _count: { select: { posts: true } },
      },
      orderBy: { name: 'asc' },
    })

    const data = categories.map(cat => ({
      ...cat,
      postCount: cat._count.posts,
      _count: undefined,
    }))

    res.json({ data })
  } catch (error) {
    console.error('Erro ao listar categorias:', error)
    res.status(500).json({ error: 'Erro ao listar categorias' })
  }
})

// Buscar categoria por slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params

    const category = await prisma.blogCategory.findUnique({
      where: { slug },
      include: {
        _count: { select: { posts: true } },
      },
    })

    if (!category) {
      return res.status(404).json({ error: 'Categoria nao encontrada' })
    }

    res.json({
      data: {
        ...category,
        postCount: category._count.posts,
        _count: undefined,
      },
    })
  } catch (error) {
    console.error('Erro ao buscar categoria:', error)
    res.status(500).json({ error: 'Erro ao buscar categoria' })
  }
})

// Criar categoria (admin)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, description, color } = req.body

    if (!name) {
      return res.status(400).json({ error: 'Nome e obrigatorio' })
    }

    const slug = slugify(name, { lower: true, strict: true })

    const existing = await prisma.blogCategory.findUnique({ where: { slug } })
    if (existing) {
      return res.status(400).json({ error: 'Categoria ja existe' })
    }

    const category = await prisma.blogCategory.create({
      data: { name, slug, description, color: color || '#914100' },
    })

    res.status(201).json({ data: category })
  } catch (error) {
    console.error('Erro ao criar categoria:', error)
    res.status(500).json({ error: 'Erro ao criar categoria' })
  }
})

// Atualizar categoria (admin)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const { name, description, color } = req.body

    const existing = await prisma.blogCategory.findUnique({ where: { id } })
    if (!existing) {
      return res.status(404).json({ error: 'Categoria nao encontrada' })
    }

    let slug = existing.slug
    if (name && name !== existing.name) {
      slug = slugify(name, { lower: true, strict: true })
    }

    const category = await prisma.blogCategory.update({
      where: { id },
      data: { name, slug, description, color },
    })

    res.json({ data: category })
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error)
    res.status(500).json({ error: 'Erro ao atualizar categoria' })
  }
})

// Deletar categoria (admin)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params

    // Verifica se tem posts
    const postsCount = await prisma.blogPost.count({ where: { categoryId: id } })
    if (postsCount > 0) {
      return res.status(400).json({ error: 'Categoria possui posts associados' })
    }

    await prisma.blogCategory.delete({ where: { id } })

    res.json({ message: 'Categoria deletada com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar categoria:', error)
    res.status(500).json({ error: 'Erro ao deletar categoria' })
  }
})

export default router

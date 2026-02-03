import { Router } from 'express'
import { prisma } from '../utils/prisma'
import { authMiddleware, adminMiddleware } from '../middlewares/auth'
import slugify from 'slugify'
import bcrypt from 'bcryptjs'

const router = Router()

// Listar autores
router.get('/', async (req, res) => {
  try {
    const authors = await prisma.blogAuthor.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        bio: true,
        avatar: true,
        email: true,
        isAi: true,
        isAdmin: true,
        createdAt: true,
        _count: { select: { posts: true } },
      },
      orderBy: { name: 'asc' },
    })

    const data = authors.map(author => ({
      ...author,
      postCount: author._count.posts,
      _count: undefined,
    }))

    res.json({ data })
  } catch (error) {
    console.error('Erro ao listar autores:', error)
    res.status(500).json({ error: 'Erro ao listar autores' })
  }
})

// Buscar autor por slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params

    const author = await prisma.blogAuthor.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        bio: true,
        avatar: true,
        isAi: true,
        _count: { select: { posts: true } },
      },
    })

    if (!author) {
      return res.status(404).json({ error: 'Autor nao encontrado' })
    }

    res.json({
      data: {
        ...author,
        postCount: author._count.posts,
        _count: undefined,
      },
    })
  } catch (error) {
    console.error('Erro ao buscar autor:', error)
    res.status(500).json({ error: 'Erro ao buscar autor' })
  }
})

// Criar autor (admin)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, slug: providedSlug, email, password, bio, avatar, isAi, isAdmin } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nome, email e senha sao obrigatorios' })
    }

    const slug = providedSlug || slugify(name, { lower: true, strict: true })

    const existing = await prisma.blogAuthor.findFirst({
      where: { OR: [{ slug }, { email }] },
    })
    if (existing) {
      return res.status(400).json({ error: 'Autor ja existe' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const author = await prisma.blogAuthor.create({
      data: {
        name,
        slug,
        email,
        password: hashedPassword,
        bio,
        avatar,
        isAi: isAi || false,
        isAdmin: isAdmin || false,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        bio: true,
        avatar: true,
        email: true,
        isAi: true,
        isAdmin: true,
        createdAt: true,
      },
    })

    res.status(201).json({ data: { ...author, postCount: 0 } })
  } catch (error) {
    console.error('Erro ao criar autor:', error)
    res.status(500).json({ error: 'Erro ao criar autor' })
  }
})

// Atualizar autor (admin)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const { name, slug: providedSlug, email, bio, avatar, isAi, isAdmin } = req.body

    const existing = await prisma.blogAuthor.findUnique({ where: { id } })
    if (!existing) {
      return res.status(404).json({ error: 'Autor nao encontrado' })
    }

    const slug = providedSlug || existing.slug

    // Verifica se slug ou email ja existem em outro autor
    if (slug !== existing.slug || email !== existing.email) {
      const duplicate = await prisma.blogAuthor.findFirst({
        where: {
          OR: [
            { slug, id: { not: id } },
            { email, id: { not: id } },
          ],
        },
      })
      if (duplicate) {
        return res.status(400).json({ error: 'Slug ou email ja em uso' })
      }
    }

    const author = await prisma.blogAuthor.update({
      where: { id },
      data: {
        name,
        slug,
        email,
        bio,
        avatar,
        isAi,
        isAdmin,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        bio: true,
        avatar: true,
        email: true,
        isAi: true,
        isAdmin: true,
        createdAt: true,
        _count: { select: { posts: true } },
      },
    })

    res.json({
      data: {
        ...author,
        postCount: author._count.posts,
        _count: undefined,
      },
    })
  } catch (error) {
    console.error('Erro ao atualizar autor:', error)
    res.status(500).json({ error: 'Erro ao atualizar autor' })
  }
})

// Deletar autor (admin)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params

    const existing = await prisma.blogAuthor.findUnique({
      where: { id },
      include: { _count: { select: { posts: true } } },
    })
    if (!existing) {
      return res.status(404).json({ error: 'Autor nao encontrado' })
    }

    if (existing._count.posts > 0) {
      return res.status(400).json({ error: 'Nao e possivel excluir autor com posts' })
    }

    await prisma.blogAuthor.delete({ where: { id } })

    res.json({ message: 'Autor excluido com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir autor:', error)
    res.status(500).json({ error: 'Erro ao excluir autor' })
  }
})

export default router

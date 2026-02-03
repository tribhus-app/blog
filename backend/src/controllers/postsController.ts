import { Request, Response } from 'express'
import { prisma } from '../utils/prisma'
import slugify from 'slugify'
import { z } from 'zod'

// Schemas de validacao
const createPostSchema = z.object({
  title: z.string().min(1).max(255),
  slug: z.string().optional(),
  excerpt: z.string().optional(),
  content: z.string().min(1),
  coverImage: z.string().optional(),
  imageCredit: z.string().max(255).optional(),
  imageCreditUrl: z.string().max(500).optional(),
  categoryId: z.string().uuid().optional(),
  authorId: z.string().uuid(),
  tags: z.array(z.string()).optional(),
  tagIds: z.array(z.string().uuid()).optional(),
  status: z.enum(['draft', 'published', 'scheduled']).optional(),
  featured: z.boolean().optional(),
  scheduledAt: z.string().optional(),
  metaTitle: z.string().max(70).optional(),
  metaDescription: z.string().max(170).optional(),
  focusKeyword: z.string().max(100).optional(),
})

const updatePostSchema = createPostSchema.partial()

// Listar posts (com paginacao)
export async function listPosts(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const status = req.query.status as string
    const categoryId = req.query.categoryId as string

    const where: any = status === 'all'
      ? {}
      : { status: 'published' as const, publishedAt: { lte: new Date() } }

    // Filter by category if provided
    if (categoryId) {
      where.categoryId = categoryId
    }

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        include: {
          category: true,
          author: { select: { id: true, name: true, slug: true, avatar: true, isAi: true } },
          tags: { include: { tag: true } },
        },
        orderBy: { publishedAt: 'desc' },
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
}

// Posts em destaque
export async function getFeaturedPosts(req: Request, res: Response) {
  try {
    const limit = parseInt(req.query.limit as string) || 5

    const posts = await prisma.blogPost.findMany({
      where: {
        status: 'published',
        featured: true,
        publishedAt: { lte: new Date() },
      },
      include: {
        category: true,
        author: { select: { id: true, name: true, slug: true, avatar: true, isAi: true } },
        tags: { include: { tag: true } },
      },
      orderBy: { publishedAt: 'desc' },
      take: limit,
    })

    const formattedPosts = posts.map(post => ({
      ...post,
      tags: post.tags.map(pt => pt.tag),
    }))

    res.json({ data: formattedPosts })
  } catch (error) {
    console.error('Erro ao buscar posts em destaque:', error)
    res.status(500).json({ error: 'Erro ao buscar posts em destaque' })
  }
}

// Posts recentes
export async function getRecentPosts(req: Request, res: Response) {
  try {
    const limit = parseInt(req.query.limit as string) || 10

    const posts = await prisma.blogPost.findMany({
      where: {
        status: 'published',
        publishedAt: { lte: new Date() },
      },
      include: {
        category: true,
        author: { select: { id: true, name: true, slug: true, avatar: true, isAi: true } },
        tags: { include: { tag: true } },
      },
      orderBy: { publishedAt: 'desc' },
      take: limit,
    })

    const formattedPosts = posts.map(post => ({
      ...post,
      tags: post.tags.map(pt => pt.tag),
    }))

    res.json({ data: formattedPosts })
  } catch (error) {
    console.error('Erro ao buscar posts recentes:', error)
    res.status(500).json({ error: 'Erro ao buscar posts recentes' })
  }
}

// Posts populares (mais vistos)
export async function getPopularPosts(req: Request, res: Response) {
  try {
    const limit = parseInt(req.query.limit as string) || 10

    const posts = await prisma.blogPost.findMany({
      where: {
        status: 'published',
        publishedAt: { lte: new Date() },
      },
      include: {
        category: true,
        author: { select: { id: true, name: true, slug: true, avatar: true, isAi: true } },
        tags: { include: { tag: true } },
      },
      orderBy: { views: 'desc' },
      take: limit,
    })

    const formattedPosts = posts.map(post => ({
      ...post,
      tags: post.tags.map(pt => pt.tag),
    }))

    res.json({ data: formattedPosts })
  } catch (error) {
    console.error('Erro ao buscar posts populares:', error)
    res.status(500).json({ error: 'Erro ao buscar posts populares' })
  }
}

// Buscar post por slug
export async function getPostBySlug(req: Request, res: Response) {
  try {
    const { slug } = req.params

    const post = await prisma.blogPost.findUnique({
      where: { slug },
      include: {
        category: true,
        author: { select: { id: true, name: true, slug: true, bio: true, avatar: true, isAi: true } },
        tags: { include: { tag: true } },
      },
    })

    if (!post) {
      return res.status(404).json({ error: 'Post nao encontrado' })
    }

    // Verifica se pode ser visualizado
    if (post.status !== 'published' || (post.publishedAt && post.publishedAt > new Date())) {
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
}

// Posts por categoria
export async function getPostsByCategory(req: Request, res: Response) {
  try {
    const { categorySlug } = req.params
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10

    const category = await prisma.blogCategory.findUnique({
      where: { slug: categorySlug },
    })

    if (!category) {
      return res.status(404).json({ error: 'Categoria nao encontrada' })
    }

    const where = {
      categoryId: category.id,
      status: 'published' as const,
      publishedAt: { lte: new Date() },
    }

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        include: {
          category: true,
          author: { select: { id: true, name: true, slug: true, avatar: true, isAi: true } },
          tags: { include: { tag: true } },
        },
        orderBy: { publishedAt: 'desc' },
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
      category,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Erro ao buscar posts por categoria:', error)
    res.status(500).json({ error: 'Erro ao buscar posts por categoria' })
  }
}

// Criar post
export async function createPost(req: Request, res: Response) {
  try {
    const validation = createPostSchema.safeParse(req.body)
    if (!validation.success) {
      return res.status(400).json({ error: 'Dados invalidos', details: validation.error.errors })
    }

    const data = validation.data
    const slug = data.slug || slugify(data.title, { lower: true, strict: true })

    // Verifica se slug ja existe
    const existingPost = await prisma.blogPost.findUnique({ where: { slug } })
    if (existingPost) {
      return res.status(400).json({ error: 'Ja existe um post com esse titulo/slug' })
    }

    const post = await prisma.blogPost.create({
      data: {
        title: data.title,
        slug,
        excerpt: data.excerpt,
        content: data.content,
        coverImage: data.coverImage,
        imageCredit: data.imageCredit,
        imageCreditUrl: data.imageCreditUrl,
        categoryId: data.categoryId,
        authorId: data.authorId,
        status: data.status || 'draft',
        featured: data.featured || false,
        publishedAt: data.status === 'published' ? new Date() : null,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        focusKeyword: data.focusKeyword,
      },
      include: {
        category: true,
        author: { select: { id: true, name: true, slug: true, avatar: true, isAi: true } },
        tags: { include: { tag: true } },
      },
    })

    // Adicionar tags por nome se fornecidas
    if (data.tags && data.tags.length > 0) {
      for (const tagName of data.tags) {
        const tagSlug = slugify(tagName, { lower: true, strict: true })
        const tag = await prisma.blogTag.upsert({
          where: { slug: tagSlug },
          update: {},
          create: { name: tagName, slug: tagSlug },
        })
        await prisma.blogPostTag.create({
          data: { postId: post.id, tagId: tag.id },
        })
      }
    }

    // Adicionar tags por ID se fornecidas
    if (data.tagIds && data.tagIds.length > 0) {
      for (const tagId of data.tagIds) {
        await prisma.blogPostTag.create({
          data: { postId: post.id, tagId },
        }).catch(() => {}) // Ignora duplicatas
      }
    }

    // Buscar post atualizado com tags
    const updatedPost = await prisma.blogPost.findUnique({
      where: { id: post.id },
      include: {
        category: true,
        author: { select: { id: true, name: true, slug: true, avatar: true, isAi: true } },
        tags: { include: { tag: true } },
      },
    })

    res.status(201).json({
      data: {
        ...updatedPost,
        tags: updatedPost?.tags.map(pt => pt.tag) || [],
      },
    })
  } catch (error) {
    console.error('Erro ao criar post:', error)
    res.status(500).json({ error: 'Erro ao criar post' })
  }
}

// Atualizar post
export async function updatePost(req: Request, res: Response) {
  try {
    const { id } = req.params
    const validation = updatePostSchema.safeParse(req.body)

    if (!validation.success) {
      return res.status(400).json({ error: 'Dados invalidos', details: validation.error.errors })
    }

    const existingPost = await prisma.blogPost.findUnique({ where: { id } })
    if (!existingPost) {
      return res.status(404).json({ error: 'Post nao encontrado' })
    }

    const data = validation.data
    let slug = data.slug || existingPost.slug

    // Verifica se slug mudou e se ja existe
    if (slug !== existingPost.slug) {
      const slugExists = await prisma.blogPost.findFirst({
        where: { slug, id: { not: id } },
      })
      if (slugExists) {
        return res.status(400).json({ error: 'Ja existe um post com esse slug' })
      }
    }

    // Atualizar tags se fornecidas
    if (data.tagIds !== undefined) {
      // Remove todas as tags existentes
      await prisma.blogPostTag.deleteMany({ where: { postId: id } })

      // Adiciona as novas tags
      if (data.tagIds.length > 0) {
        for (const tagId of data.tagIds) {
          await prisma.blogPostTag.create({
            data: { postId: id, tagId },
          }).catch(() => {}) // Ignora duplicatas
        }
      }
    }

    // Determina publishedAt
    let publishedAt = existingPost.publishedAt
    if (data.status === 'published' && !existingPost.publishedAt) {
      publishedAt = new Date()
    }

    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        title: data.title,
        slug,
        excerpt: data.excerpt,
        content: data.content,
        coverImage: data.coverImage,
        imageCredit: data.imageCredit,
        imageCreditUrl: data.imageCreditUrl,
        categoryId: data.categoryId,
        authorId: data.authorId,
        status: data.status,
        featured: data.featured,
        publishedAt,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        focusKeyword: data.focusKeyword,
      },
      include: {
        category: true,
        author: { select: { id: true, name: true, slug: true, avatar: true, isAi: true } },
        tags: { include: { tag: true } },
      },
    })

    res.json({
      data: {
        ...post,
        tags: post.tags.map(pt => pt.tag),
      },
    })
  } catch (error) {
    console.error('Erro ao atualizar post:', error)
    res.status(500).json({ error: 'Erro ao atualizar post' })
  }
}

// Deletar post
export async function deletePost(req: Request, res: Response) {
  try {
    const { id } = req.params

    const existingPost = await prisma.blogPost.findUnique({ where: { id } })
    if (!existingPost) {
      return res.status(404).json({ error: 'Post nao encontrado' })
    }

    await prisma.blogPost.delete({ where: { id } })

    res.json({ message: 'Post deletado com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar post:', error)
    res.status(500).json({ error: 'Erro ao deletar post' })
  }
}

// Publicar post
export async function publishPost(req: Request, res: Response) {
  try {
    const { id } = req.params

    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        status: 'published',
        publishedAt: new Date(),
      },
    })

    res.json({ data: post })
  } catch (error) {
    console.error('Erro ao publicar post:', error)
    res.status(500).json({ error: 'Erro ao publicar post' })
  }
}

// Despublicar post
export async function unpublishPost(req: Request, res: Response) {
  try {
    const { id } = req.params

    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        status: 'draft',
      },
    })

    res.json({ data: post })
  } catch (error) {
    console.error('Erro ao despublicar post:', error)
    res.status(500).json({ error: 'Erro ao despublicar post' })
  }
}

// Incrementar views
export async function incrementViews(req: Request, res: Response) {
  try {
    const { id } = req.params

    await prisma.blogPost.update({
      where: { id },
      data: { views: { increment: 1 } },
    })

    res.json({ success: true })
  } catch (error) {
    console.error('Erro ao incrementar views:', error)
    res.status(500).json({ error: 'Erro ao incrementar views' })
  }
}

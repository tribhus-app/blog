import { Request, Response } from 'express'
import { prisma } from '../utils/prisma'
import slugify from 'slugify'
import { z } from 'zod'
import DOMPurify from 'isomorphic-dompurify'
import { parseUserAgent, classifySource, extractIp } from '../utils/analytics'
import { getLocation } from '../utils/geoLocation'

// CRIT-010: sanitiza HTML do post antes de gravar. Whitelist compativel com Tiptap + YouTube.
const SANITIZE_CONFIG = {
  ALLOWED_TAGS: [
    'h1','h2','h3','h4','h5','h6',
    'p','br','hr','div','span',
    'strong','b','em','i','u','s','del','ins','mark','small','sub','sup',
    'blockquote','pre','code',
    'ul','ol','li',
    'a','img','figure','figcaption',
    'iframe',
    'table','thead','tbody','tr','td','th',
  ],
  ALLOWED_ATTR: [
    'href','target','rel','class','id','title',
    'src','alt','width','height',
    'allow','allowfullscreen','frameborder',
    'style',
  ],
  FORBID_TAGS: ['script','style','object','embed','base','link','meta','form','input','button','textarea','select','option'],
  FORBID_ATTR: ['onerror','onload','onclick','onmouseover','onmouseout','onfocus','onblur','onchange','onsubmit','formaction','xlink:href'],
  ALLOW_DATA_ATTR: false,
}

const ALLOWED_IFRAME_HOSTS = [
  'www.youtube.com','youtube.com',
  'www.youtube-nocookie.com','youtube-nocookie.com',
  'player.vimeo.com',
]

if (typeof DOMPurify.addHook === 'function') {
  DOMPurify.addHook('uponSanitizeElement', (node: any, data: any) => {
    if (data.tagName === 'iframe') {
      const src = node.getAttribute?.('src') || ''
      try {
        const u = new URL(src, 'https://invalid.local')
        if (!ALLOWED_IFRAME_HOSTS.includes(u.hostname.toLowerCase())) {
          node.remove?.()
        }
      } catch {
        node.remove?.()
      }
    }
  })
}

const sanitizeContent = (html: string | undefined): string | undefined => {
  if (html === undefined || html === null) return html
  return DOMPurify.sanitize(html, SANITIZE_CONFIG) as unknown as string
}

function parseScheduledAt(status: 'draft' | 'published' | 'scheduled' | undefined, scheduledAt?: string): Date | null | undefined {
  if (status !== 'scheduled') {
    return status ? null : undefined
  }

  if (!scheduledAt) {
    throw new Error('Informe a data e hora do agendamento')
  }

  const date = new Date(scheduledAt)
  if (Number.isNaN(date.getTime())) {
    throw new Error('Data de agendamento invalida')
  }

  return date
}

function getPublishedAtForStatus(
  status: 'draft' | 'published' | 'scheduled' | undefined,
  currentPublishedAt?: Date | null
): Date | null | undefined {
  if (status === 'published') {
    return currentPublishedAt || new Date()
  }

  if (status === 'scheduled' || status === 'draft') {
    return null
  }

  return undefined
}

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
  socialPublicar: z.boolean().optional(),
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
    const status = data.status || 'draft'
    let scheduledAt: Date | null | undefined
    try {
      scheduledAt = parseScheduledAt(status, data.scheduledAt)
    } catch (error) {
      return res.status(400).json({ error: error instanceof Error ? error.message : 'Data de agendamento invalida' })
    }

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
        content: sanitizeContent(data.content) as string,
        coverImage: data.coverImage,
        imageCredit: data.imageCredit,
        imageCreditUrl: data.imageCreditUrl,
        categoryId: data.categoryId,
        authorId: data.authorId,
        status,
        featured: data.featured || false,
        socialPublicar: data.socialPublicar || false,
        publishedAt: getPublishedAtForStatus(status),
        scheduledAt: scheduledAt ?? null,
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
    let scheduledAt: Date | null | undefined
    try {
      scheduledAt = parseScheduledAt(data.status, data.scheduledAt)
    } catch (error) {
      return res.status(400).json({ error: error instanceof Error ? error.message : 'Data de agendamento invalida' })
    }

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

    const publishedAt = getPublishedAtForStatus(data.status, existingPost.publishedAt)

    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        title: data.title,
        slug,
        excerpt: data.excerpt,
        content: sanitizeContent(data.content),
        coverImage: data.coverImage,
        imageCredit: data.imageCredit,
        imageCreditUrl: data.imageCreditUrl,
        categoryId: data.categoryId,
        authorId: data.authorId,
        status: data.status,
        featured: data.featured,
        socialPublicar: data.socialPublicar,
        publishedAt,
        scheduledAt,
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

// Registrar visualizacao (evento + cache no contador do post)
export async function incrementViews(req: Request, res: Response) {
  try {
    const { id } = req.params
    const body = (req.body || {}) as Record<string, any>

    const ua = req.headers['user-agent']
    const { isBot, deviceType, browser, os } = parseUserAgent(ua)
    const ip = extractIp(req)
    const referer = (body.referer as string) || (req.headers['referer'] as string) || null
    const selfHost = (process.env.FRONTEND_URL || 'https://blog.tribhus.com.br')
      .replace(/^https?:\/\//, '')
      .replace(/\/.*$/, '')

    const source = classifySource(referer, body.utm_source, body.utm_medium, selfHost)

    const str = (v: any, max: number) =>
      typeof v === 'string' && v.length ? v.slice(0, max) : null

    // Cria o evento. Mesmo bots sao gravados (com is_bot=true) para auditoria,
    // mas NAO contam no contador publico do post.
    const event = await prisma.blogPostView.create({
      data: {
        postId: id,
        ip: ip.slice(0, 45),
        referer: referer ? referer.slice(0, 2000) : null,
        source,
        utmSource: str(body.utm_source, 100),
        utmMedium: str(body.utm_medium, 100),
        utmCampaign: str(body.utm_campaign, 100),
        sessionId: str(body.session_id, 64),
        deviceType,
        browser,
        os,
        isBot,
      },
      select: { id: true },
    })

    if (!isBot) {
      await prisma.blogPost.update({
        where: { id },
        data: { views: { increment: 1 } },
      })
    }

    // Resolve a geolocalizacao em background (ip-api.com, cache 24h).
    // Nao bloqueamos a resposta: se falhar, o evento fica sem geo.
    if (!isBot && ip && ip !== 'unknown') {
      getLocation(ip)
        .then(async (geo) => {
          if (!geo) return

          // Segunda camada de deteccao de bot: o user-agent mente, o IP nao.
          // Crawler moderno (Alibaba Cloud, Baidu, Meta, Googlebot) chega com UA
          // de Chrome comum e passa direto pelo BOT_REGEX. Como ele sai de
          // datacenter ou VPN, o ip-api entrega isso em hosting/proxy.
          // Reclassificamos o evento e devolvemos o ponto que ja tinha sido
          // somado no contador publico do post.
          const ehRobo = geo.hosting || geo.proxy

          await prisma.blogPostView.update({
            where: { id: event.id },
            data: {
              country: geo.countryCode ? geo.countryCode.slice(0, 2) : null,
              region: geo.state ? geo.state.slice(0, 100) : null,
              city: geo.city ? geo.city.slice(0, 100) : null,
              ...(ehRobo ? { isBot: true } : {}),
            },
          })

          if (ehRobo) {
            await prisma.blogPost.update({
              where: { id },
              data: { views: { decrement: 1 } },
            })
          }
        })
        .catch(() => {})
    }

    res.json({ success: true, viewId: event.id })
  } catch (error) {
    console.error('Erro ao registrar view:', error)
    res.status(500).json({ error: 'Erro ao registrar view' })
  }
}

// Atualiza engajamento (tempo na pagina + scroll) ao sair do post.
// Recebido via navigator.sendBeacon, entao a resposta e best-effort.
export async function recordEngagement(req: Request, res: Response) {
  try {
    const { viewId } = req.params
    const body = (req.body || {}) as Record<string, any>

    const time = Number(body.time_on_page)
    const scroll = Number(body.scroll_depth)

    await prisma.blogPostView.update({
      where: { id: viewId },
      data: {
        timeOnPage: Number.isFinite(time) ? Math.max(0, Math.min(86400, Math.round(time))) : undefined,
        scrollDepth: Number.isFinite(scroll) ? Math.max(0, Math.min(100, Math.round(scroll))) : undefined,
      },
    })

    res.status(204).end()
  } catch (error) {
    // sendBeacon ignora a resposta; so logamos.
    res.status(204).end()
  }
}

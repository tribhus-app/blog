import { prisma } from '../../utils/prisma'
import slugify from 'slugify'
import { generateWelcomeArticle, generateNewsArticle, generateArticleFromEnrichedSources } from './claude'
import { enrichNewsWithVideo } from '../news/rssService'
import { uploadImageFromUrl } from '../minio'
import {
  BandData,
  NewsItem,
  GeneratedArticle,
  GenerationResult,
  CategoryConfig,
  AI_AUTHOR_NAME,
  AI_AUTHOR_EMAIL,
  AI_AUTHOR_SLUG,
} from '../../types/ai'
import { EnrichedNewsForArticle } from '../news/newsAggregator'

/**
 * Busca todas as tags existentes no banco de dados
 */
export async function getAvailableTagNames(): Promise<string[]> {
  const tags = await prisma.blogTag.findMany({
    select: { name: true },
    orderBy: { name: 'asc' },
  })
  return tags.map(t => t.name)
}

/**
 * Busca ou cria o autor IA no banco de dados
 */
export async function getAiAuthor(): Promise<{ id: string; name: string }> {
  // Tenta buscar o autor IA existente
  let author = await prisma.blogAuthor.findUnique({
    where: { slug: AI_AUTHOR_SLUG },
  })

  // Se nao existe, cria
  if (!author) {
    author = await prisma.blogAuthor.create({
      data: {
        name: AI_AUTHOR_NAME,
        slug: AI_AUTHOR_SLUG,
        email: AI_AUTHOR_EMAIL,
        bio: 'Conteudo gerado automaticamente pela inteligencia artificial da Tribhus para manter voce informado sobre o mundo do rock e metal.',
        isAi: true,
        isAdmin: false,
      },
    })
    console.log('Autor IA criado:', author.id)
  }

  return { id: author.id, name: author.name }
}

/**
 * Gera um slug unico para o post
 */
async function generateUniqueSlug(title: string): Promise<string> {
  let baseSlug = slugify(title, { lower: true, strict: true })
  let slug = baseSlug
  let counter = 1

  // Verifica se o slug ja existe e incrementa se necessario
  while (await prisma.blogPost.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`
    counter++
  }

  return slug
}

/**
 * Salva um artigo gerado no banco de dados como RASCUNHO
 */
export async function saveGeneratedArticle(
  article: GeneratedArticle,
  authorId: string,
  categorySlug?: string,
  sourceUrl?: string,
  sourceName?: string,
  coverImageUrl?: string
): Promise<string> {
  const slug = await generateUniqueSlug(article.title)

  // Busca a categoria especificada ou usa "noticias" como padrao
  const targetCategorySlug = categorySlug || 'noticias'
  let category = await prisma.blogCategory.findUnique({
    where: { slug: targetCategorySlug },
  })

  // Se nao encontrar, tenta buscar "noticias"
  if (!category) {
    category = await prisma.blogCategory.findUnique({
      where: { slug: 'noticias' },
    })
  }

  // Se ainda nao encontrar, cria a categoria
  if (!category) {
    category = await prisma.blogCategory.create({
      data: {
        name: 'Noticias',
        slug: 'noticias',
        description: 'Noticias do mundo do rock e metal',
        color: '#914100',
      },
    })
  }

  console.log(`Salvando artigo na categoria: ${category.name}`)

  // Faz upload da imagem de capa para o MinIO (se fornecida)
  let coverImage: string | null = null
  if (coverImageUrl) {
    try {
      console.log(`Fazendo upload da imagem de capa: ${coverImageUrl}`)
      const uploadResult = await uploadImageFromUrl(coverImageUrl)
      coverImage = uploadResult.url
      console.log(`Imagem de capa salva: ${coverImage}`)
    } catch (error) {
      console.error(`Erro ao fazer upload da imagem de capa:`, error)
      // Continua sem imagem se falhar o upload
    }
  }

  // Cria o post como RASCUNHO
  const post = await prisma.blogPost.create({
    data: {
      title: article.title,
      slug,
      excerpt: article.excerpt,
      content: article.content,
      coverImage,
      status: 'draft',
      featured: false,
      authorId,
      categoryId: category.id,
      metaTitle: article.seo.metaTitle,
      metaDescription: article.seo.metaDescription,
      focusKeyword: article.seo.focusKeyword,
      sourceUrl: sourceUrl || null,
      sourceName: sourceName || null,
    },
  })

  // Adiciona as tags (apenas tags que ja existem no sistema)
  if (article.tags && article.tags.length > 0) {
    for (const tagName of article.tags) {
      const tagSlug = slugify(tagName, { lower: true, strict: true })

      // Busca a tag existente (NAO cria novas)
      const tag = await prisma.blogTag.findUnique({
        where: { slug: tagSlug },
      })

      if (!tag) {
        console.log(`Tag ignorada (nao existe no sistema): "${tagName}"`)
        continue
      }

      // Associa a tag ao post
      await prisma.blogPostTag.create({
        data: { postId: post.id, tagId: tag.id },
      }).catch(() => {
        // Ignora se a relacao ja existe
      })
    }
  }

  console.log(`Artigo salvo como rascunho: ${post.id} - ${post.title}`)
  return post.id
}

/**
 * Gera e salva artigo de boas-vindas para uma nova banda
 */
export async function generateAndSaveWelcomeArticle(band: BandData): Promise<GenerationResult> {
  try {
    console.log(`Iniciando geracao de artigo de boas-vindas para: ${band.name}`)

    // Busca o autor IA e tags disponiveis
    const [author, availableTags] = await Promise.all([
      getAiAuthor(),
      getAvailableTagNames(),
    ])

    // Gera o artigo (passando tags existentes para o prompt)
    const article = await generateWelcomeArticle(band, availableTags)

    // Salva no banco
    const articleId = await saveGeneratedArticle(article, author.id)

    return {
      success: true,
      articleId,
    }
  } catch (error) {
    console.error('Erro ao gerar artigo de boas-vindas:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }
  }
}

/**
 * Gera e salva artigo baseado em noticia
 */
export async function generateAndSaveNewsArticle(
  news: NewsItem,
  category?: CategoryConfig
): Promise<GenerationResult> {
  try {
    console.log(`Iniciando geracao de artigo para noticia: ${news.title}`)
    if (category) {
      console.log(`Categoria: ${category.name}`)
    }

    // Verifica se ja existe artigo com essa URL fonte
    const existingPost = await prisma.blogPost.findFirst({
      where: {
        content: {
          contains: news.link,
        },
      },
    })

    if (existingPost) {
      console.log(`Artigo ja existe para esta noticia: ${news.link}`)
      return {
        success: false,
        error: 'Artigo ja existe para esta noticia',
      }
    }

    // Busca o autor IA e tags disponiveis
    const [author, availableTags] = await Promise.all([
      getAiAuthor(),
      getAvailableTagNames(),
    ])

    // Enriquece a noticia buscando video do YouTube na pagina original
    const enrichedNews = await enrichNewsWithVideo(news)

    // Gera o artigo (passa a categoria e tags existentes para o prompt)
    const article = await generateNewsArticle(enrichedNews, category, availableTags)

    // Salva no banco com a categoria correta, fonte original e imagem de capa
    const articleId = await saveGeneratedArticle(
      article,
      author.id,
      category?.slug,
      news.link,
      news.source,
      enrichedNews.imageUrl
    )

    return {
      success: true,
      articleId,
    }
  } catch (error) {
    console.error('Erro ao gerar artigo de noticia:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }
  }
}

/**
 * Busca dados de uma banda pelo ID
 */
export async function getBandDataById(bandId: number): Promise<BandData | null> {
  const band = await prisma.banda.findUnique({
    where: { id_banda: bandId },
    include: {
      banda_genero: {
        include: {
          genero_rock: true,
        },
      },
    },
  })

  if (!band) {
    return null
  }

  return {
    id: band.id_banda,
    name: band.nome_banda,
    slug: band.sluge || slugify(band.nome_banda, { lower: true, strict: true }),
    city: band.cidade || undefined,
    state: band.estado || undefined,
    description: band.descricao || undefined,
    genres: band.banda_genero.map((bg) => bg.genero_rock.nome_genero),
    startDate: band.data_inicio?.toISOString().split('T')[0],
    socialLinks: {
      facebook: band.url_facebook || undefined,
      instagram: band.url_instagram || undefined,
      spotify: band.url_spotify || undefined,
    },
  }
}

// ========================================
// NOVA FUNCAO COM TAVILY (RECOMENDADA)
// ========================================

/**
 * Gera e salva artigo usando fontes enriquecidas do Tavily
 * Esta e a funcao recomendada para uso com o novo sistema
 *
 * Diferenca da funcao antiga:
 * - Recebe fontes ja enriquecidas (multiplas fontes por artigo)
 * - Usa prompts com regras anti-alucinacao rigorosas
 * - Claude so pode usar informacoes das fontes fornecidas
 */
export async function generateAndSaveEnrichedArticle(
  enrichedNews: EnrichedNewsForArticle,
  category: CategoryConfig
): Promise<GenerationResult> {
  try {
    console.log(`\n========================================`)
    console.log(`GERANDO ARTIGO: ${enrichedNews.news.title.substring(0, 50)}...`)
    console.log(`CATEGORIA: ${category.name}`)
    console.log(`========================================\n`)

    // Verifica se ja existe artigo com essa URL fonte
    const existingPost = await prisma.blogPost.findFirst({
      where: {
        sourceUrl: enrichedNews.news.link,
      },
    })

    if (existingPost) {
      console.log(`Artigo ja existe para esta noticia: ${enrichedNews.news.link}`)
      return {
        success: false,
        error: 'Artigo ja existe para esta noticia',
      }
    }

    // Busca o autor IA e tags disponiveis
    const [author, availableTags] = await Promise.all([
      getAiAuthor(),
      getAvailableTagNames(),
    ])

    // Gera o artigo usando as fontes enriquecidas (com tags existentes)
    const article = await generateArticleFromEnrichedSources(
      enrichedNews.sources,
      category,
      availableTags
    )

    // Salva no banco com a categoria correta, fonte original e imagem de capa
    const articleId = await saveGeneratedArticle(
      article,
      author.id,
      category.slug,
      enrichedNews.news.link,
      enrichedNews.news.source,
      enrichedNews.news.imageUrl
    )

    console.log(`Artigo gerado com sucesso: ${articleId}`)

    return {
      success: true,
      articleId,
    }
  } catch (error) {
    console.error('Erro ao gerar artigo enriquecido:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }
  }
}

/**
 * Gera multiplos artigos a partir de noticias enriquecidas
 * Retorna array com resultados de cada geracao
 */
export async function generateMultipleEnrichedArticles(
  enrichedNewsList: EnrichedNewsForArticle[],
  category: CategoryConfig
): Promise<GenerationResult[]> {
  const results: GenerationResult[] = []

  for (const enrichedNews of enrichedNewsList) {
    const result = await generateAndSaveEnrichedArticle(enrichedNews, category)
    results.push(result)

    // Pequena pausa entre geracoes para evitar rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  return results
}

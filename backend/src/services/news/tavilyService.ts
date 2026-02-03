import { NewsItem, CategoryConfig, TAVILY_CATEGORY_QUERIES } from '../../types/ai'

// Cliente Tavily
const TAVILY_API_URL = 'https://api.tavily.com/search'

interface TavilySearchResult {
  title: string
  url: string
  content: string
  raw_content?: string
  score: number
  published_date?: string
}

interface TavilyResponse {
  query: string
  results: TavilySearchResult[]
}

/**
 * Verifica se o Tavily está configurado
 */
export function isTavilyConfigured(): boolean {
  return !!process.env.TAVILY_API_KEY
}

/**
 * Executa uma busca no Tavily
 */
async function searchTavily(
  query: string,
  options: {
    maxResults?: number
    searchDepth?: 'basic' | 'advanced'
    includeRawContent?: boolean
  } = {}
): Promise<TavilySearchResult[]> {
  const { maxResults = 10, searchDepth = 'advanced', includeRawContent = true } = options

  if (!isTavilyConfigured()) {
    console.error('TAVILY_API_KEY não configurada')
    return []
  }

  try {
    console.log(`Tavily buscando: "${query}"`)

    const response = await fetch(TAVILY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: process.env.TAVILY_API_KEY,
        query,
        search_depth: searchDepth,
        include_raw_content: includeRawContent,
        max_results: maxResults,
        include_domains: [], // Sem restrição - busca global
        exclude_domains: [], // Pode adicionar sites a excluir se necessário
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Erro Tavily (${response.status}): ${errorText}`)
      return []
    }

    const data = (await response.json()) as TavilyResponse
    console.log(`Tavily encontrou ${data.results.length} resultados para: "${query}"`)

    return data.results
  } catch (error) {
    console.error('Erro ao buscar no Tavily:', error)
    return []
  }
}

/**
 * Extrai URL de vídeo do YouTube do conteúdo
 */
function extractYouTubeUrl(content: string): string | undefined {
  const youtubePatterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]{11})/,
  ]

  for (const pattern of youtubePatterns) {
    const match = content.match(pattern)
    if (match) {
      return `https://www.youtube.com/watch?v=${match[1]}`
    }
  }

  return undefined
}

/**
 * Extrai URL de imagem do conteúdo
 */
function extractImageUrl(content: string): string | undefined {
  // Tenta encontrar URLs de imagem comuns
  const imgPatterns = [
    /https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp|gif)(?:\?[^\s"'<>]*)?/i,
    /<img[^>]+src=["']([^"']+)["']/i,
  ]

  for (const pattern of imgPatterns) {
    const match = content.match(pattern)
    if (match) {
      return match[1] || match[0]
    }
  }

  return undefined
}

/**
 * Converte resultado do Tavily para NewsItem
 */
function tavilyResultToNewsItem(result: TavilySearchResult, source: string): NewsItem {
  const content = result.raw_content || result.content || ''

  return {
    title: result.title,
    description: result.content.substring(0, 500),
    link: result.url,
    pubDate: result.published_date || new Date().toISOString(),
    source,
    imageUrl: extractImageUrl(content),
    content,
    videoUrl: extractYouTubeUrl(content),
  }
}

/**
 * Busca notícias para uma categoria específica (fase de descoberta)
 * Executa múltiplas queries para ter variedade
 */
export async function discoverNewsForCategory(
  category: CategoryConfig,
  maxResults: number = 15
): Promise<NewsItem[]> {
  console.log(`\n=== DESCOBERTA: ${category.name} ===`)

  const queries = TAVILY_CATEGORY_QUERIES[category.slug] || []
  if (queries.length === 0) {
    console.warn(`Nenhuma query configurada para categoria: ${category.slug}`)
    return []
  }

  const allItems: NewsItem[] = []
  const seenUrls = new Set<string>()

  // Executa até 4 queries diferentes para ter variedade (12 buscas = 3 resultados cada)
  const queriesToRun = queries.slice(0, 4)

  for (const query of queriesToRun) {
    const results = await searchTavily(query, {
      maxResults: 5,
      searchDepth: 'advanced',
      includeRawContent: true,
    })

    for (const result of results) {
      // Evita duplicatas
      if (seenUrls.has(result.url)) continue
      seenUrls.add(result.url)

      const newsItem = tavilyResultToNewsItem(result, `Tavily: ${query}`)
      allItems.push(newsItem)
    }
  }

  console.log(`Descoberta ${category.name}: ${allItems.length} notícias únicas encontradas`)

  // Ordena por score/relevância e retorna os melhores
  return allItems.slice(0, maxResults)
}

/**
 * Enriquece uma notícia com mais informações de múltiplas fontes
 * Busca informações adicionais sobre o tópico
 */
export async function enrichNewsItem(
  news: NewsItem,
  category: CategoryConfig
): Promise<{ news: NewsItem; additionalSources: TavilySearchResult[] }> {
  console.log(`\n=== ENRIQUECENDO: ${news.title.substring(0, 50)}... ===`)

  const additionalSources: TavilySearchResult[] = []

  // Extrai termos principais do título para buscas de enriquecimento
  const searchTerms = extractSearchTerms(news.title)

  if (searchTerms.length === 0) {
    console.log('Não foi possível extrair termos de busca do título')
    return { news, additionalSources }
  }

  // Queries de enriquecimento baseadas no conteúdo
  const enrichmentQueries = generateEnrichmentQueries(searchTerms, category)

  // Executa até 6 buscas de enriquecimento
  for (const query of enrichmentQueries.slice(0, 6)) {
    const results = await searchTavily(query, {
      maxResults: 3,
      searchDepth: 'basic', // Basic é suficiente para enriquecimento
      includeRawContent: true,
    })

    additionalSources.push(...results)
  }

  // Tenta encontrar vídeo se ainda não tem
  if (!news.videoUrl) {
    const videoQuery = `${searchTerms[0]} official video youtube`
    const videoResults = await searchTavily(videoQuery, {
      maxResults: 3,
      searchDepth: 'basic',
      includeRawContent: true,
    })

    for (const result of videoResults) {
      const videoUrl = extractYouTubeUrl(result.content || result.url)
      if (videoUrl) {
        news.videoUrl = videoUrl
        console.log(`Vídeo encontrado: ${videoUrl}`)
        break
      }
    }
  }

  console.log(`Enriquecimento: ${additionalSources.length} fontes adicionais encontradas`)

  return { news, additionalSources }
}

/**
 * Extrai termos de busca relevantes do título
 */
function extractSearchTerms(title: string): string[] {
  // Remove palavras comuns e extrai termos significativos
  const stopWords = [
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
    'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
    'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need',
    'o', 'a', 'os', 'as', 'um', 'uma', 'e', 'ou', 'mas', 'em', 'no', 'na',
    'de', 'da', 'do', 'para', 'por', 'com', 'como', 'que', 'se', 'sua', 'seu',
    'new', 'novo', 'nova', 'announces', 'anuncia', 'releases', 'lanca',
  ]

  const words = title
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.includes(word))

  // Tenta identificar nomes de bandas (palavras capitalizadas no original)
  const capitalizedWords = title
    .split(/\s+/)
    .filter(word => word.length > 2 && /^[A-Z]/.test(word))
    .map(word => word.replace(/[^\w]/g, ''))

  // Combina, priorizando palavras capitalizadas (provavelmente nomes de bandas)
  const uniqueTerms = [...new Set([...capitalizedWords, ...words])]

  return uniqueTerms.slice(0, 5)
}

/**
 * Gera queries de enriquecimento baseadas nos termos e categoria
 */
function generateEnrichmentQueries(terms: string[], category: CategoryConfig): string[] {
  const mainTerm = terms[0] // Provavelmente o nome da banda/artista
  const queries: string[] = []

  // Query básica sobre o assunto
  queries.push(`${terms.slice(0, 3).join(' ')} rock metal news`)

  // Queries específicas por categoria
  switch (category.slug) {
    case 'tecnologia':
      queries.push(`${mainTerm} guitar gear equipment confirmed`)
      queries.push(`${mainTerm} amplifier pedals official`)
      queries.push(`${mainTerm} studio recording setup interview`)
      break

    case 'lancamentos':
      queries.push(`${mainTerm} new album tracklist official`)
      queries.push(`${mainTerm} single release date confirmed`)
      queries.push(`${mainTerm} music video premiere`)
      break

    case 'eventos':
      queries.push(`${mainTerm} tour dates 2024 2025 official`)
      queries.push(`${mainTerm} concert festival lineup confirmed`)
      queries.push(`${mainTerm} live show setlist`)
      break

    case 'reviews':
      queries.push(`${mainTerm} album review rating`)
      queries.push(`${mainTerm} critic review score`)
      queries.push(`${mainTerm} fan reaction review`)
      break

    case 'curiosidades':
      queries.push(`${mainTerm} band history formation`)
      queries.push(`${mainTerm} interview behind the scenes`)
      queries.push(`${mainTerm} interesting facts trivia confirmed`)
      break

    case 'novidades':
      queries.push(`${mainTerm} latest news update`)
      queries.push(`${mainTerm} announcement official statement`)
      queries.push(`${mainTerm} new project collaboration`)
      break

    default: // noticias
      queries.push(`${mainTerm} news statement official`)
      queries.push(`${mainTerm} announcement confirmed`)
      queries.push(`${mainTerm} latest update`)
  }

  return queries
}

/**
 * Formata fontes adicionais para incluir no prompt do Claude
 */
export function formatSourcesForPrompt(
  mainNews: NewsItem,
  additionalSources: TavilySearchResult[]
): string {
  let formatted = `
=== FONTE PRINCIPAL ===
Título: ${mainNews.title}
URL: ${mainNews.link}
Fonte: ${mainNews.source}
Data: ${mainNews.pubDate}
Conteúdo:
${mainNews.content || mainNews.description}
`

  if (mainNews.videoUrl) {
    formatted += `\nVídeo disponível: ${mainNews.videoUrl}`
  }

  if (additionalSources.length > 0) {
    formatted += `\n\n=== FONTES ADICIONAIS PARA CONTEXTO ===\n`
    formatted += `(Use estas fontes APENAS para informações que possam ser verificadas)\n\n`

    for (let i = 0; i < additionalSources.length; i++) {
      const source = additionalSources[i]
      formatted += `--- Fonte ${i + 1} ---
Título: ${source.title}
URL: ${source.url}
Conteúdo: ${source.content.substring(0, 800)}
`
    }
  }

  return formatted
}

/**
 * Busca completa: descoberta + seleção dos 3 melhores + enriquecimento
 */
export async function fetchAndEnrichNews(
  category: CategoryConfig,
  topCount: number = 3
): Promise<Array<{ news: NewsItem; sources: string }>> {
  // Fase 1: Descoberta
  const discoveredNews = await discoverNewsForCategory(category, 15)

  if (discoveredNews.length === 0) {
    console.warn(`Nenhuma notícia encontrada para ${category.name}`)
    return []
  }

  // Fase 2: Seleciona os melhores (por enquanto, os primeiros - já vêm rankeados pelo Tavily)
  const topNews = discoveredNews.slice(0, topCount)

  // Fase 3: Enriquece cada uma
  const enrichedNews: Array<{ news: NewsItem; sources: string }> = []

  for (const news of topNews) {
    const { news: enrichedItem, additionalSources } = await enrichNewsItem(news, category)
    const formattedSources = formatSourcesForPrompt(enrichedItem, additionalSources)

    enrichedNews.push({
      news: enrichedItem,
      sources: formattedSources,
    })
  }

  return enrichedNews
}

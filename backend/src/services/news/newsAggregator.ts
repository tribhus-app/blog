import { fetchAllRSSFeeds, filterRecentNews, filterRelevantNews, filterNewsByCategory, calculateCategoryScore } from './rssService'
import { fetchNewsApiArticles, isNewsApiConfigured } from './newsApiService'
import { isTavilyConfigured, fetchAndEnrichNews } from './tavilyService'
import { NewsItem, AggregatedNews, CategoryConfig, getTodayCategory } from '../../types/ai'

/**
 * Remove noticias duplicadas baseado na URL
 */
function deduplicateNews(items: NewsItem[]): NewsItem[] {
  const seen = new Set<string>()
  const unique: NewsItem[] = []

  for (const item of items) {
    // Normaliza a URL removendo parametros de tracking
    const normalizedUrl = normalizeUrl(item.link)

    if (!seen.has(normalizedUrl)) {
      seen.add(normalizedUrl)
      unique.push(item)
    }
  }

  return unique
}

/**
 * Normaliza URL removendo parametros comuns de tracking
 */
function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url)
    // Remove parametros de tracking comuns
    const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid']
    trackingParams.forEach((param) => parsed.searchParams.delete(param))
    return parsed.toString().toLowerCase()
  } catch {
    return url.toLowerCase()
  }
}

/**
 * Ordena noticias por data (mais recentes primeiro)
 */
function sortByDate(items: NewsItem[]): NewsItem[] {
  return items.sort((a, b) => {
    const dateA = new Date(a.pubDate).getTime()
    const dateB = new Date(b.pubDate).getTime()
    return dateB - dateA
  })
}

/**
 * Calcula um score de relevancia para a noticia
 */
function calculateRelevanceScore(item: NewsItem): number {
  let score = 0
  const text = `${item.title} ${item.description}`.toLowerCase()

  // Palavras muito relevantes - Brasil (peso alto)
  const brazilKeywords = ['banda brasileira', 'rock brasileiro', 'metal brasileiro', 'brasil', 'brazilian']
  for (const keyword of brazilKeywords) {
    if (text.includes(keyword)) score += 15
  }

  // Palavras muito relevantes - Internacional (peso alto)
  const highPriorityKeywords = [
    'show', 'turne', 'tour', 'lancamento', 'release', 'announce',
    'new album', 'novo album', 'debut', 'premiere', 'estreia',
  ]
  for (const keyword of highPriorityKeywords) {
    if (text.includes(keyword)) score += 10
  }

  // Bandas famosas (peso alto)
  const famousBands = [
    'metallica', 'iron maiden', 'slayer', 'megadeth', 'judas priest',
    'ozzy', 'black sabbath', 'motorhead', 'ac/dc', 'guns n roses',
    'slipknot', 'korn', 'tool', 'pantera', 'sepultura', 'angra',
    'gojira', 'ghost', 'rammstein', 'nightwish', 'sabaton',
  ]
  for (const band of famousBands) {
    if (text.includes(band)) score += 12
  }

  // Palavras relevantes (peso medio)
  const mediumPriorityKeywords = [
    'album', 'single', 'clipe', 'video', 'festival', 'heavy metal', 'hard rock',
    'concert', 'live', 'tickets', 'sold out', 'headline',
  ]
  for (const keyword of mediumPriorityKeywords) {
    if (text.includes(keyword)) score += 5
  }

  // Penaliza noticias muito curtas
  if (item.description.length < 50) score -= 5

  // Bonus para noticias com imagem
  if (item.imageUrl) score += 2

  return score
}

/**
 * Agrega noticias de todas as fontes
 */
export async function aggregateNews(): Promise<AggregatedNews> {
  console.log('Iniciando agregacao de noticias...')

  const sources: string[] = []
  let allItems: NewsItem[] = []

  // Busca feeds RSS
  const rssItems = await fetchAllRSSFeeds()
  allItems.push(...rssItems)
  sources.push('RSS Feeds')

  // Busca NewsAPI (se configurado)
  if (isNewsApiConfigured()) {
    const newsApiItems = await fetchNewsApiArticles()
    allItems.push(...newsApiItems)
    sources.push('NewsAPI')
  }

  console.log(`Total bruto de noticias: ${allItems.length}`)

  // Filtra noticias recentes (ultimas 48 horas para ter mais opcoes)
  allItems = filterRecentNews(allItems, 48)
  console.log(`Apos filtro de data: ${allItems.length}`)

  // Filtra por relevancia
  allItems = filterRelevantNews(allItems)
  console.log(`Apos filtro de relevancia: ${allItems.length}`)

  // Remove duplicatas
  allItems = deduplicateNews(allItems)
  console.log(`Apos remocao de duplicatas: ${allItems.length}`)

  // Ordena por data
  allItems = sortByDate(allItems)

  // Adiciona score de relevancia e ordena
  const scoredItems = allItems.map((item) => ({
    item,
    score: calculateRelevanceScore(item),
  }))

  scoredItems.sort((a, b) => b.score - a.score)

  const finalItems = scoredItems.map((si) => si.item)

  console.log(`Noticias agregadas finais: ${finalItems.length}`)

  return {
    items: finalItems,
    fetchedAt: new Date(),
    sources,
  }
}

/**
 * Busca as melhores noticias para geracao de artigos
 * @param limit Numero maximo de noticias a retornar
 */
export async function getTopNewsForArticles(limit: number = 3): Promise<NewsItem[]> {
  const aggregated = await aggregateNews()
  return aggregated.items.slice(0, limit)
}

/**
 * Busca noticias filtradas por categoria especifica
 * @param category Configuracao da categoria
 * @param limit Numero maximo de noticias a retornar
 */
export async function getNewsForCategory(category: CategoryConfig, limit: number = 3): Promise<NewsItem[]> {
  console.log(`Buscando noticias para categoria: ${category.name}`)
  console.log(`Keywords: ${category.keywords.slice(0, 5).join(', ')}...`)

  const sources: string[] = []
  let allItems: NewsItem[] = []

  // Busca feeds RSS
  const rssItems = await fetchAllRSSFeeds()
  allItems.push(...rssItems)
  sources.push('RSS Feeds')

  // Busca NewsAPI (se configurado)
  if (isNewsApiConfigured()) {
    const newsApiItems = await fetchNewsApiArticles()
    allItems.push(...newsApiItems)
    sources.push('NewsAPI')
  }

  console.log(`Total bruto de noticias: ${allItems.length}`)

  // Filtra noticias recentes (ultimas 72 horas para ter mais opcoes por categoria)
  allItems = filterRecentNews(allItems, 72)
  console.log(`Apos filtro de data: ${allItems.length}`)

  // Filtra por categoria especifica
  allItems = filterNewsByCategory(allItems, category)
  console.log(`Apos filtro de categoria (${category.name}): ${allItems.length}`)

  // Remove duplicatas
  allItems = deduplicateNews(allItems)
  console.log(`Apos remocao de duplicatas: ${allItems.length}`)

  // Calcula score de relevancia para a categoria e ordena
  const scoredItems = allItems.map((item) => ({
    item,
    score: calculateCategoryScore(item, category),
  }))

  scoredItems.sort((a, b) => b.score - a.score)

  const finalItems = scoredItems.map((si) => si.item).slice(0, limit)

  console.log(`Noticias selecionadas para ${category.name}: ${finalItems.length}`)
  finalItems.forEach((item, i) => {
    console.log(`  ${i + 1}. ${item.title.substring(0, 60)}...`)
  })

  return finalItems
}

/**
 * Busca noticias para a categoria do dia (baseado no calendario editorial)
 * @param limit Numero maximo de noticias a retornar
 */
export async function getNewsForToday(limit: number = 3): Promise<{ category: CategoryConfig; news: NewsItem[] }> {
  const category = getTodayCategory()
  console.log(`Categoria do dia: ${category.name}`)

  const news = await getNewsForCategory(category, limit)

  return { category, news }
}

// ========================================
// NOVA FUNCAO COM TAVILY (RECOMENDADA)
// ========================================

export interface EnrichedNewsForArticle {
  news: NewsItem
  sources: string // Fontes formatadas para o prompt do Claude
}

/**
 * Busca noticias usando Tavily com enriquecimento de fontes
 * Esta e a funcao recomendada para geracao de artigos
 *
 * Fluxo:
 * 1. 12 buscas iniciais para descobrir noticias da categoria
 * 2. Seleciona as 3 melhores
 * 3. 6 buscas de enriquecimento para cada uma (18 buscas)
 * 4. Retorna as noticias com todas as fontes formatadas
 *
 * Total: ~30 buscas por execucao
 */
export async function getEnrichedNewsForToday(
  limit: number = 3
): Promise<{ category: CategoryConfig; enrichedNews: EnrichedNewsForArticle[] }> {
  const category = getTodayCategory()
  console.log(`\n========================================`)
  console.log(`CATEGORIA DO DIA: ${category.name}`)
  console.log(`========================================\n`)

  // Verifica se Tavily esta configurado
  if (!isTavilyConfigured()) {
    console.warn('TAVILY_API_KEY nao configurada. Usando fallback para RSS.')

    // Fallback para RSS
    const news = await getNewsForCategory(category, limit)
    const enrichedNews: EnrichedNewsForArticle[] = news.map(item => ({
      news: item,
      sources: formatLegacySources(item),
    }))

    return { category, enrichedNews }
  }

  // Usa Tavily para busca e enriquecimento
  const enrichedNews = await fetchAndEnrichNews(category, limit)

  console.log(`\n========================================`)
  console.log(`RESULTADO: ${enrichedNews.length} noticias enriquecidas`)
  console.log(`========================================\n`)

  return { category, enrichedNews }
}

/**
 * Formata fontes no estilo legado (para fallback RSS)
 */
function formatLegacySources(news: NewsItem): string {
  let formatted = `
=== FONTE PRINCIPAL ===
Titulo: ${news.title}
URL: ${news.link}
Fonte: ${news.source}
Data: ${news.pubDate}
Conteudo:
${news.content || news.description}
`

  if (news.videoUrl) {
    formatted += `\nVideo disponivel: ${news.videoUrl}`
  }

  formatted += `\n\nATENCAO: Apenas uma fonte disponivel. Escreva um artigo preciso baseado APENAS nesta fonte.`

  return formatted
}

/**
 * Busca noticias para uma categoria especifica usando Tavily
 */
export async function getEnrichedNewsForCategory(
  category: CategoryConfig,
  limit: number = 3
): Promise<EnrichedNewsForArticle[]> {
  console.log(`\n========================================`)
  console.log(`BUSCANDO PARA CATEGORIA: ${category.name}`)
  console.log(`========================================\n`)

  if (!isTavilyConfigured()) {
    console.warn('TAVILY_API_KEY nao configurada. Usando fallback para RSS.')

    const news = await getNewsForCategory(category, limit)
    return news.map(item => ({
      news: item,
      sources: formatLegacySources(item),
    }))
  }

  return fetchAndEnrichNews(category, limit)
}

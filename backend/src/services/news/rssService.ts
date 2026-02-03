import Parser from 'rss-parser'
import { NewsItem, RSS_FEEDS, RSSFeed, CategoryConfig } from '../../types/ai'

const parser = new Parser({
  timeout: 10000, // 10 segundos de timeout
  headers: {
    'User-Agent': 'Tribhus Blog RSS Reader/1.0',
  },
})

/**
 * Busca o conteudo completo de uma pagina para extrair video do YouTube
 */
async function fetchYouTubeFromPage(url: string): Promise<string | undefined> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 segundos

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Tribhus Blog Reader/1.0',
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) return undefined

    const html = await response.text()

    // Padroes de URL do YouTube na pagina
    const youtubePatterns = [
      /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
      /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    ]

    for (const pattern of youtubePatterns) {
      const match = html.match(pattern)
      if (match) {
        return `https://www.youtube.com/watch?v=${match[1]}`
      }
    }

    return undefined
  } catch (error) {
    // Silenciosamente ignora erros de fetch
    return undefined
  }
}

/**
 * Busca noticias de um feed RSS especifico
 */
async function fetchFeed(feed: RSSFeed): Promise<NewsItem[]> {
  try {
    console.log(`Buscando feed: ${feed.name} (${feed.url})`)

    const parsed = await parser.parseURL(feed.url)
    const items: NewsItem[] = []

    for (const item of parsed.items.slice(0, 10)) { // Limita a 10 itens por feed
      if (!item.title || !item.link) continue

      const videoUrl = extractYouTubeFromItem(item)
      items.push({
        title: item.title,
        description: item.contentSnippet || item.content || item.summary || '',
        link: item.link,
        pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
        source: feed.name,
        imageUrl: extractImageFromItem(item),
        content: item.content || item['content:encoded'] || '',
        videoUrl,
      })
      if (videoUrl) {
        console.log(`  Video encontrado: ${videoUrl}`)
      }
    }

    console.log(`Feed ${feed.name}: ${items.length} itens encontrados`)
    return items
  } catch (error) {
    console.error(`Erro ao buscar feed ${feed.name}:`, error)
    return []
  }
}

/**
 * Tenta extrair URL de imagem do item RSS
 */
function extractImageFromItem(item: any): string | undefined {
  // Tenta enclosure (comum em feeds de midia)
  if (item.enclosure?.url) {
    return item.enclosure.url
  }

  // Tenta media:content
  if (item['media:content']?.$.url) {
    return item['media:content'].$.url
  }

  // Tenta extrair do conteudo HTML
  if (item.content || item['content:encoded']) {
    const content = item.content || item['content:encoded']
    const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/)
    if (imgMatch) {
      return imgMatch[1]
    }
  }

  return undefined
}

/**
 * Tenta extrair URL de video do YouTube do item RSS
 */
function extractYouTubeFromItem(item: any): string | undefined {
  const content = item.content || item['content:encoded'] || item.description || ''
  const link = item.link || ''

  // Padroes de URL do YouTube
  const youtubePatterns = [
    // URLs padrao do YouTube
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]{11})/,
    // iframes do YouTube
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  ]

  // Procura no conteudo
  for (const pattern of youtubePatterns) {
    const match = content.match(pattern)
    if (match) {
      return `https://www.youtube.com/watch?v=${match[1]}`
    }
  }

  // Procura no link (as vezes o proprio item e um video)
  for (const pattern of youtubePatterns) {
    const match = link.match(pattern)
    if (match) {
      return `https://www.youtube.com/watch?v=${match[1]}`
    }
  }

  // Verifica se tem enclosure de video
  if (item.enclosure?.type?.includes('video')) {
    const videoUrl = item.enclosure.url
    // Verifica se e um link do YouTube
    for (const pattern of youtubePatterns) {
      const match = videoUrl.match(pattern)
      if (match) {
        return `https://www.youtube.com/watch?v=${match[1]}`
      }
    }
  }

  return undefined
}

/**
 * Busca noticias de todos os feeds RSS ativos
 */
export async function fetchAllRSSFeeds(): Promise<NewsItem[]> {
  const activeFeeds = RSS_FEEDS.filter((feed) => feed.active)
  const allItems: NewsItem[] = []

  // Busca todos os feeds em paralelo
  const results = await Promise.allSettled(
    activeFeeds.map((feed) => fetchFeed(feed))
  )

  for (const result of results) {
    if (result.status === 'fulfilled') {
      allItems.push(...result.value)
    }
  }

  console.log(`Total de itens RSS coletados: ${allItems.length}`)
  return allItems
}

/**
 * Filtra noticias dos ultimas 24 horas
 */
export function filterRecentNews(items: NewsItem[], hoursAgo: number = 24): NewsItem[] {
  const cutoff = new Date()
  cutoff.setHours(cutoff.getHours() - hoursAgo)

  return items.filter((item) => {
    const pubDate = new Date(item.pubDate)
    return pubDate >= cutoff
  })
}

/**
 * Filtra noticias relevantes (rock, metal, bandas)
 */
export function filterRelevantNews(items: NewsItem[]): NewsItem[] {
  const keywords = [
    // Portugues
    'rock', 'metal', 'banda', 'album', 'show', 'turne', 'concert',
    'heavy', 'hard rock', 'punk', 'grunge', 'gothic', 'death',
    'black metal', 'power metal', 'thrash', 'doom', 'stoner',
    'guitarrista', 'baterista', 'vocalista', 'baixista',
    'festival', 'lancamento', 'single', 'clipe', 'video',
    // Ingles
    'band', 'tour', 'release', 'announce', 'debut', 'premiere',
    'guitarist', 'drummer', 'vocalist', 'bassist', 'singer',
    'new album', 'new single', 'music video', 'live', 'concert',
    'headline', 'lineup', 'setlist', 'sold out', 'tickets',
    'iron maiden', 'metallica', 'slayer', 'megadeth', 'anthrax',
    'judas priest', 'ozzy', 'sabbath', 'motorhead', 'ac/dc',
    'guns n roses', 'led zeppelin', 'deep purple', 'kiss',
    'slipknot', 'korn', 'deftones', 'tool', 'avenged',
    'gojira', 'mastodon', 'lamb of god', 'trivium', 'disturbed',
  ]

  return items.filter((item) => {
    const text = `${item.title} ${item.description}`.toLowerCase()
    return keywords.some((keyword) => text.includes(keyword))
  })
}

/**
 * Filtra noticias por categoria especifica
 */
export function filterNewsByCategory(items: NewsItem[], category: CategoryConfig): NewsItem[] {
  return items.filter((item) => {
    const text = `${item.title} ${item.description}`.toLowerCase()
    // Precisa ter pelo menos uma keyword da categoria
    return category.keywords.some((keyword) => text.includes(keyword.toLowerCase()))
  })
}

/**
 * Calcula score de relevancia para uma categoria especifica
 */
export function calculateCategoryScore(item: NewsItem, category: CategoryConfig): number {
  let score = 0
  const text = `${item.title} ${item.description}`.toLowerCase()

  // Cada keyword da categoria encontrada adiciona pontos
  for (const keyword of category.keywords) {
    if (text.includes(keyword.toLowerCase())) {
      score += 5
    }
  }

  // Bonus se keyword estiver no titulo (mais relevante)
  const titleLower = item.title.toLowerCase()
  for (const keyword of category.keywords) {
    if (titleLower.includes(keyword.toLowerCase())) {
      score += 10
    }
  }

  // Bonus para noticias com imagem
  if (item.imageUrl) score += 2

  // Bonus MAIOR para noticias com video do YouTube
  if (item.videoUrl) score += 15

  // Penaliza noticias muito curtas
  if (item.description.length < 50) score -= 5

  return score
}

/**
 * Enriquece um NewsItem buscando video do YouTube na pagina original
 * Chamado antes de gerar o artigo para tentar encontrar videos
 */
export async function enrichNewsWithVideo(item: NewsItem): Promise<NewsItem> {
  // Se ja tem video, retorna como esta
  if (item.videoUrl) {
    return item
  }

  // Tenta buscar video da pagina original
  console.log(`Buscando video em: ${item.link}`)
  const videoUrl = await fetchYouTubeFromPage(item.link)

  if (videoUrl) {
    console.log(`Video encontrado: ${videoUrl}`)
    return { ...item, videoUrl }
  }

  console.log(`Nenhum video encontrado na pagina`)
  return item
}

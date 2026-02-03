import { NewsItem } from '../../types/ai'

const NEWSAPI_BASE_URL = 'https://newsapi.org/v2'

interface NewsApiArticle {
  title: string
  description: string
  url: string
  publishedAt: string
  source: { name: string }
  urlToImage: string | null
  content: string | null
}

interface NewsApiResponse {
  status: string
  totalResults: number
  articles: NewsApiArticle[]
}

/**
 * Busca noticias da NewsAPI
 * Nota: NewsAPI tem limite de 100 requests/dia no plano gratuito
 */
export async function fetchNewsApiArticles(
  query: string = 'rock brasil OR metal brasil OR banda brasileira'
): Promise<NewsItem[]> {
  const apiKey = process.env.NEWSAPI_KEY

  if (!apiKey) {
    console.log('NewsAPI key nao configurada, pulando...')
    return []
  }

  try {
    const params = new URLSearchParams({
      q: query,
      language: 'pt',
      sortBy: 'publishedAt',
      pageSize: '20',
      apiKey,
    })

    const response = await fetch(`${NEWSAPI_BASE_URL}/everything?${params}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('NewsAPI erro:', response.status, errorText)
      return []
    }

    const data = (await response.json()) as NewsApiResponse

    if (data.status !== 'ok') {
      console.error('NewsAPI retornou status:', data.status)
      return []
    }

    const items: NewsItem[] = data.articles.map((article) => ({
      title: article.title,
      description: article.description || '',
      link: article.url,
      pubDate: article.publishedAt,
      source: `NewsAPI - ${article.source.name}`,
      imageUrl: article.urlToImage || undefined,
      content: article.content || '',
    }))

    console.log(`NewsAPI: ${items.length} artigos encontrados`)
    return items
  } catch (error) {
    console.error('Erro ao buscar NewsAPI:', error)
    return []
  }
}

/**
 * Verifica se a NewsAPI esta configurada
 */
export function isNewsApiConfigured(): boolean {
  return !!process.env.NEWSAPI_KEY
}

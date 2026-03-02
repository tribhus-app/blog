import Anthropic from '@anthropic-ai/sdk'
import { GeneratedArticle, BandData, NewsItem, CategoryConfig } from '../../types/ai'
import {
  welcomeSystemPrompt,
  welcomePrompt,
  newsSystemPrompt,
  newsPrompt,
  getSystemPromptForCategory,
  generateUserPrompt,
} from './prompts'

// Inicializa o cliente Anthropic
const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
})

/**
 * Funcao generica para chamar o Claude e gerar artigos
 */
async function generateArticle(
  systemPrompt: string,
  userPrompt: string
): Promise<GeneratedArticle> {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192, // Aumentado para artigos mais longos
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    })

    // Extrai o texto da resposta
    const textContent = response.content.find((block) => block.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      throw new Error('Resposta do Claude nao contem texto')
    }

    // Parse do JSON retornado
    const jsonMatch = textContent.text.match(/```json\n?([\s\S]*?)\n?```/)
    let articleData: GeneratedArticle

    if (jsonMatch) {
      articleData = JSON.parse(jsonMatch[1])
    } else {
      // Tenta fazer parse direto se nao estiver em bloco de codigo
      articleData = JSON.parse(textContent.text)
    }

    // Validacao basica
    if (!articleData.title || !articleData.content) {
      throw new Error('Artigo gerado esta incompleto')
    }

    return articleData
  } catch (error) {
    console.error('Erro ao gerar artigo com Claude:', error)
    throw error
  }
}

/**
 * Gera artigo de boas-vindas para uma nova banda
 */
export async function generateWelcomeArticle(band: BandData, availableTags: string[] = []): Promise<GeneratedArticle> {
  console.log(`Gerando artigo de boas-vindas para banda: ${band.name}`)

  const systemPrompt = welcomeSystemPrompt()
  const userPrompt = welcomePrompt(band, availableTags)

  return generateArticle(systemPrompt, userPrompt)
}

/**
 * Gera artigo baseado em uma noticia
 */
export async function generateNewsArticle(news: NewsItem, category?: CategoryConfig, availableTags: string[] = []): Promise<GeneratedArticle> {
  console.log(`Gerando artigo para noticia: ${news.title}`)
  if (category) {
    console.log(`Categoria: ${category.name}`)
  }

  const systemPrompt = newsSystemPrompt(category)
  const userPrompt = newsPrompt(news, category, availableTags)

  return generateArticle(systemPrompt, userPrompt)
}

/**
 * Verifica se a API do Claude esta configurada
 */
export function isClaudeConfigured(): boolean {
  return !!process.env.CLAUDE_API_KEY
}

/**
 * Gera artigo usando fontes enriquecidas do Tavily
 * Esta e a funcao recomendada para uso com o novo sistema
 */
export async function generateArticleFromEnrichedSources(
  formattedSources: string,
  category: CategoryConfig,
  availableTags: string[] = []
): Promise<GeneratedArticle> {
  console.log(`Gerando artigo para categoria: ${category.name}`)
  console.log(`Tamanho das fontes: ${formattedSources.length} caracteres`)

  const systemPrompt = getSystemPromptForCategory(category)
  const userPrompt = generateUserPrompt(formattedSources, category, availableTags)

  return generateArticle(systemPrompt, userPrompt)
}

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  getAiSchedulerStatus,
  getAiJobsStatus,
  startAiScheduler,
  stopAiScheduler,
  generateNewsArticles,
  getNewsPreview,
  AiSchedulerStatus,
  AiJobsStatus,
  NewsPreviewItem,
} from '@/services/adminApi'
import { Toast, useToast } from '@/components/ui/Toast'

const CATEGORY_OPTIONS = [
  { slug: 'noticias', name: 'Noticias', color: '#e74c3c' },
  { slug: 'lancamentos', name: 'Lancamentos', color: '#2196F3' },
  { slug: 'novidades', name: 'Novidades', color: '#4CAF50' },
  { slug: 'tecnologia', name: 'Tecnologia', color: '#9C27B0' },
  { slug: 'eventos', name: 'Eventos', color: '#E91E63' },
  { slug: 'curiosidades', name: 'Curiosidades', color: '#FF9800' },
  { slug: 'reviews', name: 'Reviews', color: '#FFC107' },
]

// Mensagens de progresso para o sistema Tavily
const TAVILY_PROGRESS_MESSAGES = [
  { message: 'Iniciando busca com Tavily...', percent: 5 },
  { message: 'Buscando noticias na internet (12 buscas)...', percent: 15 },
  { message: 'Analisando e rankeando resultados...', percent: 25 },
  { message: 'Selecionando as 3 melhores noticias...', percent: 35 },
  { message: 'Enriquecendo noticia 1/3 com fontes adicionais...', percent: 45 },
  { message: 'Enriquecendo noticia 2/3 com fontes adicionais...', percent: 55 },
  { message: 'Enriquecendo noticia 3/3 com fontes adicionais...', percent: 65 },
  { message: 'Enviando para Claude AI...', percent: 75 },
  { message: 'Gerando artigo 1/3...', percent: 80 },
  { message: 'Gerando artigo 2/3...', percent: 85 },
  { message: 'Gerando artigo 3/3...', percent: 90 },
  { message: 'Salvando rascunhos...', percent: 95 },
]

export default function AdminAiPage() {
  const router = useRouter()
  const { showToast, ToastComponent } = useToast()

  const [schedulerStatus, setSchedulerStatus] = useState<AiSchedulerStatus | null>(null)
  const [jobsStatus, setJobsStatus] = useState<AiJobsStatus | null>(null)
  const [newsPreview, setNewsPreview] = useState<NewsPreviewItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isToggling, setIsToggling] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState<{ message: string; percent: number } | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setIsLoading(true)
      const [scheduler, jobs, preview] = await Promise.all([
        getAiSchedulerStatus(),
        getAiJobsStatus(),
        getNewsPreview(5),
      ])
      setSchedulerStatus(scheduler)
      setJobsStatus(jobs)
      setNewsPreview(preview.news)
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
      setMessage({ type: 'error', text: 'Erro ao carregar dados da IA' })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleToggleScheduler() {
    if (!schedulerStatus) return

    setIsToggling(true)
    setMessage(null)

    try {
      if (schedulerStatus.scheduler.enabled) {
        const result = await stopAiScheduler()
        setMessage({ type: result.success ? 'success' : 'error', text: result.message })
      } else {
        const result = await startAiScheduler()
        setMessage({ type: result.success ? 'success' : 'error', text: result.message })
      }
      await loadData()
    } catch (err) {
      setMessage({ type: 'error', text: 'Erro ao alterar scheduler' })
    } finally {
      setIsToggling(false)
    }
  }

  async function handleGenerateNow() {
    setIsGenerating(true)
    setMessage(null)
    setGenerationProgress(TAVILY_PROGRESS_MESSAGES[0])

    try {
      // Simula progresso enquanto aguarda
      let progressIndex = 0
      const progressInterval = setInterval(() => {
        progressIndex++
        if (progressIndex < TAVILY_PROGRESS_MESSAGES.length) {
          setGenerationProgress(TAVILY_PROGRESS_MESSAGES[progressIndex])
        }
      }, 8000) // ~8 segundos por etapa

      // Se nenhuma categoria selecionada, usa a do dia
      const categoryToUse = selectedCategory || undefined
      const result = await generateNewsArticles(categoryToUse)

      clearInterval(progressInterval)
      setGenerationProgress(null)

      if (result.success) {
        if (result.articlesGenerated && result.articlesGenerated > 0) {
          // Sucesso! Mostra toast com acao
          showToast({
            message: `${result.articlesGenerated} artigo(s) gerado(s) com sucesso!`,
            type: 'success',
            duration: 10000,
            action: {
              label: 'Ver Rascunhos',
              onClick: () => router.push('/admin/posts?status=draft'),
            },
          })

          setMessage({
            type: 'success',
            text: `${result.articlesGenerated} artigo(s) de "${result.category}" gerado(s)! Modo: ${result.searchMode === 'tavily' ? 'Tavily (enriquecido)' : 'RSS'}`,
          })
        } else if (result.message) {
          setMessage({
            type: 'success',
            text: result.message,
          })
        } else {
          setMessage({
            type: 'success',
            text: `Nenhum artigo novo para gerar em "${result.category}".`,
          })
        }
      } else {
        setMessage({
          type: 'error',
          text: result.error || 'Erro ao gerar artigos. Verifique os logs do servidor.',
        })
      }
      await loadData()
    } catch (err) {
      setGenerationProgress(null)
      setMessage({ type: 'error', text: 'Erro ao gerar artigos. Verifique os logs do servidor.' })
    } finally {
      setIsGenerating(false)
      setGenerationProgress(null)
    }
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleString('pt-BR')
  }

  function getDayHighlight(day: string) {
    const today = new Date()
    const dayNames = ['Domingo', 'Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta', 'Sabado']
    return dayNames[today.getDay()] === day
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const isClaudeConfigured = schedulerStatus?.config.claudeConfigured ?? false
  const isTavilyConfigured = schedulerStatus?.config.tavilyConfigured ?? false
  const searchMode = schedulerStatus?.config.searchMode ?? 'rss'

  return (
    <div className="space-y-6">
      {/* Toast */}
      {ToastComponent}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Geracao de Artigos com IA</h1>
          <p className="text-text-muted mt-1">
            Controle a geracao automatica de artigos usando Claude AI
          </p>
        </div>
      </div>

      {message && (
        <div
          className={`px-4 py-3 rounded-lg ${
            message.type === 'success'
              ? 'bg-accent-green/10 border border-accent-green/20 text-accent-green'
              : 'bg-accent-red/10 border border-accent-red/20 text-accent-red'
          }`}
        >
          {message.text}
        </div>
      )}

      {!isClaudeConfigured && (
        <div className="bg-accent-yellow/10 border border-accent-yellow/20 text-accent-yellow px-4 py-3 rounded-lg">
          <strong>Atencao:</strong> A chave CLAUDE_API_KEY nao esta configurada no servidor.
          Configure-a no arquivo .env para ativar a geracao de artigos.
        </div>
      )}

      {/* Status do modo de busca */}
      <div className={`px-4 py-3 rounded-lg flex items-center gap-3 ${
        isTavilyConfigured
          ? 'bg-accent-green/10 border border-accent-green/20'
          : 'bg-accent-yellow/10 border border-accent-yellow/20'
      }`}>
        <div className={`w-3 h-3 rounded-full ${isTavilyConfigured ? 'bg-accent-green' : 'bg-accent-yellow'}`} />
        <div>
          <span className={isTavilyConfigured ? 'text-accent-green' : 'text-accent-yellow'}>
            <strong>Modo de busca:</strong>{' '}
            {isTavilyConfigured ? (
              <>Tavily (busca enriquecida + anti-alucinacao)</>
            ) : (
              <>RSS (basico) - Configure TAVILY_API_KEY para busca enriquecida</>
            )}
          </span>
        </div>
      </div>

      {/* Alertas do sistema */}
      {schedulerStatus?.hasAlerts && schedulerStatus.alerts && schedulerStatus.alerts.length > 0 && (
        <div className="bg-accent-red/10 border border-accent-red/20 text-accent-red px-4 py-3 rounded-lg">
          <strong>Alertas:</strong>
          <ul className="mt-2 space-y-1">
            {schedulerStatus.alerts.map((alert, i) => (
              <li key={i} className="text-sm">- {alert.message}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Calendario Editorial */}
      <div className="bg-dark-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Calendario Editorial</h2>
          {schedulerStatus?.todayCategory && (
            <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm">
              Hoje: {schedulerStatus.todayCategory.name}
            </span>
          )}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {schedulerStatus?.editorialCalendar.map((item, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg text-center transition-all ${
                getDayHighlight(item.day)
                  ? 'bg-primary text-white ring-2 ring-primary ring-offset-2 ring-offset-dark-card'
                  : 'bg-dark text-text-secondary'
              }`}
            >
              <div className="text-xs font-medium mb-1">{item.day.substring(0, 3)}</div>
              <div className={`text-sm font-semibold ${getDayHighlight(item.day) ? 'text-white' : 'text-white'}`}>
                {item.category}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Status do Scheduler e Geracao Manual */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-dark-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Scheduler Automatico</h2>
            <span
              className={`px-3 py-1 rounded-full text-sm ${
                schedulerStatus?.scheduler.enabled
                  ? 'bg-accent-green/10 text-accent-green'
                  : 'bg-accent-red/10 text-accent-red'
              }`}
            >
              {schedulerStatus?.scheduler.enabled ? 'Ligado' : 'Desligado'}
            </span>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex justify-between">
              <span className="text-text-muted">Horario de execucao:</span>
              <span className="text-white">{schedulerStatus?.config.schedule}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Proxima execucao:</span>
              <span className="text-white">{formatDate(schedulerStatus?.scheduler.nextRun ?? null)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Ultima execucao:</span>
              <span className="text-white">{formatDate(schedulerStatus?.scheduler.lastRun ?? null)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Artigos por execucao:</span>
              <span className="text-white">{schedulerStatus?.config.maxArticlesPerRun}</span>
            </div>
          </div>

          <button
            onClick={handleToggleScheduler}
            disabled={isToggling || !isClaudeConfigured}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
              schedulerStatus?.scheduler.enabled
                ? 'bg-accent-red hover:bg-accent-red/80 text-white'
                : 'bg-accent-green hover:bg-accent-green/80 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isToggling ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : schedulerStatus?.scheduler.enabled ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
                Parar Scheduler
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Iniciar Scheduler
              </>
            )}
          </button>
        </div>

        {/* Geracao Manual */}
        <div className="bg-dark-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Geracao Manual</h2>

          <p className="text-text-muted mb-4">
            Escolha uma categoria ou use a categoria do dia para gerar artigos.
          </p>

          {/* Seletor de Categoria */}
          <div className="mb-4">
            <label className="block text-sm text-text-muted mb-2">Categoria:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-dark border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isGenerating}
            >
              <option value="">Usar categoria do dia ({schedulerStatus?.todayCategory?.name})</option>
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-dark rounded-lg p-4 mb-4">
            <h3 className="text-white font-medium mb-2">Como funciona{isTavilyConfigured ? ' (Tavily)' : ' (RSS)'}:</h3>
            <ul className="text-text-muted text-sm space-y-1">
              {isTavilyConfigured ? (
                <>
                  <li>1. Tavily busca noticias na internet (12 buscas)</li>
                  <li>2. Seleciona as 3 melhores noticias</li>
                  <li>3. Enriquece cada uma com 6 buscas adicionais</li>
                  <li>4. Claude gera artigos com multiplas fontes</li>
                  <li>5. Salva como rascunho (anti-alucinacao ativo)</li>
                </>
              ) : (
                <>
                  <li>1. Busca noticias dos feeds RSS</li>
                  <li>2. Seleciona as 3 melhores</li>
                  <li>3. Gera artigos originais com Claude AI</li>
                  <li>4. Salva como rascunho para revisao</li>
                </>
              )}
            </ul>
            <p className="text-text-muted text-xs mt-3">
              Tempo estimado: {isTavilyConfigured ? '2-3 minutos' : '1-2 minutos'}
            </p>
          </div>

          <button
            onClick={handleGenerateNow}
            disabled={isGenerating || !isClaudeConfigured}
            className="w-full py-3 px-4 rounded-lg font-medium bg-primary hover:bg-primary-hover text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Gerando artigos...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Gerar Artigos Agora
              </>
            )}
          </button>

          {/* Barra de Progresso Detalhada */}
          {isGenerating && generationProgress && (
            <div className="mt-4 p-4 bg-dark rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-white text-sm font-medium">{generationProgress.message}</span>
              </div>
              <div className="w-full bg-border rounded-full h-2 mb-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${generationProgress.percent}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-text-muted">
                <span>{generationProgress.percent}%</span>
                <span>~{Math.ceil((100 - generationProgress.percent) / 10 * 8)} segundos restantes</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview de Noticias */}
      <div className="bg-dark-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Preview - Noticias Disponiveis</h2>
          <button
            onClick={loadData}
            className="text-primary hover:text-primary-hover text-sm flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Atualizar
          </button>
        </div>

        {newsPreview.length > 0 ? (
          <ul className="space-y-3">
            {newsPreview.map((news, index) => (
              <li key={index} className="flex items-start gap-3 py-3 border-b border-border last:border-0">
                <div className="flex-1 min-w-0">
                  <a
                    href={news.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-primary transition-colors block truncate"
                  >
                    {news.title}
                  </a>
                  <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
                    <span>{news.source}</span>
                    <span>{new Date(news.pubDate).toLocaleDateString('pt-BR')}</span>
                    {news.hasImage && (
                      <span className="text-accent-green">Com imagem</span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-text-muted text-center py-8">
            Nenhuma noticia disponivel no momento
          </p>
        )}
      </div>

      {/* Info sobre fontes */}
      <div className="bg-dark-card border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Fontes de Noticias</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {isTavilyConfigured ? (
            <>
              <div>
                <h3 className="text-white font-medium mb-2">Tavily (Busca Global)</h3>
                <ul className="text-text-muted space-y-1">
                  <li>- Busca em toda a internet</li>
                  <li>- Cobertura global (Brasil, EUA, Europa, Asia)</li>
                  <li>- Multiplas fontes por artigo</li>
                  <li>- Anti-alucinacao ativo</li>
                </ul>
              </div>
              <div>
                <h3 className="text-white font-medium mb-2">Buscas por Categoria</h3>
                <ul className="text-text-muted space-y-1">
                  <li>- 12 buscas de descoberta</li>
                  <li>- 18 buscas de enriquecimento</li>
                  <li>- ~30 buscas por geracao</li>
                  <li>- 1000 buscas/mes (gratis)</li>
                </ul>
              </div>
            </>
          ) : (
            <>
              <div>
                <h3 className="text-white font-medium mb-2">Brasil</h3>
                <ul className="text-text-muted space-y-1">
                  <li>- Whiplash</li>
                  <li>- Roadie Crew</li>
                  <li>- Rock Brazuca</li>
                  <li>- Tenho Mais Discos</li>
                </ul>
              </div>
              <div>
                <h3 className="text-white font-medium mb-2">Internacional</h3>
                <ul className="text-text-muted space-y-1">
                  <li>- Blabbermouth (EUA)</li>
                  <li>- Loudwire (EUA)</li>
                  <li>- Metal Injection (EUA)</li>
                  <li>- Metal Hammer UK (Europa)</li>
                  <li>- Kerrang (Europa)</li>
                  <li>- + outros...</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
